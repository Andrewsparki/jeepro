"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { LightingProvider } from "@/components/ui/lighting-provider";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";
import { PerformanceProvider } from "@/lib/performance-context";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { DialogProvider } from "@/providers/dialog-provider";
import { ContextMenuProvider } from "@/features/context-menu";
import { AppBootGuard, AppBootSequenceProvider } from "@/components/ui/cinematic-preloader";
import { NavigationProgressBar } from "@/components/ui/navigation-progress-bar";

import { BirthdayCheckGuard } from "@/features/birthday/components/birthday-check-guard";
import { BirthdayModeProvider } from "@/features/birthday/context/birthday-mode-context";
import {
  BreakRoomProvider,
  BreakRoomKeyboardListener,
} from "@/features/break-room";
import {
  ConcertModeProvider,
  ConcertKeyboardListener,
} from "@/features/concert-mode";

const BreakRoomModal = dynamic(
  () => import("@/features/break-room").then((mod) => mod.BreakRoomModal),
  { ssr: false }
);

const ConcertModal = dynamic(
  () => import("@/features/concert-mode").then((mod) => mod.ConcertModal),
  { ssr: false }
);
import {
  CookieConsentProvider,
  CookieConsentBanner,
  CookiePreferencesModal,
} from "@/features/privacy";
import { AnalyticsTracker } from "@/features/analytics/components/analytics-tracker";

// Lazy-load purely decorative components — they should not block initial render
const BackgroundSystem = dynamic(
  () => import("@/components/ui/background-system").then(mod => ({ default: mod.BackgroundSystem })),
  { ssr: false }
);

import { AiAssistantProvider } from "@/features/ai-assistant/context/ai-assistant-context";

const AiStudyAssistantModal = dynamic(
  () =>
    import("@/features/ai-assistant/components/ai-study-assistant-modal").then(
      (mod) => mod.AiStudyAssistantModal
    ),
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
          <AppBootSequenceProvider>
            <AuthProvider>
              <CookieConsentProvider>
                <CookieConsentBanner />
                <CookiePreferencesModal />
                <AnalyticsTracker />
                <BirthdayModeProvider>
                  <BirthdayCheckGuard />
                  <BreakRoomProvider>
                    <BreakRoomKeyboardListener />
                    <BreakRoomModal />
                    <ConcertModeProvider>
                      <ConcertKeyboardListener />
                      <ConcertModal />
                      <AiAssistantProvider>
                        <LightingProvider>
                          <DialogProvider>
                            <ContextMenuProvider>
                              <BackgroundSystem />
                              <SmoothScrollProvider>
                                <NavigationProgressBar />
                                <AppBootGuard>
                                  {children}
                                </AppBootGuard>
                              </SmoothScrollProvider>
                              <AiStudyAssistantModal />
                              <Toaster position="bottom-right" />
                            </ContextMenuProvider>
                          </DialogProvider>
                        </LightingProvider>
                      </AiAssistantProvider>
                    </ConcertModeProvider>
                  </BreakRoomProvider>
                </BirthdayModeProvider>
              </CookieConsentProvider>
            </AuthProvider>
          </AppBootSequenceProvider>
        </PerformanceProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

