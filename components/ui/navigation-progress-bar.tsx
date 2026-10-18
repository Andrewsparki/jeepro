"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

function NavigationProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  const [state, setState] = useState<"idle" | "loading" | "finishing">("idle");
  const [progress, setProgress] = useState(0);

  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const trickleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef("");

  const clearAllTimers = useCallback(() => {
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (trickleIntervalRef.current) clearInterval(trickleIntervalRef.current);
  }, []);

  const startLoading = useCallback(() => {
    clearAllTimers();

    // 120ms threshold: if navigation is instant (sub-120ms cache hit), avoid flicker
    startTimeoutRef.current = setTimeout(() => {
      setState("loading");
      setProgress(25);

      // Asymptotic trickle
      trickleIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 65) return prev + Math.random() * 12;
          if (prev < 85) return prev + Math.random() * 4;
          if (prev < 92) return prev + 0.5;
          return prev;
        });
      }, 250);

      // Safety timeout: reset after 8s if navigation stalls/fails
      safetyTimeoutRef.current = setTimeout(() => {
        setState("finishing");
        setProgress(100);
        finishTimeoutRef.current = setTimeout(() => {
          setState("idle");
          setProgress(0);
        }, 250);
      }, 8000);
    }, 120);
  }, [clearAllTimers]);

  const finishLoading = useCallback(() => {
    clearAllTimers();

    setState((prevState) => {
      if (prevState === "idle") return "idle";

      setProgress(100);
      finishTimeoutRef.current = setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 250);

      return "finishing";
    });
  }, [clearAllTimers]);

  // Track route changes
  useEffect(() => {
    const newUrl = `${pathname}?${searchParams?.toString() || ""}`;
    if (currentUrlRef.current && currentUrlRef.current !== newUrl) {
      finishLoading();
    }
    currentUrlRef.current = newUrl;
  }, [pathname, searchParams, finishLoading]);

  // Global click interception on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as Element).closest("a");
      if (!target || !target.href) return;

      if (target.target && target.target !== "_self") return;
      if (target.hasAttribute("download")) return;
      if (target.getAttribute("rel")?.includes("external")) return;

      try {
        const targetUrl = new URL(target.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same origin check
        if (targetUrl.origin !== currentUrl.origin) return;

        // Ignore hash anchor links on same page
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash
        ) {
          return;
        }

        // If target is genuinely different from current path
        if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
          startLoading();
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      clearAllTimers();
    };
  }, [startLoading, clearAllTimers]);

  if (state === "idle") return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none overflow-hidden select-none"
      role="progressbar"
      aria-label="Navigation progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-white/[0.04]" />

      {/* Animated progress bar */}
      <motion.div
        className="h-full rounded-r-full bg-accent relative"
        initial={{ width: "0%", opacity: 1 }}
        animate={{
          width: shouldReduceMotion ? "100%" : `${progress}%`,
          opacity: state === "finishing" ? 0 : 1,
        }}
        transition={{
          width: {
            duration: state === "finishing" ? 0.15 : 0.35,
            ease: [0.16, 1, 0.3, 1],
          },
          opacity: {
            duration: 0.22,
            ease: "easeOut",
          },
        }}
        style={{
          boxShadow: "0 0 10px var(--accent-glow), 0 0 3px var(--accent)",
        }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressContent />
    </Suspense>
  );
}
