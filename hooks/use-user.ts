import { useSupabase } from "@/providers/supabase-provider";

export function useUser() {
  const { user, session, isLoading } = useSupabase();

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };
}
