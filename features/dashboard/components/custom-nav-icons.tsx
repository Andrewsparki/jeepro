"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  isHovered: boolean;
  isPressed: boolean;
  isActive: boolean;
  className?: string;
}

/**
 * 1. DASHBOARD: Linear / Raycast style 4-Quadrant Kinetic Floating Tiles
 * Features:
 * - Resting: Sleek geometric grid.
 * - Hover: Tiles dynamically float outward in a 3D magnetic expansion with glowing accent illumination.
 * - Tap / Click: Elastic suction pop into center, then spring back with punchy tactile recoil!
 */
export function DashboardAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1.5" />
        <rect width="7" height="5" x="14" y="3" rx="1.5" />
        <rect width="7" height="9" x="14" y="12" rx="1.5" />
        <rect width="7" height="5" x="3" y="16" rx="1.5" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.88, rotate: -8 }
          : isHovered
            ? { scale: 1.08, rotate: 2 }
            : { scale: 1, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {/* Tile 1: Top-Left (Tall) - expands up-left */}
      <motion.rect
        width="7"
        height="9"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0}
        initial={false}
        animate={
          isPressed
            ? { x: 4.5, y: 4.5, fill: "currentColor", fillOpacity: 0.4 }
            : isHovered
              ? { x: 1.5, y: 1.5, fill: "currentColor", fillOpacity: 0.25 }
              : { x: 3, y: 3, fill: "currentColor", fillOpacity: isActive ? 0.15 : 0 }
        }
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
      />

      {/* Tile 2: Top-Right (Short) - expands up-right */}
      <motion.rect
        width="7"
        height="5"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0}
        initial={false}
        animate={
          isPressed
            ? { x: 12.5, y: 4.5, fill: "currentColor", fillOpacity: 0.4 }
            : isHovered
              ? { x: 15.5, y: 1.5, fill: "currentColor", fillOpacity: 0.25 }
              : { x: 14, y: 3, fill: "currentColor", fillOpacity: isActive ? 0.15 : 0 }
        }
        transition={{ type: "spring", stiffness: 450, damping: 18, delay: 0.02 }}
      />

      {/* Tile 3: Bottom-Right (Tall) - expands down-right */}
      <motion.rect
        width="7"
        height="9"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0}
        initial={false}
        animate={
          isPressed
            ? { x: 12.5, y: 10.5, fill: "currentColor", fillOpacity: 0.4 }
            : isHovered
              ? { x: 15.5, y: 13.5, fill: "currentColor", fillOpacity: 0.25 }
              : { x: 14, y: 12, fill: "currentColor", fillOpacity: isActive ? 0.15 : 0 }
        }
        transition={{ type: "spring", stiffness: 450, damping: 18, delay: 0.04 }}
      />

      {/* Tile 4: Bottom-Left (Short) - expands down-left */}
      <motion.rect
        width="7"
        height="5"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0}
        initial={false}
        animate={
          isPressed
            ? { x: 4.5, y: 14.5, fill: "currentColor", fillOpacity: 0.4 }
            : isHovered
              ? { x: 1.5, y: 17.5, fill: "currentColor", fillOpacity: 0.25 }
              : { x: 3, y: 16, fill: "currentColor", fillOpacity: isActive ? 0.15 : 0 }
        }
        transition={{ type: "spring", stiffness: 450, damping: 18, delay: 0.03 }}
      />

      {/* Central Quantum Connection Sparkle that flares on hover/press */}
      <motion.circle
        cx="12"
        cy="10.5"
        r="1"
        fill="currentColor"
        stroke="none"
        opacity={0}
        initial={false}
        animate={
          isPressed
            ? { scale: 2.2, opacity: 1 }
            : isHovered
              ? { scale: 1.5, opacity: 0.9 }
              : { scale: 0, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
      />
    </motion.svg>
  );
}

/**
 * 2. ANALYTICS: Equalizer / Stock Chart Live Surge
 */
export function AnalyticsAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 3 0 18 18 0" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.88, y: 1.5 }
          : { scale: 1, y: 0 }
      }
      transition={{ type: "spring", stiffness: 550, damping: 14 }}
    >
      {/* Chart axes */}
      <path d="M3 3v18h18" strokeOpacity={isPressed ? 1 : isHovered ? 0.9 : 0.6} />

      {/* Modern volume bars */}
      <motion.rect
        x="6.5"
        width="2"
        height="2"
        y="18"
        rx="0.75"
        fill="currentColor"
        fillOpacity={0.08}
        stroke="none"
        initial={false}
        animate={
          isPressed
            ? { y: 12, height: 8, fillOpacity: 0.5 }
            : isHovered
              ? { y: 15, height: 5, fillOpacity: 0.25 }
              : { y: 18, height: 2, fillOpacity: isActive ? 0.15 : 0.08 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 16 }}
      />
      <motion.rect
        x="11"
        width="2"
        height="3"
        y="17"
        rx="0.75"
        fill="currentColor"
        fillOpacity={0.08}
        stroke="none"
        initial={false}
        animate={
          isPressed
            ? { y: 8, height: 12, fillOpacity: 0.6 }
            : isHovered
              ? { y: 11, height: 9, fillOpacity: 0.3 }
              : { y: 17, height: 3, fillOpacity: isActive ? 0.15 : 0.08 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 16 }}
      />
      <motion.rect
        x="15.5"
        width="2"
        height="4"
        y="16"
        rx="0.75"
        fill="currentColor"
        fillOpacity={0.08}
        stroke="none"
        initial={false}
        animate={
          isPressed
            ? { y: 5, height: 15, fillOpacity: 0.7 }
            : isHovered
              ? { y: 8, height: 12, fillOpacity: 0.35 }
              : { y: 16, height: 4, fillOpacity: isActive ? 0.15 : 0.08 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 16 }}
      />

      {/* Upward trendline */}
      <motion.path
        d="M7 16l4-4 4 4 5-7"
        initial={false}
        animate={
          isPressed
            ? { strokeWidth: 2.8, y: -2 }
            : isHovered
              ? { strokeWidth: 2.3, y: -1 }
              : { strokeWidth: 2, y: 0 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      />

      {/* Peak node glow */}
      <motion.circle
        cx="20"
        cy="9"
        r="2"
        fill="currentColor"
        initial={false}
        animate={
          isPressed
            ? { scale: 1.6, y: -2 }
            : isHovered
              ? { scale: 1.3, y: -1 }
              : { scale: 1, y: 0 }
        }
        transition={{ type: "spring", stiffness: 550, damping: 13 }}
      />
    </motion.svg>
  );
}

/**
 * 3. SYLLABUS: Precision Radar & Compass Lock
 */
export function SyllabusAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.94, rotate: 25 }
          : { scale: 1, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
    >
      {/* Outer target orbital ring */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        strokeOpacity={isPressed ? 0.9 : isHovered ? 0.8 : 0.5}
        initial={false}
        animate={
          isPressed
            ? { scale: 0.96 }
            : isHovered
              ? { scale: 1.04 }
              : { scale: 1 }
        }
        style={{ originX: "12px", originY: "12px" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      />

      {/* Mid target precision notch ring */}
      <motion.circle
        cx="12"
        cy="12"
        r="6"
        strokeDasharray="4 2"
        initial={false}
        animate={
          isPressed
            ? { rotate: 45, scale: 0.95 }
            : isHovered
              ? { rotate: 30, scale: 1.05 }
              : { rotate: 0, scale: 1 }
        }
        style={{ originX: "12px", originY: "12px" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      />

      {/* Bullseye center aperture lock */}
      <motion.circle
        cx="12"
        cy="12"
        r="2.5"
        fill="currentColor"
        fillOpacity={0.7}
        initial={false}
        animate={
          isPressed
            ? { scale: 1.25, fillOpacity: 1 }
            : isHovered
              ? { scale: 1.18, fillOpacity: 1 }
              : { scale: 1, fillOpacity: isActive ? 0.9 : 0.7 }
        }
        style={{ originX: "12px", originY: "12px" }}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
      />

      {/* Reticle tick marks */}
      {(isHovered || isPressed) && (
        <>
          <motion.line
            x1="12"
            y1="1"
            x2="12"
            y2="3"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: isPressed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.line
            x1="12"
            y1="21"
            x2="12"
            y2="23"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: isPressed ? -1 : 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.line
            x1="1"
            y1="12"
            x2="3"
            y2="12"
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: 1, x: isPressed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.line
            x1="21"
            y1="12"
            x2="23"
            y2="12"
            initial={{ opacity: 0, x: 2 }}
            animate={{ opacity: 1, x: isPressed ? -1 : 0 }}
            transition={{ duration: 0.15 }}
          />
        </>
      )}
    </motion.svg>
  );
}

/**
 * 4. GLOBAL CHAT: Live Typing Indicator & Bubble Compression
 */
export function ChatAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.84, rotate: -12, y: 2 }
          : isHovered
            ? { scale: 1.05, rotate: 0, y: -1.5 }
            : { scale: 1, rotate: 0, y: 0 }
      }
      transition={{ type: "spring", stiffness: 550, damping: 13 }}
    >
      <motion.path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="currentColor"
        fillOpacity={0}
        strokeWidth={2}
        initial={false}
        animate={
          isPressed
            ? { fill: "currentColor", fillOpacity: 0.3, strokeWidth: 2.5 }
            : isHovered
              ? { fill: "currentColor", fillOpacity: 0.12, strokeWidth: 2.2 }
              : { fill: "currentColor", fillOpacity: isActive ? 0.08 : 0, strokeWidth: 2 }
        }
        transition={{ duration: 0.15 }}
      />

      <motion.circle
        cx="8.5"
        cy="10.5"
        r="1.25"
        fill="currentColor"
        stroke="none"
        opacity={isActive ? 0.8 : 0.5}
        initial={false}
        animate={
          isPressed
            ? { y: -3, scale: 1.4, opacity: 1 }
            : isHovered
              ? { y: [-0.5, -2.5, -0.5], opacity: [0.6, 1, 0.6] }
              : { y: 0, opacity: isActive ? 0.8 : 0.5 }
        }
        transition={
          isPressed
            ? { type: "spring", stiffness: 600 }
            : isHovered
              ? { repeat: Infinity, duration: 0.7, delay: 0, ease: "easeInOut" }
              : { duration: 0.15 }
        }
      />
      <motion.circle
        cx="12"
        cy="10.5"
        r="1.25"
        fill="currentColor"
        stroke="none"
        opacity={isActive ? 0.8 : 0.5}
        initial={false}
        animate={
          isPressed
            ? { y: -3, scale: 1.4, opacity: 1 }
            : isHovered
              ? { y: [-0.5, -2.5, -0.5], opacity: [0.6, 1, 0.6] }
              : { y: 0, opacity: isActive ? 0.8 : 0.5 }
        }
        transition={
          isPressed
            ? { type: "spring", stiffness: 600, delay: 0.03 }
            : isHovered
              ? { repeat: Infinity, duration: 0.7, delay: 0.14, ease: "easeInOut" }
              : { duration: 0.15 }
        }
      />
      <motion.circle
        cx="15.5"
        cy="10.5"
        r="1.25"
        fill="currentColor"
        stroke="none"
        opacity={isActive ? 0.8 : 0.5}
        initial={false}
        animate={
          isPressed
            ? { y: -3, scale: 1.4, opacity: 1 }
            : isHovered
              ? { y: [-0.5, -2.5, -0.5], opacity: [0.6, 1, 0.6] }
              : { y: 0, opacity: isActive ? 0.8 : 0.5 }
        }
        transition={
          isPressed
            ? { type: "spring", stiffness: 600, delay: 0.06 }
            : isHovered
              ? { repeat: Infinity, duration: 0.7, delay: 0.28, ease: "easeInOut" }
              : { duration: 0.15 }
        }
      />
    </motion.svg>
  );
}

/**
 * 5. FRIENDS: Social Network Connection & High-Five Bump
 */
export function FriendsAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.88, y: 1 }
          : { scale: 1, y: 0 }
      }
      transition={{ type: "spring", stiffness: 600, damping: 14 }}
    >
      <g>
        <motion.circle
          cx="9"
          cy="7"
          r="4"
          fill="currentColor"
          fillOpacity={0}
          initial={false}
          animate={
            isPressed
              ? { x: 3, y: 0, fill: "currentColor", fillOpacity: 0.35 }
              : isHovered
                ? { x: 1, y: -0.5, fill: "currentColor", fillOpacity: 0.18 }
                : { x: 0, y: 0, fill: "currentColor", fillOpacity: isActive ? 0.1 : 0 }
          }
          transition={{ type: "spring", stiffness: 550, damping: 16 }}
        />
        <motion.path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          strokeWidth={2}
          initial={false}
          animate={
            isPressed
              ? { x: 2, y: 0, strokeWidth: 2.4 }
              : isHovered
                ? { x: 1, y: -0.5, strokeWidth: 2.2 }
                : { x: 0, y: 0, strokeWidth: 2 }
          }
          transition={{ type: "spring", stiffness: 550, damping: 16 }}
        />
      </g>

      <g>
        <motion.path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          strokeWidth={2}
          initial={false}
          animate={
            isPressed
              ? { x: -3.5, y: 0, strokeWidth: 2.4 }
              : isHovered
                ? { x: -1.5, y: -0.5, strokeWidth: 2.2 }
                : { x: 0, y: 0, strokeWidth: 2 }
          }
          transition={{ type: "spring", stiffness: 550, damping: 16 }}
        />
        <motion.path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          strokeWidth={2}
          initial={false}
          animate={
            isPressed
              ? { x: -3, y: 0, strokeWidth: 2.4 }
              : isHovered
                ? { x: -1.5, y: -0.5, strokeWidth: 2.2 }
                : { x: 0, y: 0, strokeWidth: 2 }
          }
          transition={{ type: "spring", stiffness: 550, damping: 16 }}
        />
      </g>

      <motion.circle
        cx="14"
        cy="11"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity={0}
        initial={false}
        animate={
          isPressed
            ? { scale: 2.2, opacity: 1 }
            : isHovered
              ? { scale: 1.4, opacity: 1 }
              : { scale: 0, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
      />
    </motion.svg>
  );
}

/**
 * 6. STUDY GROUPS: Graduation Cap Toss & Tassel Wave
 */
export function GroupsAnimatedIcon({
  isHovered,
  isPressed,
  isActive,
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }

  return (
    <motion.svg
      className={cn("h-5 w-5 overflow-visible", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        isPressed
          ? { scale: 0.85, y: -4, rotate: -10 }
          : isHovered
            ? { scale: 1.05, y: -2, rotate: 6 }
            : { scale: 1, y: 0, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 500, damping: 14 }}
    >
      <motion.path
        d="M22 10l-10-5-10 5 10 5z"
        fill="currentColor"
        fillOpacity={0}
        strokeWidth={2}
        initial={false}
        animate={
          isPressed
            ? { fill: "currentColor", fillOpacity: 0.35, strokeWidth: 2.4 }
            : isHovered
              ? { fill: "currentColor", fillOpacity: 0.18, strokeWidth: 2.2 }
              : { fill: "currentColor", fillOpacity: isActive ? 0.1 : 0, strokeWidth: 2 }
        }
        transition={{ duration: 0.15 }}
      />

      <motion.path
        d="M6 12.5v4.5c3 2.5 9 2.5 12 0v-4.5"
        strokeWidth={2}
        initial={false}
        animate={
          isPressed
            ? { y: 1, strokeWidth: 2.4 }
            : isHovered
              ? { y: 0.5, strokeWidth: 2.2 }
              : { y: 0, strokeWidth: 2 }
        }
        transition={{ duration: 0.15 }}
      />

      <motion.path
        d="M22 10v6"
        strokeWidth={2}
        initial={false}
        animate={
          isPressed
            ? { rotate: -25, x: -1, y: 1 }
            : isHovered
              ? { rotate: 14, x: 0.5 }
              : { rotate: 0, x: 0 }
        }
        style={{ originX: "22px", originY: "10px" }}
        transition={{ type: "spring", stiffness: 450, damping: 12 }}
      />
    </motion.svg>
  );
}
