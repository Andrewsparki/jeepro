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
        "relative rounded-xl bg-secondary border border-border overflow-hidden transition-all duration-200",
        className
      )}
      {...props}
    >
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border/70 bg-surface/50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-surface border border-border text-accent flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent/10 text-accent border border-accent/20">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground font-normal leading-relaxed">
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
      <div className="flex flex-col divide-y divide-border/50">
        {children}
      </div>
    </section>
  );
}

export function SettingRow({
  title,
  description,
  icon: Icon,
  children,
  className,
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
          "flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-5 sm:px-6 gap-3 sm:gap-6 transition-colors duration-150 hover:bg-surface-hover/30",
          className
        )}
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 pr-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-surface border border-border/80 text-accent flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] sm:text-sm font-medium text-foreground tracking-tight leading-snug">
              {title}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground leading-relaxed font-normal">
                {description}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-start sm:justify-end">
          {children}
        </div>
      </div>
    </ContextMenuTarget>
  );
}
