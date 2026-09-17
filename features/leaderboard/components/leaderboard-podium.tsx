"use client";

import React from "react";
import { LeaderboardEntry } from "../types/leaderboard.types";
import { Crown, Medal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  onUserClick: (userId: string) => void;
  isCinematic?: boolean;
}

export function LeaderboardPodium({
  entries,
  onUserClick,
  isCinematic = true,
}: LeaderboardPodiumProps) {
  const shouldReduceMotion = useReducedMotion();
  const cinematic = isCinematic && !shouldReduceMotion;

  if (entries.length === 0) return null;

  const first = entries[0];
  const second = entries.length > 1 ? entries[1] : null;
  const third = entries.length > 2 ? entries[2] : null;

  return (
    <div className="relative w-full py-4 sm:py-6 px-1">
      {/* ── Spotlight & Ambient Lighting behind Podium (Restrained, GPU-friendly) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
        {/* Main Golden Spotlight centered on #1 */}
        <motion.div
          initial={cinematic ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: cinematic ? 0.45 : 0,
            duration: cinematic ? 0.75 : 0.2,
            ease: "easeOut",
          }}
          className="w-[320px] sm:w-[460px] h-[240px] sm:h-[320px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(251, 191, 36, 0.13) 0%, rgba(251, 191, 36, 0.035) 45%, transparent 75%)",
          }}
        />

        {/* Secondary soft ambient fill */}
        <motion.div
          initial={cinematic ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: cinematic ? 0.2 : 0, duration: 0.6 }}
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/80 via-transparent to-transparent"
        />
      </div>

      {/* Podium Cards Container */}
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
            isCinematic={cinematic}
            shouldReduceMotion={!!shouldReduceMotion}
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
            isCinematic={cinematic}
            shouldReduceMotion={!!shouldReduceMotion}
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
            isCinematic={cinematic}
            shouldReduceMotion={!!shouldReduceMotion}
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
  isCinematic: boolean;
  shouldReduceMotion: boolean;
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
  isCinematic,
  shouldReduceMotion,
  onUserClick,
}: PodiumCardProps) {
  const initial = (entry.fullName || "A").charAt(0).toUpperCase();

  // Order of reveal: #3 FIRST (~0.22s), #2 SECOND (~0.38s), #1 LAST (~0.58s)
  const entryDelay = rank === 3 ? 0.22 : rank === 2 ? 0.38 : 0.58;
  const entryDuration = rank === 3 ? 0.42 : rank === 2 ? 0.44 : 0.48;

  // Staggered internal reveals based on rank
  const medalDelay = rank === 3 ? 0.44 : rank === 2 ? 0.6 : 0.96;
  const avatarDelay = rank === 3 ? 0.5 : rank === 2 ? 0.66 : 0.82;
  const detailsDelay = rank === 3 ? 0.56 : rank === 2 ? 0.72 : 1.05;

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : isCinematic
          ? { opacity: 0, y: 75, scale: 0.97 }
          : { opacity: 0, y: 8, scale: 1 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: isCinematic ? entryDelay : 0,
        duration: isCinematic ? entryDuration : 0.2,
        ease: [0.16, 1, 0.3, 1], // Smooth elegant ease-out without bounce
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.15 } }}
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
      className="relative flex-1 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl select-none min-w-[95px] max-w-[190px]"
    >
      {/* Ambient background glow */}
      {isFirst ? (
        <motion.div
          initial={isCinematic ? { opacity: 0, scale: 0.95 } : { opacity: 0.5, scale: 1 }}
          animate={
            isCinematic && !shouldReduceMotion
              ? {
                  opacity: [0, 0.85, 0.5],
                  scale: [0.95, 1.03, 1],
                }
              : { opacity: 0.5, scale: 1 }
          }
          transition={
            isCinematic
              ? {
                  delay: 1.02,
                  duration: 0.65,
                  ease: "easeOut",
                }
              : { duration: 0.2 }
          }
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-b pointer-events-none -z-10",
            glowClass
          )}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-b opacity-50 pointer-events-none -z-10",
            glowClass
          )}
        />
      )}

      {/* Current User Highlight Ring (if on podium) */}
      {entry.isCurrentUser && (
        <motion.div
          initial={isCinematic ? { opacity: 0 } : { opacity: 1 }}
          animate={
            isCinematic && !shouldReduceMotion
              ? { opacity: [0, 0.9, 0.4] }
              : { opacity: 0.4 }
          }
          transition={
            isCinematic
              ? { delay: entryDelay + 0.35, duration: 0.6, ease: "easeOut" }
              : { duration: 0.2 }
          }
          className="absolute -inset-0.5 rounded-2xl border-2 border-accent/40 pointer-events-none -z-5"
        />
      )}

      {/* Crown / Sparkle Icon for 1st Place, or Medals for 2nd/3rd */}
      <div className="h-7 flex items-center justify-center mb-1">
        {isFirst ? (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : isCinematic
                ? { opacity: 0, y: 8, scale: 0.8 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              isCinematic
                ? {
                    delay: 0.96,
                    duration: 0.38,
                    ease: [0.34, 1.25, 0.64, 1], // Subtle crown overshoot
                  }
                : { duration: 0.2 }
            }
          >
            {/* Crown gentle floating motion after entrance settles */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: isCinematic ? 1.4 : 0.2,
              }}
              className="relative"
            >
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-2 opacity-80" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : isCinematic
                ? { opacity: 0, y: 6 }
                : { opacity: 1, y: 0 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              isCinematic
                ? { delay: medalDelay, duration: 0.28, ease: "easeOut" }
                : { duration: 0.2 }
            }
          >
            {rank === 2 ? (
              <Medal className="w-5 h-5 text-slate-300 opacity-90" />
            ) : (
              <Medal className="w-5 h-5 text-amber-700 dark:text-amber-600 opacity-90" />
            )}
          </motion.div>
        )}
      </div>

      {/* Avatar Container with glowing ring */}
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : isCinematic
            ? { opacity: 0, scale: 0.86 }
            : { opacity: 1, scale: 1 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={
          isCinematic
            ? { delay: avatarDelay, duration: 0.32, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.2 }
        }
        className="relative mb-2"
      >
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
      </motion.div>

      {/* User Details */}
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : isCinematic
            ? { opacity: 0, y: 4 }
            : { opacity: 1, y: 0 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={
          isCinematic
            ? { delay: detailsDelay, duration: 0.25, ease: "easeOut" }
            : { duration: 0.2 }
        }
        className="w-full text-center px-1 mb-2 mt-1"
      >
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
      </motion.div>

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
    </motion.div>
  );
}

