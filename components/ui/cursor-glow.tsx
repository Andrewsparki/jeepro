"use client";

import { useEffect, useRef } from "react";

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const NEUTRAL_WHITE: RGBColor = { r: 255, g: 255, b: 255 };

function detectAccentColor(el: HTMLElement | null): RGBColor {
  if (!el) return NEUTRAL_WHITE;

  // 1. Check explicit data-cursor-color attribute on target or ancestors
  const targetWithAttr = el.closest("[data-cursor-color]") as HTMLElement | null;
  if (targetWithAttr) {
    const colorAttr = targetWithAttr.getAttribute("data-cursor-color");
    if (colorAttr) {
      if (colorAttr === "blue" || colorAttr === "sky" || colorAttr === "cyan") return { r: 59, g: 130, b: 246 };
      if (colorAttr === "emerald" || colorAttr === "green" || colorAttr === "success") return { r: 16, g: 185, b: 129 };
      if (colorAttr === "orange" || colorAttr === "amber" || colorAttr === "streak") return { r: 249, g: 115, b: 22 };
      if (colorAttr === "purple" || colorAttr === "violet" || colorAttr === "indigo" || colorAttr === "xp") return { r: 168, g: 85, b: 247 };
      if (colorAttr === "red" || colorAttr === "danger") return { r: 239, g: 68, b: 68 };
      if (colorAttr === "yellow" || colorAttr === "gold") return { r: 234, g: 179, b: 8 };
      if (colorAttr.startsWith("#") && colorAttr.length === 7) {
        const r = parseInt(colorAttr.slice(1, 3), 16);
        const g = parseInt(colorAttr.slice(3, 5), 16);
        const b = parseInt(colorAttr.slice(5, 7), 16);
        return { r, g, b };
      }
    }
  }

  // 2. Class name matching on target & ancestors up to 4 levels
  let current: HTMLElement | null = el;
  let depth = 0;
  while (current && depth < 4) {
    const className = current.className || "";
    if (typeof className === "string" && className.length > 0) {
      if (className.includes("text-blue-") || className.includes("bg-blue-") || className.includes("border-blue-")) {
        return { r: 59, g: 130, b: 246 };
      }
      if (className.includes("text-emerald-") || className.includes("bg-emerald-") || className.includes("text-green-") || className.includes("text-success")) {
        return { r: 16, g: 185, b: 129 };
      }
      if (className.includes("text-orange-") || className.includes("bg-orange-") || className.includes("text-amber-") || className.includes("text-warning")) {
        return { r: 249, g: 115, b: 22 };
      }
      if (className.includes("text-purple-") || className.includes("bg-purple-") || className.includes("text-violet-") || className.includes("text-accent")) {
        return { r: 168, g: 85, b: 247 };
      }
      if (className.includes("text-red-") || className.includes("bg-red-") || className.includes("text-danger") || className.includes("text-destructive")) {
        return { r: 239, g: 68, b: 68 };
      }
      if (className.includes("text-yellow-") || className.includes("bg-yellow-")) {
        return { r: 234, g: 179, b: 8 };
      }
    }

    // 3. Inspect computed style color for vibrant non-monochrome elements
    try {
      const style = window.getComputedStyle(current);
      const color = style.color;
      if (color && color.startsWith("rgb")) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
          const r = parseInt(match[0], 10);
          const g = parseInt(match[1], 10);
          const b = parseInt(match[2], 10);
          const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if (diff > 45) {
            return { r, g, b };
          }
        }
      }
    } catch { }

    current = current.parentElement;
    depth++;
  }

  return NEUTRAL_WHITE;
}

const MAX_TRAIL_POINTS = 20;

export function CursorGlow() {
  const mainRef = useRef<HTMLDivElement>(null);
  const coreRingRef = useRef<HTMLDivElement>(null);
  const centerDotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animId = 0;
    let targetX = -500;
    let targetY = -500;

    let isHovering = false;
    let isClicking = false;
    let currentScale = 1;
    let currentOpacity = 0;
    let targetOpacity = 0;

    // Color Interpolation State
    const currentColor: RGBColor = { r: 255, g: 255, b: 255 };
    let targetColor: RGBColor = NEUTRAL_WHITE;

    // 1. Core Nodes
    const leadNode = { x: -500, y: -500 };  // Small Main Cursor
    const ghostNode = { x: -500, y: -500 }; // Large Delayed Follower Ring

    // 2. Physics-Based Trail Chain (Snake-like Lerp)
    // Each node follows the one ahead of it, creating natural compression
    // and a graceful collapse into the center when stopped.
    const trailNodes = Array.from({ length: MAX_TRAIL_POINTS }, () => ({ x: -500, y: -500 }));

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetOpacity = 0.95;

      if (leadNode.x === -500) {
        leadNode.x = targetX;
        leadNode.y = targetY;
        ghostNode.x = targetX;
        ghostNode.y = targetY;
        trailNodes.forEach(node => {
          node.x = targetX;
          node.y = targetY;
        });
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          "a, button, input, select, textarea, [role='button'], [tabindex='0']"
        )
      ) {
        isHovering = true;
      }

      // Adaptive Color Detection
      targetColor = detectAccentColor(target);
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          "a, button, input, select, textarea, [role='button'], [tabindex='0']"
        )
      ) {
        isHovering = false;
      }
      targetColor = NEUTRAL_WHITE;
    };

    const onMouseDown = () => {
      isClicking = true;
    };

    const onMouseUp = () => {
      isClicking = false;

      // Trigger Click Ripple
      if (rippleRef.current) {
        rippleRef.current.style.transition = "none";
        rippleRef.current.style.transform = `scale(${currentScale})`;
        rippleRef.current.style.opacity = "0.7";
        rippleRef.current.style.borderColor = `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, 0.8)`;

        void rippleRef.current.offsetWidth;

        rippleRef.current.style.transition = "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
        rippleRef.current.style.transform = `scale(${currentScale * 1.8})`;
        rippleRef.current.style.opacity = "0";
      }
    };

    const onMouseLeave = () => {
      targetOpacity = 0;
      targetColor = NEUTRAL_WHITE;
    };

    const render = () => {
      // --- Smooth Color Interpolation ---
      currentColor.r += (targetColor.r - currentColor.r) * 0.15;
      currentColor.g += (targetColor.g - currentColor.g) * 0.15;
      currentColor.b += (targetColor.b - currentColor.b) * 0.15;

      const r = Math.round(currentColor.r);
      const g = Math.round(currentColor.g);
      const b = Math.round(currentColor.b);

      // --- 1. Small Main Cursor Lead Interpolation ---
      leadNode.x += (targetX - leadNode.x) * 0.28;
      leadNode.y += (targetY - leadNode.y) * 0.28;

      // --- 2. Large Follower Ring Spring Catch-Up (Never generates a trail) ---
      ghostNode.x += (leadNode.x - ghostNode.x) * 0.08;
      ghostNode.y += (leadNode.y - ghostNode.y) * 0.08;

      // --- 3. Physics Chain for Trail (Snake / Liquid Collapse) ---
      for (let i = 0; i < MAX_TRAIL_POINTS; i++) {
        // First node follows leadNode, subsequent nodes follow the one in front of them
        const targetPoint = i === 0 ? leadNode : trailNodes[i - 1];

        // A slightly tighter lerp creates the snake-like follow effect.
        // It automatically handles the non-uniform spacing (compression near the head)
        // and collapses perfectly into the cursor when movement stops!
        const springFactor = 0.42;

        trailNodes[i].x += (targetPoint.x - trailNodes[i].x) * springFactor;
        trailNodes[i].y += (targetPoint.y - trailNodes[i].y) * springFactor;
      }

      // --- 4. Scale & Master Opacity Interpolation ---
      const targetScale = isClicking ? 0.85 : isHovering ? 1.25 : 1.0;
      currentScale += (targetScale - currentScale) * 0.15;
      currentOpacity += (targetOpacity - currentOpacity) * 0.1;

      // --- 5. Render Small Main Cursor Core (28px) ---
      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${leadNode.x}px, ${leadNode.y}px, 0)`;
        mainRef.current.style.opacity = currentOpacity.toString();
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `scale(${currentScale})`;
      }

      if (coreRingRef.current) {
        coreRingRef.current.style.borderColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        coreRingRef.current.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.06)`;
        coreRingRef.current.style.boxShadow = `0 0 12px rgba(${r}, ${g}, ${b}, 0.25)`;
      }

      if (centerDotRef.current) {
        centerDotRef.current.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
        centerDotRef.current.style.boxShadow = `0 0 6px rgba(${r}, ${g}, ${b}, 0.6)`;
      }

      // --- 6. Render Large Delayed Follower Ring (46px - No Trail) ---
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${ghostNode.x}px, ${ghostNode.y}px, 0) scale(${currentScale})`;
        ghostRef.current.style.opacity = (currentOpacity * 0.4).toString();
        ghostRef.current.style.borderColor = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ghostRef.current.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.02)`;
        ghostRef.current.style.boxShadow = `0 0 12px rgba(${r}, ${g}, ${b}, 0.15)`;
      }

      // --- 7. Render Motion Persistence Liquid Trail ---
      for (let i = 0; i < MAX_TRAIL_POINTS; i++) {
        const el = trailRefs.current[i];
        if (el) {
          const pt = trailNodes[i];
          const ratio = (i + 1) / MAX_TRAIL_POINTS; // 0 (newest) -> 1 (oldest)

          // Progressive scaling down, fading opacity, and subtle blurring
          const nodeScale = (1 - ratio * 0.65) * currentScale;
          const nodeOpacity = currentOpacity * Math.pow(1 - ratio, 1.4) * 0.55;
          const blurAmount = (ratio * 3.5).toFixed(1);

          el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) scale(${nodeScale})`;
          el.style.opacity = nodeOpacity.toString();
          el.style.borderColor = `rgba(${r}, ${g}, ${b}, ${0.5 * (1 - ratio)})`;
          el.style.filter = `blur(${blurAmount}px)`;
          el.style.boxShadow = `0 0 ${Math.max(2, 8 * (1 - ratio))}px rgba(${r}, ${g}, ${b}, ${0.2 * (1 - ratio)})`;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Bind Listeners
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="hidden md:block motion-reduce:hidden fixed top-0 left-0 pointer-events-none z-[9999]">
      {/* 1. Motion Persistence Trail (20 Points) */}
      <div className="absolute top-0 left-0 pointer-events-none z-[9997]">
        {Array.from({ length: MAX_TRAIL_POINTS }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 w-[28px] h-[28px] -ml-[14px] -mt-[14px] rounded-full border-[1.5px] opacity-0 will-change-transform"
          />
        ))}
      </div>

      {/* 2. Large Delayed Follower Ring (46px - No Trail) */}
      <div
        ref={ghostRef}
        className="absolute top-0 left-0 w-[46px] h-[46px] -ml-[23px] -mt-[23px] rounded-full border-[1.5px] opacity-0 will-change-transform z-[9998] pointer-events-none"
      />

      {/* 3. Small Main Cursor Core (28px) */}
      <div
        ref={mainRef}
        className="absolute top-0 left-0 w-[28px] h-[28px] -ml-[14px] -mt-[14px] pointer-events-none opacity-0 will-change-transform z-[9999]"
      >
        {/* Click Ripple */}
        <div
          ref={rippleRef}
          className="absolute inset-0 rounded-full border-2 opacity-0"
          style={{ transform: "scale(1)" }}
        />

        {/* Scalable Core Ring + Center Dot */}
        <div
          ref={ringRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          {/* Ring: 28px, 2px border, frosted glass center */}
          <div
            ref={coreRingRef}
            className="absolute inset-0 rounded-full border-[2px] backdrop-blur-[2px] transition-colors duration-200"
            style={{ opacity: 0.95 }}
          />

          {/* Center Dot */}
          <div
            ref={centerDotRef}
            className="w-[4px] h-[4px] rounded-full z-10 transition-colors duration-200"
            style={{ opacity: 1.0 }}
          />
        </div>
      </div>
    </div>
  );
}
