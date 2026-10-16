"use server";

import { createClient } from "@/lib/supabase/server";
import { forbidden } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/features/admin/types/roles.types";
import { normalizeUserRole } from "@/features/admin/types/roles.types";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  role: UserRole;
  created_at: string;
}

export interface AdminSession {
  user: User;
  profile: AdminProfile;
}

interface RawProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  role?: string | null;
  created_at: string;
}

/**
 * Resilient profile fetcher that queries `role` and `is_admin`,
 * but gracefully falls back to `is_admin` if the `role` column hasn't
 * been migrated yet on the remote database (PostgREST error 42703).
 */
async function fetchProfileForVerification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ profile: RawProfile | null; error: unknown }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, is_admin, role, created_at")
    .eq("id", userId)
    .single();

  // If role column is missing on remote schema, fallback to is_admin
  const errObj = error as { code?: string; message?: string } | null;
  if (errObj && (errObj.code === "42703" || errObj.message?.includes("role"))) {
    const fallback = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, is_admin, created_at")
      .eq("id", userId)
      .single();

    if (fallback.data) {
      return {
        profile: {
          ...fallback.data,
          role: fallback.data.is_admin ? "superadmin" : "user",
        },
        error: null,
      };
    }
    return { profile: null, error: fallback.error };
  }

  return { profile: profile as RawProfile | null, error };
}

/**
 * Lightweight role & is_admin fetcher with fallback.
 */
async function fetchRoleAndAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ is_admin: boolean; role?: string | null } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", userId)
    .single();

  if (!error && data) {
    return data as { is_admin: boolean; role?: string | null };
  }

  const errObj = error as { code?: string; message?: string } | null;
  if (errObj && (errObj.code === "42703" || errObj.message?.includes("role"))) {
    const fallback = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (fallback.data) {
      return {
        is_admin: fallback.data.is_admin,
        role: fallback.data.is_admin ? "superadmin" : "user",
      };
    }
  }

  return null;
}

/**
 * Server-side admin verification. Must be called from Server Components,
 * Server Actions, or Route Handlers only.
 *
 * Verifies the user has 'admin' or 'superadmin' privileges (or is_admin = true).
 * Calls forbidden() if unauthorized.
 */
export async function verifyAdmin(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    forbidden();
  }

  const { profile, error: profileError } = await fetchProfileForVerification(supabase, user.id);

  const effectiveRole = normalizeUserRole(profile?.role, profile?.is_admin);

  if (profileError || (!profile?.is_admin && effectiveRole !== "admin" && effectiveRole !== "superadmin")) {
    forbidden();
  }

  return {
    user,
    profile: {
      ...profile,
      role: effectiveRole,
    } as AdminProfile,
  };
}

/**
 * Server-side Superadmin / Owner verification.
 * Strictly verifies the authenticated user has the 'superadmin' role.
 * Calls forbidden() if unauthorized.
 */
export async function verifySuperAdmin(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    forbidden();
  }

  const { profile, error: profileError } = await fetchProfileForVerification(supabase, user.id);

  const effectiveRole = normalizeUserRole(profile?.role, profile?.is_admin);

  // If role is explicitly superadmin, or fallback if legacy single-admin setup:
  const isSuper = effectiveRole === "superadmin" || (profile?.is_admin && (!profile?.role || profile?.role === "admin"));

  if (profileError || !isSuper) {
    forbidden();
  }

  return {
    user,
    profile: {
      ...profile,
      role: "superadmin",
    } as AdminProfile,
  };
}

/**
 * Server-side Moderator verification.
 * Allows moderators, admins, and superadmins to perform moderation actions.
 */
export async function verifyModerator(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    forbidden();
  }

  const { profile, error: profileError } = await fetchProfileForVerification(supabase, user.id);

  const effectiveRole = normalizeUserRole(profile?.role, profile?.is_admin);
  const isAuthorized = effectiveRole === "moderator" || effectiveRole === "admin" || effectiveRole === "superadmin" || profile?.is_admin;

  if (profileError || !isAuthorized) {
    forbidden();
  }

  return {
    user,
    profile: {
      ...profile,
      role: effectiveRole,
    } as AdminProfile,
  };
}

/**
 * Lightweight check if the current user is a Superadmin.
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const data = await fetchRoleAndAdmin(supabase, user.id);
  const role = normalizeUserRole(data?.role, data?.is_admin);
  return role === "superadmin" || (data?.is_admin === true && (!data?.role || data?.role === "admin"));
}

/**
 * Lightweight check if the current user is an Admin or Superadmin.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const data = await fetchRoleAndAdmin(supabase, user.id);
  const role = normalizeUserRole(data?.role, data?.is_admin);
  return role === "admin" || role === "superadmin" || data?.is_admin === true;
}

/**
 * Lightweight check if the current user is a Moderator, Admin, or Superadmin.
 */
export async function isCurrentUserModerator(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const data = await fetchRoleAndAdmin(supabase, user.id);
  const role = normalizeUserRole(data?.role, data?.is_admin);
  return role === "moderator" || role === "admin" || role === "superadmin" || data?.is_admin === true;
}

/**
 * Retrieves the current user's role.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "user";

  const data = await fetchRoleAndAdmin(supabase, user.id);
  return normalizeUserRole(data?.role, data?.is_admin);
}
