"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type Lenis from "lenis";

function LenisExposer() {
  const lenis = useLenis();
  
  useEffect(() => {
    if (lenis) {
      // Safely cast window to expose the active Lenis instance for debugging
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }
  }, [lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        smoothWheel: true,
        syncTouch: true,
        lerp: 0.07,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        infinite: false,
        autoResize: true,
      }}
    >
      <LenisExposer />
      {children}
    </ReactLenis>
  );
}
