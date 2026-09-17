-- ============================================================================
-- 018_fix_study_groups_rls_recursion.sql
-- Corrective Migration: Eliminate infinite recursion in Study Groups RLS Policies
-- ============================================================================
-- 1. Separates public group discovery from member checks to eliminate groups <-> group_members RLS recursion.
-- 2. Employs strictly-scoped SECURITY DEFINER functions (is_group_member, is_group_admin, is_group_owner, is_group_public)
--    with explicit search_path set to public, pg_catalog.
-- 3. Preserves full security: public vs private discovery, admin/owner privileges, friend-only invitations,
--    message isolation, and atomic RPC security.
-- ============================================================================

-- ─── 1. SECURITY DEFINER AUTHORIZATION HELPERS ─────────────────────────────
-- Ensure helper functions exist and operate with bypass-RLS SECURITY DEFINER context

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = COALESCE(p_user_id, auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_owner(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_public(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
      AND is_private = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_creator(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
      AND created_by = COALESCE(p_user_id, auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_group_invite(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_invites
    WHERE group_id = p_group_id
      AND invitee_id = COALESCE(p_user_id, auth.uid())
      AND status = 'pending'
  );
$$;

-- Scope function execution permissions strictly to authenticated users
REVOKE ALL ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_admin(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_owner(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_owner(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_public(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_creator(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_group_invite(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_group_invite(uuid, uuid) TO authenticated;


-- ─── 2. REBUILD POLICIES ON PUBLIC.GROUPS ───────────────────────────────────

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public groups are discoverable and private groups are member-only" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can discover public groups" ON public.groups;
DROP POLICY IF EXISTS "Members and invitees can view private groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Owners and admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Owners can delete groups" ON public.groups;

-- Policy A1: Public groups discovery with zero subquery evaluation
CREATE POLICY "Authenticated users can discover public groups"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    is_private = false
  );

-- Policy A2: Private groups visibility evaluated safely using SECURITY DEFINER functions
CREATE POLICY "Members and invitees can view private groups"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    is_private = true
    AND (
      created_by = auth.uid()
      OR public.is_group_member(id, auth.uid())
      OR public.has_group_invite(id, auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Owners and admins can update groups"
  ON public.groups
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_group_admin(id, auth.uid())
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.is_group_admin(id, auth.uid())
  );

CREATE POLICY "Owners can delete groups"
  ON public.groups
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_group_owner(id, auth.uid())
  );


-- ─── 3. REBUILD POLICIES ON PUBLIC.GROUP_MEMBERS ─────────────────────────────

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view membership and public groups allow member listing" ON public.group_members;
DROP POLICY IF EXISTS "Public group members are viewable" ON public.group_members;
DROP POLICY IF EXISTS "Members can view private group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups or accept invites" ON public.group_members;
DROP POLICY IF EXISTS "Owners and admins can update member roles" ON public.group_members;
DROP POLICY IF EXISTS "Members can leave or admins can remove members" ON public.group_members;

-- Policy B1: Public group member list viewable via safe function check
CREATE POLICY "Public group members are viewable"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    public.is_group_public(group_id)
  );

-- Policy B2: Private group member listing for self and co-members
CREATE POLICY "Members can view private group memberships"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "Users can join public groups or accept invites"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_group_creator(group_id, auth.uid())
      OR public.is_group_public(group_id)
      OR EXISTS (
        SELECT 1 FROM public.group_invites gi
        WHERE gi.group_id = public.group_members.group_id
          AND gi.invitee_id = auth.uid()
          AND gi.status = 'accepted'
      )
    )
  );

CREATE POLICY "Owners and admins can update member roles"
  ON public.group_members
  FOR UPDATE
  TO authenticated
  USING (
    public.is_group_owner(group_id, auth.uid())
  );

CREATE POLICY "Members can leave or admins can remove members"
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      public.is_group_admin(group_id, auth.uid())
      AND role != 'owner'
    )
  );


-- ─── 4. REBUILD POLICIES ON PUBLIC.GROUP_INVITES ─────────────────────────────

ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invited users and group members can view invites" ON public.group_invites;
DROP POLICY IF EXISTS "Group members can invite accepted friends" ON public.group_invites;
DROP POLICY IF EXISTS "Invitees and inviters can update invite status" ON public.group_invites;

CREATE POLICY "Invited users and group members can view invites"
  ON public.group_invites
  FOR SELECT
  TO authenticated
  USING (
    invitee_id = auth.uid()
    OR inviter_id = auth.uid()
    OR public.is_group_admin(group_id, auth.uid())
  );

CREATE POLICY "Group members can invite accepted friends"
  ON public.group_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = inviter_id
    AND inviter_id != invitee_id
    AND public.is_group_member(group_id, auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = auth.uid() AND f.addressee_id = invitee_id)
          OR (f.addressee_id = auth.uid() AND f.requester_id = invitee_id)
        )
    )
    AND NOT public.is_group_member(group_id, invitee_id)
  );

CREATE POLICY "Invitees and inviters can update invite status"
  ON public.group_invites
  FOR UPDATE
  TO authenticated
  USING (
    invitee_id = auth.uid()
    OR inviter_id = auth.uid()
  )
  WITH CHECK (
    invitee_id = auth.uid()
    OR inviter_id = auth.uid()
  );


-- ─── 5. REBUILD POLICIES ON PUBLIC.GROUP_MESSAGES ────────────────────────────

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only group members can read messages" ON public.group_messages;
DROP POLICY IF EXISTS "Only group members can send messages" ON public.group_messages;
DROP POLICY IF EXISTS "Senders and admins can soft delete messages" ON public.group_messages;

CREATE POLICY "Only group members can read messages"
  ON public.group_messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "Only group members can send messages"
  ON public.group_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "Senders and admins can soft delete messages"
  ON public.group_messages
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR public.is_group_admin(group_id, auth.uid())
  )
  WITH CHECK (
    auth.uid() = sender_id
    OR public.is_group_admin(group_id, auth.uid())
  );
