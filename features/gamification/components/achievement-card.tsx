import { Achievement } from "../services/gamification";
import { Play, BookOpen, Trophy, Flame, Clock, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const IconMap: Record<string, React.ElementType> = {
    "play": Play,
    "book-open": BookOpen,
    "trophy": Trophy,
    "flame": Flame,
    "clock": Clock,
    "star": Star
  };
  
  const Icon = achievement.unlocked ? (IconMap[achievement.icon] || Trophy) : Lock;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
      achievement.unlocked 
        ? "bg-card border-accent/20 hover:border-accent/50 shadow-sm"
        : "bg-muted/30 border-border/40 opacity-75 grayscale-[0.5]"
    )}>
      {achievement.unlocked && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      )}
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl border",
          achievement.unlocked
            ? "bg-accent/10 border-accent/20 text-accent"
            : "bg-muted border-border text-muted-foreground"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className={cn(
            "font-semibold",
            achievement.unlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}
