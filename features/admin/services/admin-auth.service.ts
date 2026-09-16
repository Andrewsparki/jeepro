"use server";

import { createClient } from "@/lib/supabase/server";
import { forbidden } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface AdminSession {
  user: User;
  profile: AdminProfile;
}

/**
 * Server-side admin verification. Must be called from Server Components,
 * Server Actions, or Route Handlers only.
 *
 * Returns the authenticated admin user and profile, or calls forbidden()
 * which triggers a 403 response.
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, is_admin, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    forbidden();
  }

  return {
    user,
    profile: profile as AdminProfile,
  };
}

/**
 * Lightweight admin check without calling forbidden().
 * Returns true if the current user is an admin, false otherwise.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}
