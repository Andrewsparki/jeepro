"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play, Calendar, Target, Layers, Sparkles } from "lucide-react";
import { useStudySession } from "@/features/study/context/study-session-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const actions = [
  {
    label: "Start Session",
    icon: <Play className="w-5 h-5" />,
    href: "start", // Custom handler
    color: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
  },
  {
    label: "Open Planner",
    icon: <Calendar className="w-5 h-5" />,
    href: "/dashboard/planner",
    color: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
  },
  {
    label: "Practice PYQs",
    icon: <Target className="w-5 h-5" />,
    href: "/dashboard/practice",
    color: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
  },
  {
    label: "Flashcards",
    icon: <Layers className="w-5 h-5" />,
    href: "/dashboard/study",
    color: "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white"
  },
  {
    label: "AI Tutor",
    icon: <Sparkles className="w-5 h-5" />,
    href: "/dashboard/tutor",
    color: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
  }
];

export const QuickActions = React.memo(function QuickActions() {
  const router = useRouter();
  const { startSession } = useStudySession();

  const handleAction = (href: string) => {
    if (href === "start") {
      startSession();
    } else if (href === "/dashboard/practice" || href === "/dashboard/tutor") {
      toast("Coming soon", { description: "This feature is not yet implemented." });
    } else {
      router.push(href);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => handleAction(action.href)}
          className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border/40 hover:border-border transition-all duration-300 hover:shadow-sm active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300", action.color)}>
            {action.icon}
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
});
