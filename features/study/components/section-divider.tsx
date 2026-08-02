import { cn } from "@/lib/utils";

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export function SectionDivider({ label, className }: SectionDividerProps) {
  if (label) {
    return (
      <div className={cn("relative py-12 flex items-center", className)}>
        <div className="flex-grow border-t border-border/30"></div>
        <span className="flex-shrink-0 mx-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <div className="flex-grow border-t border-border/30"></div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent my-16", className)} />
  );
}
