"use client";


import { usePathname } from "next/navigation";
import { useLighting } from "./lighting-provider";
import { usePerformance } from "@/lib/performance-context";

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTouch } = useLighting();
  const { enableEntryAnimations } = usePerformance();

  if (isTouch || !enableEntryAnimations) {
    return <>{children}</>;
  }

  return (
    <div
      key={pathname}
      className="w-full h-full flex flex-col"
    >
      {children}
    </div>
  );
}
