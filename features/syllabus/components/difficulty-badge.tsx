export type Difficulty = "Easy" | "Medium" | "Hard";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const styles = {
    Easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-700 dark:text-yellow-500 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", styles[difficulty], className)}>
      {difficulty}
    </span>
  );
}
