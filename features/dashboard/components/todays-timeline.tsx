"use client";

import React from "react";
import { PlannerEvent } from "@/features/planner/services/planner.service";
import { Calendar, Play, CheckCircle2, CircleDashed, FileText, Beaker, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TodaysTimelineProps {
  events: PlannerEvent[];
}

export const TodaysTimeline = React.memo(function TodaysTimeline({ events }: TodaysTimelineProps) {
  const router = useRouter();

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
        <Calendar className="w-10 h-10 mb-4 opacity-50" />
        <p className="font-medium text-foreground">No sessions planned today</p>
        <p className="text-sm mt-1 mb-4">Open the planner to schedule your studies.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/planner")}>
          Open Planner
        </Button>
      </div>
    );
  }

  const getEventIcon = (type: string, status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    switch (type) {
      case "Study Session": return <Library className="w-4 h-4 text-blue-500" />;
      case "Revision Session": return <FileText className="w-4 h-4 text-purple-500" />;
      case "Mock Test": return <Beaker className="w-4 h-4 text-orange-500" />;
      default: return <CircleDashed className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-0 relative">
      <div className="absolute left-6 top-4 bottom-4 w-px bg-border/50" />
      
      {sortedEvents.map((event, idx) => {
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);
        
        const timeFormatted = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        const isCompleted = event.status === "completed";
        const isNext = !isCompleted && (idx === 0 || sortedEvents[idx-1]?.status === "completed");

        return (
          <div key={event.id} className={cn("relative flex items-start gap-6 p-4 rounded-xl transition-colors group", isNext && "bg-accent/5")}>
            <div className={cn("relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", 
              isCompleted ? "bg-background" : "bg-card border border-border"
            )}>
              {getEventIcon(event.event_type, event.status)}
            </div>
            
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center justify-between gap-4">
                <h4 className={cn("text-sm font-medium truncate transition-colors", 
                  isCompleted ? "text-muted-foreground line-through opacity-70" : "text-foreground",
                  isNext && "text-accent"
                )}>
                  {event.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeFormatted}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground capitalize">
                  {event.event_type}
                </span>
                
                {!isCompleted && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => router.push(event.event_type === "Mock Test" ? "/dashboard/practice" : "/dashboard/study")}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
