"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLighting } from "./lighting-provider";

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTouch } = useLighting();

  if (isTouch) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
        transition={{ 
          duration: 0.35, 
          ease: [0.22, 1, 0.36, 1] // Custom easing for that Apple-like feel
        }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
