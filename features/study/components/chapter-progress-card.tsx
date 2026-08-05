"use client";

import { WorkspaceCard } from "./workspace-card";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { Target, TrendingUp, Flame } from "lucide-react";

interface ChapterProgressCardProps {
  completionPercentage: number;
}

export function ChapterProgressCard({ completionPercentage }: ChapterProgressCardProps) {
  return (
    <WorkspaceCard delay={0.2} className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      <div className="flex-shrink-0">
        <ProgressRing 
          progress={completionPercentage} 
          size={160} 
          strokeWidth={10} 
        />
      </div>
      
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Weekly Goal</span>
          </div>
          <p className="text-3xl font-semibold tracking-tight">3<span className="text-lg text-muted-foreground font-medium"> / 5 hrs</span></p>
          <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[60%] rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Revision Score</span>
          </div>
          <p className="text-3xl font-semibold tracking-tight">85<span className="text-lg text-muted-foreground font-medium"> / 100</span></p>
          <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[85%] rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">Consistency</span>
          </div>
          <p className="text-3xl font-semibold tracking-tight">4<span className="text-lg text-muted-foreground font-medium"> day streak</span></p>
          <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[100%] rounded-full" />
          </div>
        </div>

      </div>
    </WorkspaceCard>
  );
}
