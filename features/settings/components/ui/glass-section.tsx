"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ContextMenuTarget } from "@/features/context-menu";

interface GlassSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ElementType;
  badge?: string;
  headerAction?: React.ReactNode;
}

export function GlassSection({
  title,
  description,
  icon: Icon,
  badge,
  headerAction,
  children,
  className,
  ...props
}: GlassSectionProps) {
  return (
    <section
      className={cn(
        "relative rounded-3xl sm:rounded-[2rem] p-6 sm:p-8",
        "bg-card text-card-foreground border border-border/70 shadow-soft dark:bg-[#0d121c]/45 dark:border-white/[0.12] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)]",
        "overflow-hidden transition-all duration-300",
        // Specular top highlight
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/30 before:to-transparent before:pointer-events-none",
        // Ambient soft surface sheen
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/[0.02] after:to-transparent after:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Section Header */}
      <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-border/40 dark:border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-muted/60 border border-border/60 text-foreground dark:bg-white/[0.08] dark:border-white/15 dark:text-white/90 flex items-center justify-center shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-muted/80 text-muted-foreground border border-border/60 dark:bg-white/10 dark:text-white/80 dark:border-white/10">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {headerAction && (
          <div className="shrink-0 flex items-center">{headerAction}</div>
        )}
      </div>

      {/* Settings Rows Group */}
      <div className="relative z-10 pt-2 flex flex-col">
        {children}
      </div>
    </section>
  );
}

// Apple iOS/macOS styled grouped setting row with optional squircle icon badge
export function SettingRow({
  title,
  description,
  icon: Icon,
  iconGradient = "from-blue-500 to-indigo-600",
  iconColor = "text-white",
  children,
  className,
  isLast = false,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  iconGradient?: string;
  iconColor?: string;
  children?: React.ReactNode;
  className?: string;
  isLast?: boolean;
}) {
  return (
    <ContextMenuTarget
      type="setting-item"
      id={title.toLowerCase().replace(/\s+/g, "-")}
      title={title}
      data={{ title, description }}
    >
      <div
        className={cn(
          "relative flex items-center justify-between py-3.5 sm:py-4 px-2 sm:px-3 rounded-2xl gap-4",
          "transition-colors duration-200 hover:bg-muted/40 dark:hover:bg-white/[0.03] group",
          className
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          {Icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-[11px] bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md",
                "border border-white/20 transition-transform duration-200 group-hover:scale-105",
                iconGradient,
                iconColor
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground tracking-tight leading-snug">
              {title}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground leading-relaxed font-normal">
                {description}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end relative z-10">
          {children}
        </div>

        {/* Indented hairline divider matching native grouped tables */}
        {!isLast && (
          <div
            className={cn(
              "absolute bottom-0 right-3 h-px bg-border/40 dark:bg-white/[0.06] pointer-events-none",
              Icon ? "left-14 sm:left-15" : "left-3"
            )}
          />
        )}
      </div>
    </ContextMenuTarget>
  );
}
