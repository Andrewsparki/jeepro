"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/providers/theme-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { LightingProvider } from "@/components/ui/lighting-provider";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";

// Lazy-load purely decorative components — they should not block initial render
const BackgroundSystem = dynamic(
  () => import("@/components/ui/background-system").then(mod => ({ default: mod.BackgroundSystem })),
  { ssr: false }
);

const FloatingParticles = dynamic(
  () => import("@/components/ui/floating-particles").then(mod => ({ default: mod.FloatingParticles })),
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SmoothScrollProvider>
        <SupabaseProvider>
          <AuthProvider>
            <LightingProvider>
              <BackgroundSystem />
              <FloatingParticles />
              {children}
            </LightingProvider>
          </AuthProvider>
        </SupabaseProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
