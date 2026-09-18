"use client";

import { usePathname } from "next/navigation";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { cn } from "@/lib/utils";

export function DashboardMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isImmersive } = useFocusStore();
  const isHidden = pathname === "/dashboard/focus" && isImmersive;

  return (
    <div 
      data-smooth-content
      className="flex flex-1 flex-col min-w-0"
    >
      {children}
    </div>
  );
}
