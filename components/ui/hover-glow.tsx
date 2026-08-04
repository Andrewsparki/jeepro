"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLighting } from "./lighting-provider";

export const HoverGlow = React.memo(function HoverGlow({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { isTouch } = useLighting();

  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Pre-blurred gradient bg — only animate opacity, not blur */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)",
        }}
      />
      <div className="relative">
        {children}
      </div>
    </div>
  );
});
