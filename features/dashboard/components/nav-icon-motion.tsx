"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type NavIconVariant =
  | "dashboard"
  | "focus"
  | "study"
  | "syllabus"
  | "analytics"
  | "planner"
  | "history"
  | "chat"
  | "friends"
  | "groups"
  | "leaderboard"
  | "achievements"
  | "settings"
  | "default";

interface NavIconMotionProps {
  variant?: NavIconVariant;
  href?: string;
  isHovered: boolean;
  isPressed: boolean;
  isActive: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Resolves a nav href to its appropriate contextual motion variant if not explicitly provided.
 */
export function getNavIconVariant(href?: string): NavIconVariant {
  if (!href) return "default";
  if (href === "/dashboard") return "dashboard";
  if (href.includes("/focus")) return "focus";
  if (href.includes("/study")) return "study";
  if (href.includes("/syllabus")) return "syllabus";
  if (href.includes("/analytics")) return "analytics";
  if (href.includes("/planner")) return "planner";
  if (href.includes("/history")) return "history";
  if (href.includes("/chat")) return "chat";
  if (href.includes("/friends")) return "friends";
  if (href.includes("/groups")) return "groups";
  if (href.includes("/leaderboard")) return "leaderboard";
  if (href.includes("/achievements")) return "achievements";
  if (href.includes("/settings")) return "settings";
  return "default";
}

/**
 * Contextual spring transitions tuned for cute, tactile, premium micro-interactions.
 * All movements remain within 1.5 - 3px or 4 - 25 deg, strictly GPU-accelerated (transform & opacity).
 */
const motionVariants: Record<NavIconVariant, Variants> = {
  // Dashboard: tiny upward lift and settling bounce
  dashboard: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -2.5,
      scale: 1.05,
      transition: { type: "spring", stiffness: 450, damping: 18 },
    },
    tap: {
      y: 0.5,
      scale: 0.94,
      transition: { duration: 0.1 },
    },
  },

  // Focus: subtle sniper/crosshair pulse & slight rotation
  focus: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.08,
      rotate: 45,
      transition: { type: "spring", stiffness: 350, damping: 20 },
    },
    tap: {
      scale: 0.92,
      rotate: 90,
      transition: { duration: 0.12 },
    },
  },

  // Study: book opening effect (gentle 3D tilt perspective/rotation)
  study: {
    rest: { rotate: 0, scale: 1, y: 0 },
    hover: {
      rotate: -7,
      scale: 1.06,
      y: -1.5,
      transition: { type: "spring", stiffness: 400, damping: 16 },
    },
    tap: {
      rotate: 0,
      scale: 0.94,
      transition: { duration: 0.1 },
    },
  },

  // Syllabus: target dart bullseye punch (subtle forward zoom punch)
  syllabus: {
    rest: { scale: 1, x: 0 },
    hover: {
      scale: [1, 1.12, 1.06],
      x: [0, -1, 1, 0],
      transition: { duration: 0.28, ease: "easeOut" },
    },
    tap: {
      scale: 0.93,
      transition: { duration: 0.1 },
    },
  },

  // Analytics: line chart upward rise & subtle stair-step lift
  analytics: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -2.5,
      scale: 1.06,
      transition: { type: "spring", stiffness: 400, damping: 15 },
    },
    tap: {
      y: 1,
      scale: 0.94,
      transition: { duration: 0.1 },
    },
  },

  // Planner: calendar flip tap or cute tilt
  planner: {
    rest: { rotate: 0, y: 0 },
    hover: {
      rotate: [0, -5, 4, 0],
      y: -1.5,
      transition: { duration: 0.32, ease: "easeInOut" },
    },
    tap: {
      rotate: 0,
      y: 0.5,
      scale: 0.93,
      transition: { duration: 0.1 },
    },
  },

  // History: clockwise rewind tick
  history: {
    rest: { rotate: 0 },
    hover: {
      rotate: -35,
      transition: { type: "spring", stiffness: 350, damping: 18 },
    },
    tap: {
      rotate: -70,
      transition: { duration: 0.12 },
    },
  },

  // Chat: bubbly speech pop with quick playful overshoot
  chat: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.09,
      y: -1.5,
      transition: { type: "spring", stiffness: 500, damping: 14 },
    },
    tap: {
      scale: 0.92,
      y: 0,
      transition: { duration: 0.1 },
    },
  },

  // Friends: social sway / subtle shift
  friends: {
    rest: { x: 0, scale: 1 },
    hover: {
      x: [0, -1.5, 1.5, 0],
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    tap: {
      x: 0,
      scale: 0.93,
      transition: { duration: 0.1 },
    },
  },

  // Groups: graduation cap / study group celebratory mini-nod
  groups: {
    rest: { rotate: 0, y: 0, scale: 1 },
    hover: {
      rotate: [0, 8, -6, 0],
      y: -2,
      scale: 1.05,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    tap: {
      rotate: 0,
      y: 0,
      scale: 0.93,
      transition: { duration: 0.1 },
    },
  },

  // Leaderboard: trophy proud upward lift
  leaderboard: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -3,
      scale: 1.08,
      transition: { type: "spring", stiffness: 450, damping: 15 },
    },
    tap: {
      y: 0.5,
      scale: 0.94,
      transition: { duration: 0.1 },
    },
  },

  // Achievements: medal badge shimmer rotation
  achievements: {
    rest: { rotate: 0, scale: 1 },
    hover: {
      rotate: 12,
      scale: 1.08,
      transition: { type: "spring", stiffness: 400, damping: 16 },
    },
    tap: {
      rotate: -10,
      scale: 0.93,
      transition: { duration: 0.1 },
    },
  },

  // Settings: mechanical gear click rotation (40deg)
  settings: {
    rest: { rotate: 0 },
    hover: {
      rotate: 45,
      transition: { type: "spring", stiffness: 300, damping: 18 },
    },
    tap: {
      rotate: 90,
      transition: { duration: 0.15 },
    },
  },

  // Default fallback
  default: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.06,
      y: -1.5,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    tap: {
      scale: 0.94,
      y: 0,
      transition: { duration: 0.1 },
    },
  },
};

import {
  DashboardAnimatedIcon,
  AnalyticsAnimatedIcon,
  SyllabusAnimatedIcon,
  ChatAnimatedIcon,
  FriendsAnimatedIcon,
  GroupsAnimatedIcon,
} from "./custom-nav-icons";

export function NavIconMotion({
  variant,
  href,
  isHovered,
  isPressed,
  isActive,
  className,
  children,
}: NavIconMotionProps) {
  const shouldReduceMotion = useReducedMotion();
  const activeVariantKey = variant || getNavIconVariant(href);

  // High-budget bespoke SVG animated icons
  if (activeVariantKey === "dashboard") {
    return (
      <DashboardAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  if (activeVariantKey === "analytics") {
    return (
      <AnalyticsAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  if (activeVariantKey === "syllabus") {
    return (
      <SyllabusAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  if (activeVariantKey === "chat") {
    return (
      <ChatAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  if (activeVariantKey === "friends") {
    return (
      <FriendsAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  if (activeVariantKey === "groups") {
    return (
      <GroupsAnimatedIcon
        isHovered={isHovered}
        isPressed={isPressed}
        isActive={isActive}
        className={className}
      />
    );
  }

  const selectedVariants = motionVariants[activeVariantKey] || motionVariants.default;

  // Determine current animation state
  let currentStatus: "tap" | "hover" | "rest" = "rest";
  if (isPressed) {
    currentStatus = "tap";
  } else if (isHovered) {
    currentStatus = "hover";
  }

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={selectedVariants}
      animate={currentStatus}
      initial="rest"
    >
      {children}
    </motion.div>
  );
}
