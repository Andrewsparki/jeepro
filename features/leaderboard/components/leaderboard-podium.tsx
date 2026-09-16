"use client";

import React from "react";
import { LeaderboardEntry } from "../types/leaderboard.types";
import { Crown, Medal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  onUserClick: (userId: string) => void;
}

export function LeaderboardPodium({ entries, onUserClick }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  const first = entries[0];
  const second = entries.length > 1 ? entries[1] : null;
  const third = entries.length > 2 ? entries[2] : null;

  return (
    <div className="w-full py-4 sm:py-6 px-1">
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
        {/* ── 2nd Place (Silver) ────────────────────────────────────── */}
        {second && (
          <PodiumCard
            entry={second}
            rank={2}
            colorClass="text-slate-300"
            borderClass="border-slate-300/40 hover:border-slate-300/70"
            glowClass="from-slate-400/10 via-slate-500/5 to-transparent"
            pedestalClass="h-28 sm:h-36 bg-gradient-to-t from-slate-500/20 to-slate-500/5 border-slate-400/20"
            badgeBg="bg-slate-300/20 text-slate-200 border-slate-300/40"
            avatarSize="w-14 h-14 sm:w-16 sm:h-16"
            onUserClick={onUserClick}
          />
        )}

        {/* ── 1st Place (Gold) ─────────────────────────────────────── */}
        {first && (
          <PodiumCard
            entry={first}
            rank={1}
            colorClass="text-amber-400"
            borderClass="border-amber-400/50 hover:border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.15)]"
            glowClass="from-amber-500/15 via-amber-500/5 to-transparent"
            pedestalClass="h-36 sm:h-48 bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-amber-400/30"
            badgeBg="bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm"
            avatarSize="w-16 h-16 sm:w-20 sm:h-20"
            isFirst
            onUserClick={onUserClick}
          />
        )}

        {/* ── 3rd Place (Bronze) ────────────────────────────────────── */}
        {third && (
          <PodiumCard
            entry={third}
            rank={3}
            colorClass="text-amber-700 dark:text-amber-600"
            borderClass="border-amber-700/40 hover:border-amber-700/70"
            glowClass="from-amber-700/10 via-amber-800/5 to-transparent"
            pedestalClass="h-24 sm:h-30 bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-amber-700/20"
            badgeBg="bg-amber-700/20 text-amber-600 dark:text-amber-500 border-amber-700/40"
            avatarSize="w-14 h-14 sm:w-16 sm:h-16"
            onUserClick={onUserClick}
          />
        )}
      </div>
    </div>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  colorClass: string;
  borderClass: string;
  glowClass: string;
  pedestalClass: string;
  badgeBg: string;
  avatarSize: string;
  isFirst?: boolean;
  onUserClick: (userId: string) => void;
}

function PodiumCard({
  entry,
  rank,
  colorClass,
  borderClass,
  glowClass,
  pedestalClass,
  badgeBg,
  avatarSize,
  isFirst = false,
  onUserClick,
}: PodiumCardProps) {
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
      aria-label={`Rank #${rank}: ${entry.fullName}, Level ${entry.level}, ${entry.totalXp.toLocaleString()} XP`}
      className="relative flex-1 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl transition-transform hover:-translate-y-1 select-none min-w-[95px] max-w-[190px]"
    >
      {/* Ambient background glow */}
      <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-b opacity-50 pointer-events-none -z-10", glowClass)} />

      {/* Crown / Sparkle Icon for 1st Place */}
      <div className="h-7 flex items-center justify-center mb-1">
        {isFirst ? (
          <div className="relative animate-bounce duration-1000">
            <Crown className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-2 animate-pulse" />
          </div>
        ) : rank === 2 ? (
          <Medal className="w-5 h-5 text-slate-300 opacity-90" />
        ) : (
          <Medal className="w-5 h-5 text-amber-700 dark:text-amber-600 opacity-90" />
        )}
      </div>

      {/* Avatar Container with glowing ring */}
      <div className="relative mb-2">
        <div
          className={cn(
            "rounded-full border-2 p-0.5 transition-all overflow-hidden flex items-center justify-center bg-background",
            borderClass,
            avatarSize
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
            <div className="w-full h-full rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-base sm:text-lg">
              {initial}
            </div>
          )}
        </div>

        {/* Rank Number Badge */}
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-black border tracking-wider",
            badgeBg
          )}
        >
          #{rank}
        </div>
      </div>

      {/* User Details */}
      <div className="w-full text-center px-1 mb-2 mt-1">
        <div className="flex items-center justify-center gap-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[110px]">
            {entry.fullName}
          </p>
          {entry.isCurrentUser && (
            <span className="text-[10px] px-1 py-0.2 bg-accent/20 text-accent border border-accent/30 rounded font-medium shrink-0">
              You
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">Lv.{entry.level}</span>
          <span>•</span>
          <span className={cn("font-bold", colorClass)}>
            {entry.totalXp.toLocaleString()} <span className="text-[10px] font-medium opacity-80">XP</span>
          </span>
        </div>
      </div>

      {/* Podium Pedestal Pillar */}
      <div
        className={cn(
          "w-full rounded-t-xl border-t border-x flex flex-col items-center justify-start pt-2 sm:pt-3 transition-colors",
          pedestalClass
        )}
      >
        <span className={cn("text-lg sm:text-2xl font-black opacity-30", colorClass)}>
          {rank}
        </span>
      </div>
    </div>
  );
}
