export type Difficulty = "Easy" | "Medium" | "Hard";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const styles = {
    Easy: "bg-green-500/10 text-green-500 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", styles[difficulty], className)}>
      {difficulty}
    </span>
  );
}
