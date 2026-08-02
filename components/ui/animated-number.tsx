"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useLighting } from "./lighting-provider";

export function AnimatedNumber({ value }: { value: number }) {
  const { isTouch } = useLighting();
  
  // Spring to animate the value
  const springValue = useSpring(value, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Round the spring value to whole numbers for display
  const displayValue = useTransform(springValue, (current) => Math.round(current));
  
  // To avoid hydration mismatches, we only render the animated version on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || isTouch) {
    return <span>{value}</span>;
  }

  return <motion.span>{displayValue}</motion.span>;
}
