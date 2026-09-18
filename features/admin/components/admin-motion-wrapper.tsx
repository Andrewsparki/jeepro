"use client";

import React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  adminPageVariants,
  adminStaggerContainer,
  adminFadeUp,
  adminCardVariant,
  adminHoverLift,
  adminTapMicro,
} from "./motion";
import { cn } from "@/lib/utils";

interface AdminPageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AdminPageTransition({
  children,
  className,
  ...props
}: AdminPageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={adminPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("w-full", className)}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
}

interface AdminStaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AdminStagger({
  children,
  className,
  ...props
}: AdminStaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={adminStaggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
}

interface AdminMotionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "fadeUp" | "card";
}

export function AdminMotionItem({
  children,
  className,
  variant = "fadeUp",
  ...props
}: AdminMotionItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  const selectedVariant = variant === "card" ? adminCardVariant : adminFadeUp;

  return (
    <motion.div
      variants={selectedVariant}
      className={className}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
}

interface AdminMotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function AdminMotionCard({
  children,
  className,
  interactive = false,
  ...props
}: AdminMotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={adminCardVariant}
      whileHover={interactive && !shouldReduceMotion ? adminHoverLift : undefined}
      whileTap={interactive && !shouldReduceMotion ? adminTapMicro : undefined}
      className={cn(
        "relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-[border-color,background-color] duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
