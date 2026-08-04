"use client";

import React, { useRef, memo } from "react";
import { motion, useSpring } from "framer-motion";
import { useLighting } from "./lighting-provider";
import { usePerformance } from "@/lib/performance-context";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticPull?: number; // max pixels to pull, e.g. 10
}

export const MagneticButton = memo(function MagneticButton({
  children,
  className,
  magneticPull = 12,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const { isTouch } = useLighting();
  const { enableMagnetic } = usePerformance();

  // We use spring physics for buttery smooth returns and pulls
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  if (isTouch || !enableMagnetic) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isHoveredRef.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // We cap the pull to magneticPull
    const pullX = (distanceX / (rect.width / 2)) * magneticPull;
    const pullY = (distanceY / (rect.height / 2)) * magneticPull;

    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        x,
        y,
        display: "inline-block", // Ensure it wraps the button correctly
      }}
    >
      {children}
    </motion.div>
  );
});

MagneticButton.displayName = "MagneticButton";
