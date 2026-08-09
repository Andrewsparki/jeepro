import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import { StudySessionProvider } from "@/features/study/context/study-session-context";
import { StudyTimer } from "@/features/study/components/study-timer";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { CommandPaletteProvider } from "@/features/search/context/command-palette-context";
import { CommandPalette } from "@/features/search/components/command-palette";
import { KonamiCode } from "@/components/ui/konami-code";

import { DashboardMainContent } from "@/features/dashboard/components/dashboard-main-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandPaletteProvider>
      <StudySessionProvider>
        <KonamiCode />
        <div className="flex min-h-screen w-full bg-transparent">
        <Sidebar />
        <DashboardMainContent>
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
            <MotionWrapper>
              {children}
            </MotionWrapper>
          </main>
        </DashboardMainContent>
      </div>
        <StudyTimer />
        <CommandPalette />
      </StudySessionProvider>
    </CommandPaletteProvider>
  );
}
