"use client";

import React from "react";
import { CurrentUserRank } from "../types/leaderboard.types";
import { Award, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentUserRankBannerProps {
  userRank: CurrentUserRank | null;
  onUserClick: (userId: string) => void;
}

export function CurrentUserRankBanner({
  userRank,
  onUserClick,
}: CurrentUserRankBannerProps) {
  if (!userRank) return null;

  const initial = (userRank.fullName || "Y").charAt(0).toUpperCase();

  return (
    <div className="sticky bottom-4 z-20 w-full max-w-3xl mx-auto px-2 sm:px-4">
      <div
        onClick={() => onUserClick(userRank.userId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onUserClick(userRank.userId);
          }
        }}
        aria-label={`Your current rank is #${userRank.rank} with ${userRank.totalXp.toLocaleString()} XP`}
        className={cn(
          "relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-accent/40 bg-background/95 backdrop-blur-xl shadow-2xl transition-all hover:scale-[1.01] hover:border-accent/60 cursor-pointer select-none ring-1 ring-accent/20"
        )}
      >
        {/* Left: Rank & Avatar */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Rank highlight */}
          <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] px-2 py-1 rounded-xl bg-accent/15 border border-accent/30 text-accent">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 leading-none">
              Your Rank
            </span>
            <span className="text-base sm:text-lg font-black tracking-tight leading-none mt-1">
              #{userRank.rank}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full border border-accent/50 bg-accent/20 text-accent font-bold flex items-center justify-center overflow-hidden shrink-0">
            {userRank.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userRank.avatarUrl}
                alt={userRank.fullName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-sm">{initial}</span>
            )}
          </div>

          {/* Name & Level */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-foreground truncate">
                {userRank.fullName}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-accent/20 text-accent border border-accent/30 shrink-0">
                You
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 font-medium text-foreground/80">
                <Award className="w-3 h-3 text-accent" />
                Level {userRank.level}
              </span>
              {userRank.totalUsers > 1 && (
                <>
                  <span>•</span>
                  <span>Top {Math.max(1, Math.round((userRank.rank / userRank.totalUsers) * 100))}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: XP Score */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-base sm:text-lg font-black text-foreground tracking-tight">
                {userRank.totalXp.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">
              Earned XP
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
}
