"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { dispatchInteractionSound } from "@/lib/sound-engine";

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
  const shouldReduceMotion = useReducedMotion();

  // Cinematic entrance is triggered on initial page mount when data arrives.
  // Filter/tab switches (scope/period) use lightweight transitions instead of replaying the entire assembly.
  const [isInitialEntrance, setIsInitialEntrance] = useState(true);
  const isCinematic = isInitialEntrance && !shouldReduceMotion;

  useEffect(() => {
    if (!isLoading && entries.length > 0 && isInitialEntrance) {
      // Allow entrance sequence to finish (~1.4s), then set initial entrance to false for snappy filter changes
      const timer = setTimeout(() => {
        setIsInitialEntrance(false);
        resize();
      }, 1450);
      return () => clearTimeout(timer);
    }
  }, [isLoading, entries.length, isInitialEntrance, resize]);

  // Public profile modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Synchronize Locomotive Scroll dimensions when content height shifts (tabs, filters, loaded data)
  useEffect(() => {
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
      {/* ── 1. Header & Controls (Phase 1: Atmosphere 0–250ms) ──────── */}
      <motion.div
        initial={isCinematic && !shouldReduceMotion ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5"
      >
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
        <div className="flex items-center gap-1 p-1 bg-muted/60 backdrop-blur-md rounded-xl border border-border/40 self-start sm:self-auto relative">
          {(["global", "friends"] as const).map((s) => {
            const isActive = scope === s;
            const Icon = s === "global" ? Globe : Users;
            const label = s === "global" ? "Global" : "Friends";

            return (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 z-10 select-none",
                  isActive
                    ? "text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-selected={isActive}
                role="tab"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLeaderboardScope"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── 2. Time Filter Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface/50 border border-border/40 relative">
          {(
            [
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "all_time", label: "All Time" },
            ] as { id: LeaderboardPeriod; label: string }[]
          ).map((t) => {
            const isActive = period === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  dispatchInteractionSound("ui.tab");
                  setPeriod(t.id);
                }}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 z-10 select-none",
                  isActive
                    ? "text-accent font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLeaderboardPeriod"
                    className="absolute inset-0 bg-accent/15 border border-accent/40 rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          onClick={() => refresh()}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-md hover:bg-muted/40 cursor-pointer disabled:opacity-50"
          aria-label="Refresh leaderboard data"
        >
          <RefreshCw
            className={cn(
              "w-3.5 h-3.5",
              (isLoading || isRefreshing) && "animate-spin text-accent"
            )}
          />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
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
          <Link href="/dashboard/friends">
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
          {/* Top 3 Podium with Cinematic Reveal Sequence */}
          {podiumEntries.length > 0 && (
            <LeaderboardPodium
              entries={podiumEntries}
              isCinematic={isCinematic}
              onUserClick={handleUserClick}
            />
          )}

          {/* Ranks 4+ List with Staggered Locking Cascade */}
          {listEntries.length > 0 && (
            <div className="space-y-2">
              <motion.div
                initial={isCinematic && !shouldReduceMotion ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isCinematic ? 1.02 : 0, duration: 0.25 }}
                className="flex items-center justify-between px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                <span>Rank & Aspirant</span>
                <span>Score</span>
              </motion.div>
              <div className="space-y-1.5">
                {listEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    index={index}
                    isCinematic={isCinematic}
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
          isCinematic={isCinematic}
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
