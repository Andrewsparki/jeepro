"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { useLighting } from "./lighting-provider";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticPull?: number; // max pixels to pull, e.g. 10
}

export function MagneticButton({ children, className, magneticPull = 12 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isTouch } = useLighting();

  // We use spring physics for buttery smooth returns and pulls
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    if (isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!ref.current || !isHovered) return;
      
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

    if (isHovered) {
      window.addEventListener("mousemove", onMouseMove);
    } else {
      x.set(0);
      y.set(0);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isHovered, isTouch, magneticPull, x, y]);

  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        scale: isHovered ? 1.03 : 1,
      }}
      whileTap={{ scale: 0.97 }}
      style={{
        x,
        y,
        display: "inline-block" // Ensure it wraps the button correctly
      }}
    >
      {children}
    </motion.div>
  );
}
