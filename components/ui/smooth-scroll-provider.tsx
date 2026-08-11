"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePerformance } from "@/lib/performance-context";

// Context to expose scrollTo functionality globally
const SmoothScrollContext = createContext<{
  scrollTo: (target: number | string | HTMLElement, options?: Record<string, unknown>) => void;
} | null>(null);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { enableSmoothScroll } = usePerformance();
  const [scrollInstance, setScrollInstance] = useState<any>(null);

  useEffect(() => {
    // If smooth scrolling is disabled (e.g. Battery Saver), destroy instance and use native scroll
    if (!enableSmoothScroll) {
      if (scrollInstance) {
        scrollInstance.destroy();
        setScrollInstance(null);
      }
      return;
    }

    let scroll: any;
    
    // Dynamically import locomotive-scroll to prevent SSR mismatch/window undefined issues
    import("locomotive-scroll").then((LocomotiveScrollModule) => {
      const LocomotiveScroll = LocomotiveScrollModule.default;
      
      // Locomotive Scroll v5 automatically uses Lenis under the hood but exposes the standard API
      scroll = new LocomotiveScroll({
        lenisOptions: {
          wrapper: window,
          content: document.documentElement,
          lerp: 0.07,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.4,
          smoothWheel: true,
          syncTouch: true,
          autoResize: true,
        },
      });
      
      // Expose to window for debugging or other global integrations
      (window as any).locomotiveScroll = scroll;
      
      setScrollInstance(scroll);
    }).catch(console.error);

    return () => {
      if (scroll) {
        scroll.destroy();
      }
      delete (window as any).locomotiveScroll;
    };
  }, [enableSmoothScroll]);

  return (
    <SmoothScrollContext.Provider 
      value={{
        scrollTo: (target: number | string | HTMLElement, options?: Record<string, unknown>) => {
          if (scrollInstance) {
            scrollInstance.scrollTo(target, options);
          } else {
            // Fallback for native scrolling if locomotive-scroll is disabled
            if (typeof target === 'number') {
              window.scrollTo({ top: target, behavior: 'smooth' });
            } else if (typeof target === 'string') {
              const el = document.querySelector(target);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else if (target instanceof HTMLElement) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);

  if (!context) {
    return {
      scrollTo: (target: number | string | HTMLElement) => {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
  }

  return context;
}
