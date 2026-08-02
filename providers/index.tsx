"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";

import { AuthProvider } from "@/features/auth/components/auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
