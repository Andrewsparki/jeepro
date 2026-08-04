import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function InfoCard({ title, children, className, delay = 0 }: InfoCardProps) {
  return (
    <div 
      className={cn("p-6 rounded-2xl border border-glass-border bg-surface animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface SidebarCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  highlight?: boolean;
}

export function SidebarCard({ title, children, className, delay = 0, highlight = false }: SidebarCardProps) {
  return (
    <div 
      className={cn(
        "p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both",
        highlight 
          ? "border-primary/20 bg-primary/5" 
          : "border-glass-border bg-surface",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <h3 className={cn(
        "text-sm font-semibold uppercase tracking-wider mb-3",
        highlight ? "text-primary" : "text-muted-foreground"
      )}>
        {title}
      </h3>
      {children}
    </div>
  );
}
