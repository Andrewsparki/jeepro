"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string;
  target_year: number | null;
  theme: string;
  created_at: string;
  updated_at: string;
};

export async function getUserProfile(): Promise<{ user: User | null; profile: UserProfile | null }> {
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authData.user) {
    return { user: null, profile: null };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { user: authData.user, profile: null };
  }

  return { user: authData.user, profile: profileData };
}
