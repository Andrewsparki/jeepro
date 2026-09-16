import { useAuth } from "@/features/auth/components/auth-provider";

export function useUser() {
  const { user, profile, isLoading } = useAuth();

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
  };
}
