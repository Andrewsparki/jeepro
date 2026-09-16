"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLeaderboard } from "../hooks/use-leaderboard";
import { LeaderboardPodium } from "./leaderboard-podium";
import { LeaderboardRow } from "./leaderboard-row";
import { CurrentUserRankBanner } from "./current-user-rank-banner";
import { PublicProfileModal } from "@/features/friends/components/public-profile-modal";
import {
  Trophy,
  Globe,
  Users,
  RefreshCw,
  UserPlus,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LeaderboardPeriod } from "../types/leaderboard.types";
import { useSmoothScroll } from "@/components/ui/smooth-scroll-provider";

export function LeaderboardView() {
  const {
    scope,
    setScope,
    period,
    setPeriod,
    entries,
    userRank,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useLeaderboard();

  const { resize } = useSmoothScroll();

  // Public profile modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Synchronize Locomotive Scroll dimensions when content height shifts (tabs, filters, loaded data)
  React.useEffect(() => {
    resize();
  }, [scope, period, entries.length, isLoading, resize]);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const podiumEntries = entries.slice(0, 3);
  const listEntries = entries.slice(3);

  // Check if friends list is effectively empty (0 entries, or only the current user)
  const isFriendsEmpty =
    scope === "friends" &&
    !isLoading &&
    (entries.length === 0 || (entries.length === 1 && entries[0].isCurrentUser));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* ── 1. Header & Controls ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Leaderboard
                {isRefreshing && (
                  <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compete with JEE aspirants nationwide and track your rank
              </p>
            </div>
          </div>
        </div>

        {/* Scope Tabs: Global vs Friends */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 backdrop-blur-md rounded-xl border border-border/40 self-start sm:self-auto">
          <button
            onClick={() => setScope("global")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              scope === "global"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-selected={scope === "global"}
            role="tab"
          >
            <Globe className="w-3.5 h-3.5" />
            Global
          </button>
          <button
            onClick={() => setScope("friends")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              scope === "friends"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-selected={scope === "friends"}
            role="tab"
          >
            <Users className="w-3.5 h-3.5" />
            Friends
          </button>
        </div>
      </div>

      {/* ── 2. Time Filter Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "all_time", label: "All Time" },
            ] as { id: LeaderboardPeriod; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border",
                period === t.id
                  ? "bg-accent/15 border-accent/40 text-accent font-bold shadow-sm"
                  : "bg-surface/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/80"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => refresh()}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-md hover:bg-muted/40"
          aria-label="Refresh leaderboard data"
        >
          <RefreshCw
            className={cn(
              "w-3.5 h-3.5",
              (isLoading || isRefreshing) && "animate-spin text-accent"
            )}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── 3. Main Content: Loading, Error, Empty, or Podium + Rows ── */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : error ? (
        <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Could not load leaderboard</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            Try Again
          </Button>
        </div>
      ) : isFriendsEmpty ? (
        <div className="py-12 px-6 rounded-2xl border border-dashed border-border/60 bg-surface/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-foreground">No Friends on Leaderboard</h3>
            <p className="text-xs text-muted-foreground">
              Add study partners and fellow JEE aspirants to compete and compare your progress
              together.
            </p>
          </div>
          <Link href="/friends">
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Find Friends
            </Button>
          </Link>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 px-6 rounded-2xl border border-dashed border-border/60 bg-surface/30 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No rankings yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Complete study sessions and daily missions to start ranking on the JEE Pro leaderboard.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          {podiumEntries.length > 0 && (
            <LeaderboardPodium
              entries={podiumEntries}
              onUserClick={handleUserClick}
            />
          )}

          {/* Ranks 4+ List */}
          {listEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Rank & Aspirant</span>
                <span>Score</span>
              </div>
              <div className="space-y-1.5">
                {listEntries.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    onUserClick={handleUserClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. Current User Rank Banner ─────────────────────────────── */}
      {!isLoading && userRank && (
        <CurrentUserRankBanner
          userRank={userRank}
          onUserClick={handleUserClick}
        />
      )}

      {/* ── 5. Reusable Public Profile Modal ────────────────────────── */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null);
        }}
        onActionComplete={() => {
          // If a friend request was sent or status changed, refresh friends scope
          if (scope === "friends") {
            refresh();
          }
        }}
      />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Podium Skeleton */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 py-6">
        <div className="w-24 sm:w-32 h-36 bg-muted/40 rounded-t-xl" />
        <div className="w-28 sm:w-36 h-48 bg-muted/50 rounded-t-xl" />
        <div className="w-24 sm:w-32 h-32 bg-muted/30 rounded-t-xl" />
      </div>

      {/* Rows Skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-muted/30 border border-border/30"
          />
        ))}
      </div>
    </div>
  );
}
