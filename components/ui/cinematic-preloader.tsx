"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

function subscribePreloader() {
  return () => {};
}

function getPreloaderSeenSnapshot() {
  return (
    typeof window !== "undefined" &&
    sessionStorage.getItem("jee-pro-preloader-seen") === "true"
  );
}

function getPreloaderSeenServerSnapshot() {
  return true; // Don't render blocking overlay during SSR to preserve LCP
}

export function CinematicPreloader() {
  const alreadySeen = useSyncExternalStore(
    subscribePreloader,
    getPreloaderSeenSnapshot,
    getPreloaderSeenServerSnapshot
  );

  const [visible, setVisible] = useState(() => !alreadySeen);

  useEffect(() => {
    if (alreadySeen) return;

    const timer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("jee-pro-preloader-seen", "true");
      } catch {
        // Ignore storage errors
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [alreadySeen]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader-ambient"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center"
        >
          {/* Non-blocking top ambient laser indicator */}
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
