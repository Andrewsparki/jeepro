import type { Variants, Transition } from "framer-motion";

/**
 * Standard cubic-bezier easing curves matching JEE Pro design tokens
 */
export const ADMIN_EASE_FLUID = [0.22, 1, 0.36, 1] as const;
export const ADMIN_EASE_SOFT = [0.4, 0, 0.2, 1] as const;

/**
 * Precision spring physics for control-center UI interactions
 */
export const ADMIN_SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 32,
  mass: 0.7,
};

export const ADMIN_SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.9,
};

export const ADMIN_SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 24,
  mass: 0.7,
};

/**
 * Top-level page entrance variants
 */
export const adminPageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: ADMIN_EASE_FLUID,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: ADMIN_EASE_SOFT,
    },
  },
};

/**
 * Staggered container for dashboard grids, tables, and lists
 */
export const adminStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/**
 * Fade up animation for individual sections and cards
 */
export const adminFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: ADMIN_EASE_FLUID,
    },
  },
};

/**
 * Card reveal with subtle scale and y-translation
 */
export const adminCardVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: ADMIN_EASE_FLUID,
    },
  },
};

/**
 * Row entrance for tables and list items
 */
export const adminRowVariant: Variants = {
  hidden: {
    opacity: 0,
    x: -6,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.24,
      ease: ADMIN_EASE_FLUID,
    },
  },
};

/**
 * Dialog / Panel entrance with scale and depth
 */
export const adminScaleSpring: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ADMIN_SPRING_SNAPPY,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.16,
      ease: ADMIN_EASE_SOFT,
    },
  },
};

/**
 * Tactile button tap micro-interaction preset
 */
export const adminTapMicro = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const adminHoverLift = {
  y: -2,
  transition: { duration: 0.2, ease: ADMIN_EASE_FLUID },
};
