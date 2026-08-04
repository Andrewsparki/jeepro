"use client";

import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ 
          duration: 0.25, 
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
