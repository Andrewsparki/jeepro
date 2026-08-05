import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface GlassSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function GlassSection({ title, description, icon: Icon, children, className, ...props }: GlassSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex items-center gap-3 px-1">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      
      <GlassCard className="p-1 overflow-hidden" interactive={false}>
        <div className="bg-surface/30 rounded-[14px]">
          {children}
        </div>
      </GlassCard>
    </section>
  );
}

// Helper component for individual settings rows
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
      "flex items-center justify-between p-4 transition-colors hover:bg-surface/50",
      !isLast && "border-b border-border/50",
      className
    )}>
      <div className="flex flex-col gap-1 pr-6">
        <span className="text-sm font-medium leading-none">{title}</span>
        {description && <span className="text-xs text-muted-foreground leading-snug">{description}</span>}
      </div>
      <div className="shrink-0 flex items-center justify-end">
        {children}
      </div>
    </div>
  );
}
