"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User, Session } from "@supabase/supabase-js";

interface SupabaseContext {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }).catch(err => {
      console.error("Auth session error:", err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, user, session, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export function useSupabase() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
