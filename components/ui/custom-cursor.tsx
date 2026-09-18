"use client";

import React, { useEffect, useRef } from "react";
import { useLighting } from "@/components/ui/lighting-provider";
import { usePerformance } from "@/lib/performance-context";

/**
 * Premium Custom Cursor with Inertial Ambient Glow
 * - 100% GPU accelerated via requestAnimationFrame and transform3d
 * - Zero React re-renders during mouse movement
 * - Inertial lag physics on the outer ambient halo
 * - Interactive hover expansion on buttons, links, and cards
 * - Respects touch devices, reduced motion, and performance settings
 */
export function CustomCursor() {
  const { isTouch, mouseRef } = useLighting();
  const { enableMouseLighting } = usePerformance();

  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  // Position & physics refs (mutated directly in RAF loop)
  const pos = useRef({
    targetX: -100,
    targetY: -100,
    dotX: -100,
    dotY: -100,
    haloX: -100,
    haloY: -100,
    dotScale: 1,
    haloScale: 1,
    targetDotScale: 1,
    targetHaloScale: 1,
    opacity: 0,
    targetOpacity: 0,
  });

  useEffect(() => {
    if (isTouch || !enableMouseLighting) return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) return;

    let rafId: number;
    let isVisible = false;

    // Fast check for interactive elements
    const isInteractive = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      return Boolean(
        el.closest(
          "button, a, input, select, textarea, [role='button'], .cursor-pointer, [data-interactive]"
        )
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      pos.current.targetX = e.clientX;
      pos.current.targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        pos.current.targetOpacity = 1;
      }

      // Check hover state
      const target = e.target as HTMLElement | null;
      if (isInteractive(target)) {
        pos.current.targetHaloScale = 1.6;
        pos.current.targetDotScale = 0.6;
      } else {
        pos.current.targetHaloScale = 1;
        pos.current.targetDotScale = 1;
      }
    };

    const onPointerDown = () => {
      pos.current.targetHaloScale *= 0.8;
      pos.current.targetDotScale *= 0.8;
    };

    const onPointerUp = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (isInteractive(target)) {
        pos.current.targetHaloScale = 1.6;
        pos.current.targetDotScale = 0.6;
      } else {
        pos.current.targetHaloScale = 1;
        pos.current.targetDotScale = 1;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      pos.current.targetOpacity = 0;
    };

    const onMouseEnter = () => {
      isVisible = true;
      pos.current.targetOpacity = 1;
    };

    // 60FPS / 120FPS GPU Animation Loop
    const animate = () => {
      const p = pos.current;

      // Tight spring/lerp for precision dot
      p.dotX += (p.targetX - p.dotX) * 0.75;
      p.dotY += (p.targetY - p.dotY) * 0.75;

      // Smooth fluid lerp for ambient glow halo
      p.haloX += (p.targetX - p.haloX) * 0.18;
      p.haloY += (p.targetY - p.haloY) * 0.18;

      // Lerp scales and opacity
      p.dotScale += (p.targetDotScale - p.dotScale) * 0.2;
      p.haloScale += (p.targetHaloScale - p.haloScale) * 0.2;
      p.opacity += (p.targetOpacity - p.opacity) * 0.15;

      // Apply GPU 3D transforms directly to DOM nodes
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.dotX}px, ${p.dotY}px, 0) translate(-50%, -50%) scale(${p.dotScale})`;
        dotRef.current.style.opacity = p.opacity.toFixed(3);
      }

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${p.haloX}px, ${p.haloY}px, 0) translate(-50%, -50%) scale(${p.haloScale})`;
        haloRef.current.style.opacity = (p.opacity * 0.85).toFixed(3);
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.body.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.body.addEventListener("mouseenter", onMouseEnter, { passive: true });

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isTouch, enableMouseLighting]);

  if (isTouch || !enableMouseLighting) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Outer Fluid Ambient Glow Halo */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 dark:bg-accent/15 dark:border-accent/40 backdrop-blur-[1px] shadow-[0_0_20px_rgba(79,70,229,0.25)] transition-colors duration-300 will-change-transform opacity-0 pointer-events-none"
      />

      {/* Inner Precision Core Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-indigo-500 dark:bg-accent shadow-[0_0_8px_rgba(79,70,229,0.8)] will-change-transform opacity-0 pointer-events-none"
      />
    </div>
  );
}
