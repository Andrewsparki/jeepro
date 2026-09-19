"use client";

import { usePathname } from "next/navigation";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { cn } from "@/lib/utils";

export function DashboardMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocus = pathname === "/dashboard/focus";

  return (
    <div 
      data-smooth-content
      className={cn(
        "flex flex-1 flex-col min-w-0",
        isFocus && "h-[100dvh] max-h-[100dvh] overflow-hidden [&>main]:p-0 [&>main]:flex [&>main]:flex-col [&>main]:flex-1 [&>main]:min-h-0 [&>main]:h-full [&>main]:overflow-hidden"
      )}
    >
      {children}
    </div>
  );
}
