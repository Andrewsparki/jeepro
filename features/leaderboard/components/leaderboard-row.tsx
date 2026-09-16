"use client";

import React from "react";
import { LeaderboardEntry } from "../types/leaderboard.types";
import { cn } from "@/lib/utils";
import { Award, Zap } from "lucide-react";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  onUserClick: (userId: string) => void;
}

export function LeaderboardRow({ entry, onUserClick }: LeaderboardRowProps) {
  const initial = (entry.fullName || "A").charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onUserClick(entry.userId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUserClick(entry.userId);
        }
      }}
      aria-label={`Rank #${entry.rank}: ${entry.fullName}, Level ${entry.level}, ${entry.totalXp.toLocaleString()} XP`}
      className={cn(
        "group relative flex items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none",
        entry.isCurrentUser
          ? "bg-accent/10 border-accent/40 hover:bg-accent/15 hover:border-accent/60 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)] ring-1 ring-accent/30"
          : "bg-surface/50 border-border/40 hover:bg-surface-hover hover:border-border/60"
      )}
    >
      {/* Left: Rank & Avatar & User Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {/* Rank Number */}
        <div className="w-8 sm:w-10 text-center shrink-0">
          <span
            className={cn(
              "text-xs sm:text-sm font-bold tracking-tight",
              entry.isCurrentUser ? "text-accent" : "text-muted-foreground"
            )}
          >
            #{entry.rank}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105",
              entry.isCurrentUser
                ? "border-accent/50 bg-accent/20 text-accent font-bold"
                : "border-border/50 bg-muted text-foreground font-semibold"
            )}
          >
            {entry.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.avatarUrl}
                alt={entry.fullName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-xs sm:text-sm">{initial}</span>
            )}
          </div>
        </div>

        {/* Name & Target Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-xs sm:text-sm font-semibold truncate max-w-[140px] sm:max-w-[220px]",
                entry.isCurrentUser ? "text-accent font-bold" : "text-foreground"
              )}
            >
              {entry.fullName}
            </span>
            {entry.isCurrentUser && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-accent/20 text-accent border border-accent/30 shrink-0">
                You
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
            {entry.targetExam && (
              <span className="truncate max-w-[120px] hidden xs:inline">
                {entry.targetExam} {entry.targetYear ? `'${String(entry.targetYear).slice(-2)}` : ""}
              </span>
            )}
            {entry.targetExam && <span className="hidden xs:inline">•</span>}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground/80">
              <Award className="w-3 h-3 text-muted-foreground" />
              Lv.{entry.level}
            </span>
          </div>
        </div>
      </div>

      {/* Right: XP Score */}
      <div className="text-right shrink-0 pl-1 sm:pl-2">
        <div className="flex items-center justify-end gap-1">
          <Zap className="w-3.5 h-3.5 text-accent shrink-0 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight">
            {entry.totalXp.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">
            XP
          </span>
        </div>
      </div>
    </div>
  );
}
