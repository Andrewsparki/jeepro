"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Flame,
  Zap,
  Award,
  Trophy,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Gift,
  Compass,
  GraduationCap,
  Calendar,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserBirthdayRecapData, BirthdayService, DEFAULT_BIRTHDAY_REWARD } from "../services/birthday.service";
import { playRecapSound } from "../lib/birthday-audio-engine";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface BirthdayRecapStoryProps {
  recap: UserBirthdayRecapData;
  onClose: () => void;
  onClaimSuccess?: (xpEarned: number) => void;
}

type SlideId =
  | "intro"
  | "time"
  | "mastery"
  | "streak"
  | "trophies"
  | "gift"
  | "finale";

const SLIDES: Array<{ id: SlideId; title: string }> = [
  { id: "intro", title: "Celebration" },
  { id: "time", title: "Deep Work" },
  { id: "mastery", title: "Mastery" },
  { id: "streak", title: "Momentum" },
  { id: "trophies", title: "Milestones" },
  { id: "gift", title: "Honor Grant" },
  { id: "finale", title: "The Road Ahead" },
];

export function BirthdayRecapStory({ recap, onClose, onClaimSuccess }: BirthdayRecapStoryProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isOpeningGift, setIsOpeningGift] = useState(false);
  const [isClaimed, setIsClaimed] = useState(recap.isAlreadyClaimedThisYear);
  const [earnedXP, setEarnedXP] = useState<number>(recap.isAlreadyClaimedThisYear ? 500 : 0);
  const [soundMuted, setSoundMuted] = useState(false);
  
  const currentSlide = SLIDES[currentSlideIndex].id;
  const slideStartTimeRef = useRef<number>(0);

  // Trigger audio per slide
  const playSlideAudio = useCallback((slide: SlideId) => {
    if (soundMuted) return;
    switch (slide) {
      case "intro":
        playRecapSound("drone");
        setTimeout(() => playRecapSound("introChime"), 400);
        break;
      case "time":
        playRecapSound("statReveal");
        break;
      case "mastery":
        playRecapSound("masterySwell");
        break;
      case "streak":
        playRecapSound("streakIgnite");
        break;
      case "trophies":
        playRecapSound("achievementFanfare");
        break;
      case "gift":
        playRecapSound("statReveal");
        break;
      case "finale":
        playRecapSound("finaleHarmonics");
        break;
    }
  }, [soundMuted]);

  useEffect(() => {
    playSlideAudio(currentSlide);
    slideStartTimeRef.current = Date.now();
  }, [currentSlideIndex, currentSlide, playSlideAudio]);

  const handleNext = useCallback(() => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      dispatchInteractionSound("ui.navigation");
    } else {
      onClose();
    }
  }, [currentSlideIndex, onClose]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      dispatchInteractionSound("ui.navigation");
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const handleOpenGift = async () => {
    if (isOpeningGift || isClaimed) return;

    setIsOpeningGift(true);
    playRecapSound("unboxing");
    triggerCinematicConfetti();

    try {
      const res = await BirthdayService.claimBirthdayReward(DEFAULT_BIRTHDAY_REWARD);
      const xp = res.success ? res.xpEarned : DEFAULT_BIRTHDAY_REWARD.xpAmount;
      setEarnedXP(xp);
      setIsClaimed(true);
      if (onClaimSuccess && res.success) onClaimSuccess(xp);

      setTimeout(() => {
        setIsOpeningGift(false);
        playRecapSound("rewardCelebration");
      }, 700);
    } catch {
      setIsClaimed(true);
      setIsOpeningGift(false);
    }
  };

  const handleReplay = () => {
    setCurrentSlideIndex(0);
  };

  const toggleSound = () => {
    setSoundMuted((prev) => !prev);
    dispatchInteractionSound("ui.press");
  };

  return (
    <div className="relative w-full h-full min-h-[580px] max-w-4xl flex flex-col items-center justify-between text-white select-none">
      {/* Top Bar Navigation & Progress Indicators */}
      <header className="w-full flex flex-col gap-3 z-30 pt-2 sm:pt-4 px-4 sm:px-6">
        {/* Story Segment Bars */}
        <div className="w-full flex items-center gap-1.5 sm:gap-2">
          {SLIDES.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            const isPassed = idx < currentSlideIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  dispatchInteractionSound("ui.tab");
                }}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/15 cursor-pointer relative group transition-all"
                title={s.title}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    isActive
                      ? "w-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                      : isPassed
                      ? "w-full bg-white/70"
                      : "w-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Brand & Actions Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-amber-300 uppercase font-semibold">
              CHAPTER {currentSlideIndex + 1}/{SLIDES.length}: {SLIDES[currentSlideIndex].title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title={soundMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dynamic Story Arena */}
      <main className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8 z-20">
        <AnimatePresence mode="wait">
          {/* SLIDE 0: BIRTHDAY AWAKENING */}
          {currentSlide === "intro" && (
            <motion.div
              key="slide-intro"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center gap-6 max-w-xl"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 rounded-full bg-gradient-to-tr from-amber-500/30 via-amber-500/20 to-emerald-500/30 blur-2xl"
                />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400/20 to-emerald-600/20 border border-amber-400/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                  <GraduationCap className="w-12 h-12 sm:w-14 sm:h-14 text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Annual Birthday Tribute</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-amber-200">
                  Happy Birthday, {recap.userName}!
                </h1>
                <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed font-normal">
                  Another orbit around the sun. Another year of resilience, discipline, and ambition.
                  JEE Pro has synthesized your real journey so far.
                </p>
              </div>

              <button
                onClick={handleNext}
                className="mt-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-pink-500 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Begin Your Recap</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </motion.div>
          )}

          {/* SLIDE 1: TIME & DEEP WORK HOURS */}
          {currentSlide === "time" && (
            <motion.div
              key="slide-time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-2xl w-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                <Clock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  DEEP WORK & STUDY DISCIPLINE
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  The Hours You Carved Out
                </h2>
              </div>

              {/* Big Stat Hero Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Total Time Box */}
                <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-50" />
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Total Immersion Time
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-100 font-mono">
                    <AnimatedCounter
                      value={recap.totalStudyHours > 0 ? recap.totalStudyHours : recap.totalStudyMinutes}
                      suffix={recap.totalStudyHours > 0 ? "h" : "m"}
                    />
                    {recap.totalStudyHours > 0 && (
                      <span className="text-2xl sm:text-3xl text-cyan-300/70 ml-2 font-normal">
                        {recap.totalStudyMinutes}m
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {recap.totalStudySeconds > 0
                      ? `Dedicated across ${recap.totalSessions} focused study sessions`
                      : "The genesis of your study journey begins today"}
                  </p>
                </div>

                {/* Longest Session & Study Tendency */}
                <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#78A9FF]/10 to-transparent opacity-50" />
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Peak Deep Work Block
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#78A9FF] font-mono">
                    <AnimatedCounter value={recap.longestSessionMinutes} suffix="m" />
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#78A9FF]/15 border border-[#78A9FF]/30 text-[#78A9FF] text-[11px] font-medium">
                    <Compass className="w-3 h-3" />
                    <span>
                      {recap.studyTendency === "night_owl"
                        ? "Night Owl Scholar 🌙"
                        : recap.studyTendency === "early_bird"
                        ? "Early Bird Achiever ☀️"
                        : "Focused Strategist 🎯"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                {recap.totalStudySeconds > 0
                  ? "Every minute spent solving problems brings you closer to mastering the IIT JEE syllabus."
                  : "Every master once stood at the starting line. Your hours will define your breakthrough."}
              </p>
            </motion.div>
          )}

          {/* SLIDE 2: MASTERY & FAVORITE SUBJECT */}
          {currentSlide === "mastery" && (
            <motion.div
              key="slide-mastery"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-2xl w-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                <BookOpen className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-emerald-400">
                  SYLLABUS CONQUEST
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Your Academic Battleground
                </h2>
              </div>

              {/* Subject Breakdown Card */}
              <div className="w-full p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {/* Topics Mastered Box */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300 font-mono font-bold text-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        <AnimatedCounter value={recap.topicsMastered} /> Topics
                      </div>
                      <span className="text-xs text-emerald-300/80">Mastered in Syllabus</span>
                    </div>
                  </div>

                  {/* Chapters Completed Box */}
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-400/20 flex items-center justify-center text-purple-300 font-mono font-bold text-xl">
                      <Trophy className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        <AnimatedCounter value={recap.chaptersCompleted} /> Chapters
                      </div>
                      <span className="text-xs text-purple-300/80">Fully Completed</span>
                    </div>
                  </div>
                </div>

                {/* Most Studied Subject / Chapter */}
                {recap.favoriteSubject && (
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: recap.favoriteSubject.color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Most Explored Subject</span>
                        <span className="text-sm font-bold text-white">
                          {recap.favoriteSubject.name} ({recap.favoriteSubject.percentage}% focus)
                        </span>
                      </div>
                    </div>

                    {recap.favoriteChapter && (
                      <div className="text-right sm:text-right w-full sm:w-auto">
                        <span className="text-xs text-slate-400 block">Top Studied Chapter</span>
                        <span className="text-xs font-semibold text-amber-300 truncate max-w-xs">
                          {recap.favoriteChapter.title}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Consistency across Physics, Chemistry, and Mathematics is the bedrock of JEE Advanced rankers.
              </p>
            </motion.div>
          )}

          {/* SLIDE 3: STREAK & MOMENTUM */}
          {currentSlide === "streak" && (
            <motion.div
              key="slide-streak"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-xl w-full"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-4 rounded-full bg-amber-500/30 blur-xl"
                />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-red-500 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-amber-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-amber-400">
                  DISCIPLINE & HABIT
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  The Power of Showing Up
                </h2>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl flex flex-col items-center gap-3 w-full shadow-lg">
                <span className="text-xs uppercase tracking-widest font-mono text-slate-400">
                  All-Time Longest Daily Streak
                </span>
                <div className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 font-mono">
                  <AnimatedCounter value={recap.longestStreak} suffix=" Days" />
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-200/80 mt-1">
                  <span>Current Streak: {recap.currentStreak} Days</span>
                  <span>•</span>
                  <span>Member Since {recap.daysSinceJoined} Days</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                {recap.longestStreak > 1
                  ? "Your daily momentum is your greatest unfair advantage against competition."
                  : "Every streak begins with a single focused session. Build your chain day by day."}
              </p>
            </motion.div>
          )}

          {/* SLIDE 4: TROPHIES & MILESTONES */}
          {currentSlide === "trophies" && (
            <motion.div
              key="slide-trophies"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-2xl w-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-purple-400">
                  PROGRESSION & HALL OF GLORY
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  The Heights You Scaled
                </h2>
              </div>

              {/* XP + Achievement Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Total XP */}
                <div className="p-6 rounded-3xl bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Total Canonical XP
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono mt-1">
                    <AnimatedCounter value={recap.canonicalTotalXp} prefix="+" suffix=" XP" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Calculated across study & mastery</p>
                </div>

                {/* Top Achievement */}
                <div className="p-6 rounded-3xl bg-white/[0.04] border border-purple-500/30 backdrop-blur-xl flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center mb-2">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    {recap.topAchievement ? "Crown Achievement" : "Achievements Unlocked"}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1 line-clamp-1">
                    {recap.topAchievement ? recap.topAchievement.title : `${recap.unlockedAchievementsCount} Unlocked`}
                  </div>
                  <p className="text-[11px] text-purple-300/80 mt-1 line-clamp-1">
                    {recap.topAchievement ? recap.topAchievement.description : "Keep solving to unlock badges"}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Every badge represents a barrier broken and a standard met.
              </p>
            </motion.div>
          )}

          {/* SLIDE 5: ANNUAL CELEBRATION GRANT & GIFT */}
          {currentSlide === "gift" && (
            <motion.div
              key="slide-gift"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-xl w-full"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-pink-400">
                  ANNUAL BIRTHDAY GRANT
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  A Gift For The Aspirant
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isClaimed
                    ? `You have unlocked your ${recap.currentYear} celebration grant!`
                    : "Tap the golden gift box to unveil your rewards and annual milestone honor."}
                </p>
              </div>

              {!isClaimed ? (
                /* Interactive Gift Box */
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenGift}
                  className="relative cursor-pointer group my-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-amber-500/40 hover:border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col items-center gap-4 transition-all"
                >
                  <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all" />
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/40 flex items-center justify-center">
                    <div className="w-full h-full rounded-[14px] bg-slate-950/40 backdrop-blur-md flex items-center justify-center overflow-hidden relative">
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                      />
                      <Gift className="w-14 h-14 text-amber-200 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <div className="relative z-10 px-5 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-400/30 group-hover:shadow-amber-400/60 transition-all flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isOpeningGift ? "Unlocking..." : "Tap to Open Gift"}</span>
                  </div>
                </motion.div>
              ) : (
                /* Unlocked Rewards Cards */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
                >
                  {/* XP Reward */}
                  <div className="p-6 rounded-3xl bg-white/[0.06] border border-amber-400/40 backdrop-blur-xl flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-extrabold text-amber-300 font-mono">
                      +{earnedXP || 500} XP
                    </div>
                    <span className="text-xs text-slate-400">Progression Grant Added</span>
                  </div>

                  {/* Milestone Badge */}
                  <div className="p-6 rounded-3xl bg-white/[0.06] border border-purple-400/40 backdrop-blur-xl flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <div className="w-12 h-12 rounded-2xl bg-purple-400/20 text-purple-400 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-base font-bold text-white">
                      Birthday Scholar · {recap.currentYear}
                    </div>
                    <span className="text-xs text-purple-300/80">Permanent Annual Milestone</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SLIDE 6: FINALE & RETURN TO DASHBOARD */}
          {currentSlide === "finale" && (
            <motion.div
              key="slide-finale"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center gap-6 max-w-xl w-full"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{recap.milestoneTitle}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  May This Year Bring Your Breakthrough
                </h2>
                <p className="text-sm text-slate-300/85 leading-relaxed">
                  Every concept mastered and every hour logged brings you closer to your dream IIT.
                  Birthday Mode is now active for you today across JEE Pro!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={handleReplay}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white text-xs font-medium tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Story</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className="w-full flex items-center justify-between z-30 pb-2 sm:pb-4 px-4 sm:px-6">
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-white/80 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] text-white/40 font-mono uppercase tracking-widest hidden sm:inline-block">
          TAP ANYWHERE OR USE ARROW KEYS
        </span>

        {currentSlideIndex < SLIDES.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <span>Finish</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}

// Sub-component: Intelligent Animated Counter
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (value <= 0) {
      const timer = setTimeout(() => setDisplayVal(0), 0);
      return () => clearTimeout(timer);
    }
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayVal(value);
        clearInterval(interval);
      } else {
        setDisplayVal(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayVal.toLocaleString()}
      {suffix}
    </span>
  );
}

// Confetti burst helper
function triggerCinematicConfetti() {
  const count = 220;
  const defaults = { origin: { y: 0.65 }, zIndex: 100000 };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#F59E0B", "#FBBF24", "#FDE68A"] });
  fire(0.2, { spread: 60, colors: ["#EC4899", "#F43F5E", "#FB7185"] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#8B5CF6", "#A78BFA", "#38BDF8"] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ["#10B981", "#34D399"] });
}
