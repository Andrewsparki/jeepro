"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function GlassSection({ title, description, icon: Icon, children, className, ...props }: GlassSectionProps) {
  return (
    <section 
      className={cn(
        "rounded-3xl p-6 sm:p-8 bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] space-y-6 overflow-hidden",
        className
      )} 
      {...props}
    >
      {/* Header Info */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-white/80" />}
          <span>{title}</span>
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-white/60 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Settings Rows */}
      <div className="space-y-4 pt-2">
        {children}
      </div>
    </section>
  );
}

// Helper component for individual settings rows matching the screenshot
export function SettingRow({
  title,
  description,
  children,
  className,
  isLast = false
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  isLast?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-3.5 gap-4",
      !isLast && "border-b border-white/[0.06]",
      className
    )}>
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm font-semibold text-white tracking-tight">{title}</span>
        {description && <span className="text-xs text-white/60 leading-snug">{description}</span>}
      </div>
      <div className="shrink-0 flex items-center justify-end">
        {children}
      </div>
    </div>
  );
}
