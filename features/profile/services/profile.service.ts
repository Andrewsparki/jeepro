import { createClient } from "@/lib/supabase/client";
import type { ProfileInput } from "@/lib/validations";


export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  targetYear?: number;
  targetExam?: "JEE_MAIN" | "JEE_ADVANCED" | "BOTH";
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as unknown as Profile;
  },

  async updateProfile(userId: string, updates: ProfileInput): Promise<Profile> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.fullName,
        phone: updates.phone,
        target_year: updates.targetYear,
        target_exam: updates.targetExam,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Profile;
  },
};
