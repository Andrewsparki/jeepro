"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";

import { AuthProvider } from "@/features/auth/components/auth-provider";
import { LightingProvider } from "@/components/ui/lighting-provider";
import { BackgroundSystem } from "@/components/ui/background-system";
import { FloatingParticles } from "@/components/ui/floating-particles";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <AuthProvider>
          <LightingProvider>
            <BackgroundSystem />
            <FloatingParticles />
            {children}
          </LightingProvider>
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
