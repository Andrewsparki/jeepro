import { ProgressStatus as Status } from "@/features/study/services/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    "Not Started": {
      color: "text-muted-foreground bg-muted/20 border-border/50",
      icon: <CircleDashed className="w-3.5 h-3.5 mr-1" />
    },
    "In Progress": {
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      icon: <Clock className="w-3.5 h-3.5 mr-1" />
    },
    "Needs Revision": {
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />
    },
    "Mastered": {
      color: "text-accent bg-accent/10 border-accent/20",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
    }
  };

  const { color, icon } = config[status];

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", color, className)}>
      {icon}
      {status}
    </span>
  );
}
