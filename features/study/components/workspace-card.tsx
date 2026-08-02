"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkspaceCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export function WorkspaceCard({ children, className, delay = 0, hoverEffect = false }: WorkspaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 sm:p-8 transition-all duration-300",
        hoverEffect && "hover:bg-card/50 hover:border-border/60 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
