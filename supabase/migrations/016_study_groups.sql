-- ============================================================================
-- 016_study_groups.sql
-- Production Migration: JEE Pro Study Groups System (Phase 7)
-- ============================================================================
-- Creates groups, group_members, group_invites, and group_messages tables,
-- enforces membership and invite uniqueness, configures Supabase Realtime publication,
-- implements strict Row-Level Security (RLS) policies, and provides atomic RPCs.
-- ============================================================================

-- ─── 1. GROUPS TABLE ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.groups (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 60),
  description  text        CHECK (description IS NULL OR length(description) <= 500),
  avatar_icon  text        NOT NULL DEFAULT 'book',
  avatar_color text        NOT NULL DEFAULT 'blue',
  is_private   boolean     NOT NULL DEFAULT false,
  created_by   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_count int         NOT NULL DEFAULT 1 CHECK (member_count >= 0),
  created_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_groups_public_created
  ON public.groups (created_at DESC)
  WHERE is_private = false;

CREATE INDEX IF NOT EXISTS idx_groups_created_by
  ON public.groups (created_by);

CREATE INDEX IF NOT EXISTS idx_groups_updated_at
  ON public.groups (updated_at DESC);


-- ─── 2. GROUP MEMBERS TABLE ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id  uuid        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      text        NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user_joined
  ON public.group_members (user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_members_group_role
  ON public.group_members (group_id, role);


-- ─── 3. GROUP INVITES TABLE ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_invites (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_group_invites_no_self CHECK (inviter_id != invitee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_group_invites_pending
  ON public.group_invites (group_id, invitee_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_group_invites_invitee
  ON public.group_invites (invitee_id, status);

CREATE INDEX IF NOT EXISTS idx_group_invites_group
  ON public.group_invites (group_id, status);


-- ─── 4. GROUP MESSAGES TABLE ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text        NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 1000),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamptz DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_group_messages_active
  ON public.group_messages (group_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_group_messages_created
  ON public.group_messages (group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_messages_sender
  ON public.group_messages (sender_id);


-- ─── 5. MEMBER COUNT & TOUCH TRIGGERS ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_group_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups
    SET member_count = (
      SELECT count(*) FROM public.group_members WHERE group_id = NEW.group_id
    ),
    updated_at = timezone('utc'::text, now())
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups
    SET member_count = (
      SELECT count(*) FROM public.group_members WHERE group_id = OLD.group_id
    ),
    updated_at = timezone('utc'::text, now())
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_group_member_count ON public.group_members;
CREATE TRIGGER trg_sync_group_member_count
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_group_member_count();

CREATE OR REPLACE FUNCTION public.touch_group_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.groups
  SET updated_at = timezone('utc'::text, now())
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_group_on_message ON public.group_messages;
CREATE TRIGGER trg_touch_group_on_message
  AFTER INSERT ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_group_on_message();


-- ─── 6. SUPABASE REALTIME PUBLICATION ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'group_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'group_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'group_invites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_invites;
  END IF;
END $$;


-- ─── 7. ROW LEVEL SECURITY (RLS) POLICIES & AUTHORIZATION HELPERS ───────────

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- ─── 7.1. SECURITY DEFINER AUTHORIZATION HELPERS ─────────────────────────────
-- These functions break circular RLS recursion between groups and group_members
-- by evaluating authorization directly without triggering child table RLS policies.

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

-- Grant tightly scoped execute permissions to authenticated users
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


-- ─── 7.2. RLS POLICIES ────────────────────────────────────────────────────────

-- Clean existing policies if re-run
DROP POLICY IF EXISTS "Public groups are discoverable and private groups are member-only" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Owners and admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Owners can delete groups" ON public.groups;

DROP POLICY IF EXISTS "Members can view membership and public groups allow member listing" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups or accept invites" ON public.group_members;
DROP POLICY IF EXISTS "Owners and admins can update member roles" ON public.group_members;
DROP POLICY IF EXISTS "Members can leave or admins can remove members" ON public.group_members;

DROP POLICY IF EXISTS "Invited users and group members can view invites" ON public.group_invites;
DROP POLICY IF EXISTS "Group members can invite accepted friends" ON public.group_invites;
DROP POLICY IF EXISTS "Invitees and inviters can update invite status" ON public.group_invites;

DROP POLICY IF EXISTS "Only group members can read messages" ON public.group_messages;
DROP POLICY IF EXISTS "Only group members can send messages" ON public.group_messages;
DROP POLICY IF EXISTS "Senders and admins can soft delete messages" ON public.group_messages;

-- A. GROUPS POLICIES
CREATE POLICY "Public groups are discoverable and private groups are member-only"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
    OR public.has_group_invite(id, auth.uid())
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

-- B. GROUP MEMBERS POLICIES
CREATE POLICY "Members can view membership and public groups allow member listing"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_public(group_id)
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
    -- Member leaves voluntarily
    auth.uid() = user_id
    -- Or Owner/Admin removes a non-owner member
    OR (
      public.is_group_admin(group_id, auth.uid())
      AND role != 'owner'
    )
  );

-- C. GROUP INVITES POLICIES
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
    -- Caller must be a member of the group
    AND public.is_group_member(group_id, auth.uid())
    -- Invitee must be an accepted friend
    AND EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = auth.uid() AND f.addressee_id = invitee_id)
          OR (f.addressee_id = auth.uid() AND f.requester_id = invitee_id)
        )
    )
    -- Invitee must not already be in the group
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

-- D. GROUP MESSAGES POLICIES
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


-- ─── 8. ATOMIC RPC FUNCTIONS ─────────────────────────────────────────────────

-- Function: create_study_group
-- Atomically creates the group and adds creator as 'owner' in group_members
CREATE OR REPLACE FUNCTION public.create_study_group(
  p_name text,
  p_description text DEFAULT NULL,
  p_avatar_icon text DEFAULT 'book',
  p_avatar_color text DEFAULT 'blue',
  p_is_private boolean DEFAULT false
)
RETURNS public.groups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_group public.groups;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) < 2 OR length(p_name) > 60 THEN
    RAISE EXCEPTION 'Group name must be between 2 and 60 characters';
  END IF;

  -- Insert group
  INSERT INTO public.groups (
    name,
    description,
    avatar_icon,
    avatar_color,
    is_private,
    created_by,
    member_count,
    created_at,
    updated_at
  ) VALUES (
    trim(p_name),
    nullif(trim(p_description), ''),
    COALESCE(nullif(trim(p_avatar_icon), ''), 'book'),
    COALESCE(nullif(trim(p_avatar_color), ''), 'blue'),
    COALESCE(p_is_private, false),
    v_user_id,
    1,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING * INTO v_group;

  -- Insert creator as owner
  INSERT INTO public.group_members (
    group_id,
    user_id,
    role,
    joined_at
  ) VALUES (
    v_group.id,
    v_user_id,
    'owner',
    timezone('utc'::text, now())
  );

  RETURN v_group;
END;
$$;

-- Function: join_public_group
-- Allows authenticated user to join a public group with deduplication
CREATE OR REPLACE FUNCTION public.join_public_group(
  p_group_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_is_private boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  SELECT is_private INTO v_is_private
  FROM public.groups
  WHERE id = p_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  IF v_is_private THEN
    RAISE EXCEPTION 'Cannot join a private group without an invite';
  END IF;

  -- Insert member if not already joined
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (p_group_id, v_user_id, 'member', timezone('utc'::text, now()))
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN true;
END;
$$;

-- Function: leave_study_group
-- Allows a member to leave. Owner cannot leave if others remain without transferring ownership.
CREATE OR REPLACE FUNCTION public.leave_study_group(
  p_group_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_role text;
  v_total_members int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  SELECT role INTO v_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;

  SELECT count(*) INTO v_total_members
  FROM public.group_members
  WHERE group_id = p_group_id;

  IF v_role = 'owner' AND v_total_members > 1 THEN
    RAISE EXCEPTION 'Group owner cannot leave while other members remain. Promote another member to owner first.';
  END IF;

  -- If last member/owner leaves, remove the group entirely
  IF v_total_members <= 1 THEN
    DELETE FROM public.groups WHERE id = p_group_id;
  ELSE
    DELETE FROM public.group_members WHERE group_id = p_group_id AND user_id = v_user_id;
  END IF;

  RETURN true;
END;
$$;

-- Function: send_group_invite
-- Verifies friendship, sends invite, and creates user notification
CREATE OR REPLACE FUNCTION public.send_group_invite(
  p_group_id uuid,
  p_invitee_id uuid
)
RETURNS public.group_invites
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_group_name text;
  v_inviter_name text;
  v_invite public.group_invites;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  IF v_user_id = p_invitee_id THEN
    RAISE EXCEPTION 'Cannot invite yourself to a group';
  END IF;

  -- 1. Ensure caller is a member
  SELECT name INTO v_group_name
  FROM public.groups g
  JOIN public.group_members gm ON gm.group_id = g.id
  WHERE g.id = p_group_id AND gm.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You must be a member of this group to invite friends';
  END IF;

  -- 2. Ensure invitee is an accepted friend
  IF NOT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (requester_id = v_user_id AND addressee_id = p_invitee_id)
        OR (addressee_id = v_user_id AND requester_id = p_invitee_id)
      )
  ) THEN
    RAISE EXCEPTION 'You can only invite accepted friends to study groups';
  END IF;

  -- 3. Ensure invitee is not already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_invitee_id
  ) THEN
    RAISE EXCEPTION 'This friend is already a member of the group';
  END IF;

  -- 4. Check for existing pending invite
  SELECT * INTO v_invite
  FROM public.group_invites
  WHERE group_id = p_group_id AND invitee_id = p_invitee_id AND status = 'pending';

  IF v_invite.id IS NOT NULL THEN
    RETURN v_invite;
  END IF;

  -- 5. Insert new invite
  INSERT INTO public.group_invites (
    group_id,
    inviter_id,
    invitee_id,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_group_id,
    v_user_id,
    p_invitee_id,
    'pending',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING * INTO v_invite;

  -- 6. Send in-app notification to invitee
  SELECT COALESCE(full_name, 'A friend') INTO v_inviter_name
  FROM public.profiles
  WHERE id = v_user_id;

  INSERT INTO public.notifications (
    user_id,
    target_user_id,
    target_type,
    title,
    message,
    type,
    metadata,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_invitee_id,
    p_invitee_id,
    'user',
    'Study Group Invitation',
    v_inviter_name || ' invited you to join "' || v_group_name || '"',
    'info',
    jsonb_build_object(
      'type', 'group_invite',
      'group_id', p_group_id,
      'invite_id', v_invite.id,
      'actor_id', v_user_id
    ),
    v_user_id,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  RETURN v_invite;
END;
$$;

-- Function: respond_group_invite
-- Allows invitee to accept or decline group invite
CREATE OR REPLACE FUNCTION public.respond_group_invite(
  p_invite_id uuid,
  p_accept boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_invite public.group_invites;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  SELECT * INTO v_invite
  FROM public.group_invites
  WHERE id = p_invite_id AND invitee_id = v_user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or already responded';
  END IF;

  IF p_accept THEN
    UPDATE public.group_invites
    SET status = 'accepted', updated_at = timezone('utc'::text, now())
    WHERE id = p_invite_id;

    INSERT INTO public.group_members (group_id, user_id, role, joined_at)
    VALUES (v_invite.group_id, v_user_id, 'member', timezone('utc'::text, now()))
    ON CONFLICT (group_id, user_id) DO NOTHING;
  ELSE
    UPDATE public.group_invites
    SET status = 'declined', updated_at = timezone('utc'::text, now())
    WHERE id = p_invite_id;
  END IF;

  RETURN true;
END;
$$;

-- Function: remove_group_member
-- Allows group owner or admin to kick a member
CREATE OR REPLACE FUNCTION public.remove_group_member(
  p_group_id uuid,
  p_target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
  v_caller_role text;
  v_target_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  IF v_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'Use leave_study_group to leave the group';
  END IF;

  SELECT role INTO v_caller_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = v_user_id;

  IF v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only group owners or admins can remove members';
  END IF;

  SELECT role INTO v_target_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user is not a member of this group';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove the group owner';
  END IF;

  IF v_caller_role = 'admin' AND v_target_role = 'admin' THEN
    RAISE EXCEPTION 'Admins cannot remove other admins. Only the owner can.';
  END IF;

  DELETE FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_target_user_id;

  RETURN true;
END;
$$;

-- Grant execution permissions on all group RPCs
REVOKE ALL ON FUNCTION public.create_study_group(text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_study_group(text, text, text, text, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.join_public_group(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_public_group(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.leave_study_group(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leave_study_group(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.send_group_invite(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_group_invite(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.respond_group_invite(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_group_invite(uuid, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.remove_group_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_group_member(uuid, uuid) TO authenticated, service_role;
