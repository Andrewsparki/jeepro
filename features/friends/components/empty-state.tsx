"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-surface/50 border border-border/30 max-w-md mx-auto my-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="text-xs font-semibold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground px-4 h-9"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
