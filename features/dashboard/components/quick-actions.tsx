"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play, Calendar, Target, Clock, LineChart } from "lucide-react";
import { useStudySession } from "@/features/study/context/study-session-context";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";

const actions = [
  {
    label: "Start Study Sprint",
    icon: <Play className="w-4 h-4" />,
    href: "start",
    badge: "Active",
  },
  {
    label: "Focus Chamber",
    icon: <Clock className="w-4 h-4" />,
    href: "/dashboard/focus",
  },
  {
    label: "90-Ch Syllabus",
    icon: <Target className="w-4 h-4" />,
    href: "/dashboard/syllabus",
  },
  {
    label: "Study Planner",
    icon: <Calendar className="w-4 h-4" />,
    href: "/dashboard/planner",
  },
  {
    label: "Analytics Telemetry",
    icon: <LineChart className="w-4 h-4" />,
    href: "/dashboard/analytics",
  },
];

export const QuickActions = React.memo(function QuickActions() {
  const router = useRouter();
  const { startSession } = useStudySession();
  const { playSound } = useSettings();

  const handleAction = (href: string) => {
    playSound("soft-tap");
    if (href === "start") {
      startSession();
    } else {
      router.push(href);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#090C15] border border-white/[0.08] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          Fast Command Actions
        </h3>
        <span className="font-mono text-[10px] text-zinc-400">
          SHORTCUTS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action.href)}
            className={cn(
              "p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all text-left flex flex-col justify-between gap-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200 group-hover:text-white transition-colors">
              {action.icon}
            </div>

            <div>
              <span className="block text-xs font-semibold text-white tracking-tight">
                {action.label}
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                {action.href === "start" ? "Instant Timer" : "Open Route"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
