"use client";

import { useEffect, useRef, useState } from "react";
import { usePerformance } from "@/lib/performance-context";
import { useLighting } from "@/components/ui/lighting-provider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function FloatingParticles() {
  return null;
}
