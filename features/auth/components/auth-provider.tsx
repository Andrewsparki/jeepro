"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, getUserProfile } from "../services/profile";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const { user: authUser, profile: authProfile } = await getUserProfile();
        setUser(authUser);
        setProfile(authProfile);
      } catch (error) {
        console.error("Failed to load auth:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
