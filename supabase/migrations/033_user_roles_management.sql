-- ============================================================================
-- 033_user_roles_management.sql
-- Production Migration: Role-Based Access Control & User Roles Management
-- ============================================================================
-- Establishes four canonical platform roles:
-- 1. user        - Standard student platform access
-- 2. moderator   - Social feature moderation (chat reports, muting/banning)
-- 3. admin       - Administrative tool access (system controls, logs, metrics)
-- 4. superadmin  - Exclusive authority to manage roles & security permissions
-- ============================================================================

-- ─── 1. ROLE COLUMN ON PROFILES ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'moderator', 'admin', 'superadmin'));

-- Migrate existing admins to superadmin if first admin, otherwise admin
UPDATE public.profiles
SET role = 'superadmin'
WHERE is_admin = true AND role = 'user';

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- ─── 2. ROLE & IS_ADMIN SYNC TRIGGER ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_profile_role_and_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Keep is_admin aligned with role
  IF NEW.role IN ('admin', 'superadmin') THEN
    NEW.is_admin := true;
  ELSE
    NEW.is_admin := false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;
CREATE TRIGGER trg_sync_profile_role
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_and_admin();

-- ─── 3. PREVENT USERS FROM ALTERING THEIR OWN ROLE ──────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role is unchanged, allow
  IF OLD.role IS NOT DISTINCT FROM NEW.role AND OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin THEN
    RETURN NEW;
  END IF;

  -- Get caller's role
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Only superadmins are authorized to alter roles or is_admin
  IF caller_role != 'superadmin' THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can assign or revoke privileged roles.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ─── 4. HELPER FUNCTIONS FOR RLS & SERVER LOGIC ─────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = p_user_id),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('moderator', 'admin', 'superadmin') OR is_admin = true FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator() TO authenticated;
