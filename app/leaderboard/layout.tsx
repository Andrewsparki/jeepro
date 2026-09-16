import dynamic from "next/dynamic";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import { StudySessionProvider } from "@/features/study/context/study-session-context";
import { StudyTimer } from "@/features/study/components/study-timer";
import { CommandPaletteProvider } from "@/features/search/context/command-palette-context";
import { DashboardMainContent } from "@/features/dashboard/components/dashboard-main-content";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { NotificationProvider } from "@/features/notifications/context/notification-context";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

const CommandPalette = dynamic(
  () =>
    import("@/features/search/components/command-palette").then(
      (mod) => mod.CommandPalette
    )
);

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CommandPaletteProvider>
          <StudySessionProvider>
            <div className="flex min-h-screen w-full bg-transparent">
              <Sidebar />
              <DashboardMainContent>
                <Topbar title="Leaderboard" />
                <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
                  <MotionWrapper>{children}</MotionWrapper>
                </main>
              </DashboardMainContent>
            </div>
            <StudyTimer />
            <CommandPalette />
          </StudySessionProvider>
        </CommandPaletteProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
