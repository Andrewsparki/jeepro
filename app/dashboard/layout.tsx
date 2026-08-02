import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import { StudySessionProvider } from "@/features/study/context/study-session-context";
import { StudyTimer } from "@/features/study/components/study-timer";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudySessionProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6 relative">
            <MotionWrapper>
              {children}
            </MotionWrapper>
          </main>
        </div>
      </div>
      <StudyTimer />
    </StudySessionProvider>
  );
}
