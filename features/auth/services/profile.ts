import { cache } from "react";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string;
  target_year: number | null;
  theme: string;
  is_admin?: boolean;
  is_muted?: boolean;
  is_banned?: boolean;
  mute_reason?: string | null;
  ban_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export const getUserProfile = cache(async (): Promise<{ user: User | null; profile: UserProfile | null }> => {
  const user = await getAuthUser();
  
  if (!user) {
    return { user: null, profile: null };
  }

  const supabase = await createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { user, profile: null };
  }

  return { user, profile: profileData };
});


