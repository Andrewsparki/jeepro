import dynamic from "next/dynamic";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import { StudySessionProvider } from "@/features/study/context/study-session-context";
import { StudyTimer } from "@/features/study/components/study-timer";
import { CommandPaletteProvider } from "@/features/search/context/command-palette-context";
import { DashboardMainContent } from "@/features/dashboard/components/dashboard-main-content";
import { NotificationProvider } from "@/features/notifications/context/notification-context";

const CommandPalette = dynamic(
  () =>
    import("@/features/search/components/command-palette").then(
      (mod) => mod.CommandPalette
    )
);

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <CommandPaletteProvider>
        <StudySessionProvider>
          <div className="flex min-h-screen w-full bg-transparent">
            <Sidebar />
            <DashboardMainContent>
              <Topbar title="Achievements" />
              <main className="flex-1 p-4 md:p-6 lg:p-8 relative page-transition">
                {children}
              </main>
            </DashboardMainContent>
          </div>
          <StudyTimer />
          <CommandPalette />
        </StudySessionProvider>
      </CommandPaletteProvider>
    </NotificationProvider>
  );
}

