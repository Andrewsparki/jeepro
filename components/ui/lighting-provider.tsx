"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface LightingContextType {
  isTouch: boolean;
}

const LightingContext = createContext<LightingContextType>({ isTouch: false });

export function useLighting() {
  return useContext(LightingContext);
}

export function LightingProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if device is touch or reduced motion
    const touch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (touch || isReducedMotion) {
      const t = setTimeout(() => setIsTouch(true), 0);
      return () => clearTimeout(t);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const updateLighting = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${mouse.current.x}px`);
        containerRef.current.style.setProperty("--mouse-y", `${mouse.current.y}px`);
      }
      requestRef.current = requestAnimationFrame(updateLighting);
    };

    window.addEventListener("mousemove", onMouseMove);
    requestRef.current = requestAnimationFrame(updateLighting);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <LightingContext.Provider value={{ isTouch }}>
      <div 
        ref={containerRef} 
        className="min-h-screen w-full"
        // We set initial values far away so it doesn't flash in the corner
        style={{ "--mouse-x": "-1000px", "--mouse-y": "-1000px" } as React.CSSProperties}
      >
        {children}
        
        {/* Global spotlight effect overlaid on everything but pointer-events-none */}
        {!isTouch && (
          <div 
            className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.08), transparent 80%)`,
            }}
          />
        )}
      </div>
    </LightingContext.Provider>
  );
}
