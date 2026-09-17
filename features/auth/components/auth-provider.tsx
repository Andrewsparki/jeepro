"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { UserProfile } from "../services/profile";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

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
  const loadedUserIdRef = useRef<string | null>(null);
  const fetchingUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function syncAuthUser(authUser: User | null) {
      if (!authUser) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          loadedUserIdRef.current = null;
          fetchingUserIdRef.current = null;
          setIsLoading(false);
        }
        return;
      }

      // If we already loaded or are currently fetching this user's profile, skip duplicate request
      if (loadedUserIdRef.current === authUser.id) {
        if (isMounted) {
          setUser(authUser);
          setIsLoading(false);
        }
        return;
      }

      if (fetchingUserIdRef.current === authUser.id) {
        return;
      }

      fetchingUserIdRef.current = authUser.id;

      try {
        // Query profiles directly from the browser client — RLS-protected, 80ms roundtrip, no server action POST overhead
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (isMounted) {
          setUser(authUser);
          setProfile(profileError ? null : profileData);
          loadedUserIdRef.current = authUser.id;
        }
      } catch (error) {
        console.error("Failed to load auth profile:", error);
        if (isMounted) {
          setUser(authUser);
        }
      } finally {
        fetchingUserIdRef.current = null;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Subscribe to all Supabase Auth lifecycle events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setProfile(null);
        loadedUserIdRef.current = null;
        fetchingUserIdRef.current = null;
        setIsLoading(false);
      } else {
        await syncAuthUser(session.user);
      }
    });

    // Initial check on mount
    supabase.auth.getUser().then((res: { data: { user: User | null } }) => {
      const initialUser = res.data.user;
      if (isMounted && initialUser) {
        syncAuthUser(initialUser);
      } else if (isMounted && !initialUser) {
        setIsLoading(false);
      }
    }).catch((err: unknown) => {
      console.error("Initial auth check error:", err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
    return {
      user: null,
      profile: null,
      isLoading: false,
    };
  }
  return context;
}

