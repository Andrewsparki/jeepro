"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const HoverGlow = React.memo(function HoverGlow({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
});
