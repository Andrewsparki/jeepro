"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { LightingProvider } from "@/components/ui/lighting-provider";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";
import { PerformanceProvider } from "@/lib/performance-context";
import { Toaster } from "@/components/ui/sonner";
import { DialogProvider } from "@/providers/dialog-provider";

// Lazy-load purely decorative components — they should not block initial render
const BackgroundSystem = dynamic(
  () => import("@/components/ui/background-system").then(mod => ({ default: mod.BackgroundSystem })),
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <PerformanceProvider>
          <LightingProvider>
            <DialogProvider>
              <BackgroundSystem />
              <SmoothScrollProvider>
                {children}
              </SmoothScrollProvider>
              <Toaster position="bottom-right" />
            </DialogProvider>
          </LightingProvider>
        </PerformanceProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
