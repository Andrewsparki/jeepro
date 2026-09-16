"use client";

import { useLighting } from "./lighting-provider";
import { usePerformance } from "@/lib/performance-context";

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { isTouch } = useLighting();
  const { enableEntryAnimations } = usePerformance();

  if (isTouch || !enableEntryAnimations) {
    return <>{children}</>;
  }

  // Stable container without key={pathname} to avoid tearing down and remounting the entire dashboard DOM
  return (
    <div className="w-full h-full flex flex-col">
      {children}
    </div>
  );
}
