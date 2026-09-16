import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "maintenance" | "offline";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG = {
  online: {
    label: "Online",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  maintenance: {
    label: "Maintenance",
    dotColor: "bg-amber-400",
    textColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  offline: {
    label: "Offline",
    dotColor: "bg-red-400",
    textColor: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
  },
};

const SIZE_CONFIG = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        SIZE_CONFIG[size],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dotColor)} />
      {config.label}
    </span>
  );
}
