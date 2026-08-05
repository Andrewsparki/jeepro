"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  valueFormatter?: (progress: number) => React.ReactNode;
  children?: React.ReactNode;
  colorClassName?: string; // Kept for backwards compatibility
  trackColorClassName?: string; // Kept for backwards compatibility
}

export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  className,
  showValue = true,
  valueFormatter,
  children,
}: ProgressRingProps) {
  const rawId = useId();
  const uniqueId = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `blue-ring-grad-${uniqueId}`;
  const trackGradientId = `blue-track-grad-${uniqueId}`;
  const glowFilterId = `blue-glow-filter-${uniqueId}`;

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth - 12) / 2; // Extra padding for outer glow
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center select-none", className)} style={{ width: size, height: size }}>
      {/* Outer Soft Illuminated Bloom */}
      <div 
        className="absolute inset-0 rounded-full blur-[20px] pointer-events-none opacity-40 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.08) 60%, transparent 100%)"
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10 overflow-visible">
        <defs>
          {/* Premium Blue Gradient: #2563EB -> #3B82F6 -> #60A5FA */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          {/* Dark Background Track Gradient */}
          <linearGradient id={trackGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.12)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
          </linearGradient>

          {/* Soft Outer Glow Filter */}
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Dark Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${trackGradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Layer 2: Ambient Glow Underlayer */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#3B82F6"
          strokeWidth={strokeWidth + 3}
          strokeOpacity={0.16}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          filter={`url(#${glowFilterId})`}
        />

        {/* Layer 3: Main Gradient Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
        />

        {/* Layer 4: Animated Traveling Circumference Highlight */}
        {clampedProgress > 0 && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#93C5FD"
            strokeWidth={strokeWidth - 2}
            strokeOpacity={0.7}
            fill="transparent"
            strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
            animate={{
              strokeDashoffset: [0, -circumference],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
            }}
            strokeLinecap="round"
            style={{ mixBlendMode: "overlay" }}
          />
        )}
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
        {children ? (
          children
        ) : showValue ? (
          valueFormatter ? (
            valueFormatter(clampedProgress)
          ) : (
            <span className="text-2xl font-bold tracking-tight text-foreground">{Math.round(clampedProgress)}%</span>
          )
        ) : null}
      </div>
    </div>
  );
}
