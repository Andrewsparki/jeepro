"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WorkspaceEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function WorkspaceEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: WorkspaceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-2xl border border-glass-border bg-surface-hover flex items-center justify-center mb-6 shadow-glass relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Icon className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors duration-500 relative z-10" />
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction || (() => toast("Coming soon"))} variant="outline" className="rounded-full">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
