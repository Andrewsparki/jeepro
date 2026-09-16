"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Zap, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "FREE",
    badge: null,
    price: "₹0",
    period: "forever",
    description: "For getting started with focused, clutter-free preparation.",
    features: [
      "Full 90-chapter syllabus access",
      "Chapter status tracking (5 stages)",
      "Basic study dashboard & metrics",
      "Core formula sheet summaries",
      "Limited practice questions per day",
    ],
    ctaText: "Get started",
    ctaHref: "/signup",
    isPrimary: false,
    icon: Shield,
    accentColor: "from-slate-500/10 via-slate-500/5 to-transparent",
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    id: "pro",
    name: "PRO",
    badge: "RECOMMENDED",
    price: "Coming soon",
    period: "flexible plans",
    description: "For serious aspirants targeting top ranks in JEE Main & Advanced.",
    features: [
      "Everything in Free",
      "Unlimited adaptive practice problems",
      "10+ years categorized PYQ engine",
      "Full-length 3-hour NTA mock tests",
      "Smart spaced-repetition revision system",
      "Detailed accuracy & time-per-question analytics",
      "Distraction-free Deep Focus mode",
    ],
    ctaText: "Coming soon",
    ctaHref: "#faq",
    isPrimary: true,
    icon: Zap,
    accentColor: "from-cyan-500/25 via-indigo-500/15 to-transparent",
    glowColor: "rgba(30,167,255,0.28)",
  },
  {
    id: "pro-max",
    name: "PRO MAX",
    badge: null,
    price: "Coming soon",
    period: "annual cohort",
    description: "The ultimate preparation suite for aspirants aiming for single-digit ranks.",
    features: [
      "Everything in Pro",
      "Adaptive AI weekly study scheduling",
      "Personalized spaced-decay revision queues",
      "Deep percentile & rank projection telemetry",
      "Advanced test analysis & weak-spot heatmaps",
      "Priority feature access & early releases",
    ],
    ctaText: "Coming soon",
    ctaHref: "#faq",
    isPrimary: false,
    icon: Crown,
    accentColor: "from-purple-500/20 via-pink-500/10 to-transparent",
    glowColor: "rgba(168,85,247,0.22)",
  },
];

export function PricingPlans() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* ========================================================================= */}
        {/* PRICING HERO HEADER                                                       */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-[#070E1E]/60 text-xs font-semibold text-[#38bdf8] backdrop-blur-xl shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase text-[11px]">JEE PRO • SIMPLE PRICING</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-5 leading-[1.08]"
          >
            Choose your level <br className="hidden sm:inline" />
            of <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">preparation.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-[#98A0B3] font-normal leading-relaxed max-w-xl mx-auto"
          >
            Start free and upgrade when you need more power. Transparent, distraction-free, and engineered for high precision.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* 3 PRICING CARDS GRID - Smooth, unified entrance with stable CSS hover     */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
        >
          {plans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative rounded-[32px] p-8 sm:p-9 flex flex-col justify-between overflow-hidden transform-gpu",
                  "transition-all duration-300 ease-out cursor-pointer",
                  plan.isPrimary
                    ? "bg-[#081226]/90 backdrop-blur-xl border-2 border-cyan-400/50 shadow-[0_30px_100px_rgba(30,167,255,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)] lg:-translate-y-2 hover:lg:-translate-y-3.5 hover:shadow-[0_35px_110px_rgba(30,167,255,0.45)]"
                    : "bg-[#070E1E]/75 backdrop-blur-xl border border-white/[0.12] hover:border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1.5 hover:shadow-[0_25px_80px_rgba(0,0,0,0.85)]"
                )}
              >
                {/* Top specular glare line */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:via-white/60 transition-colors duration-300 pointer-events-none" />

                {/* Background ambient corner glow */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500 transform-gpu" 
                  style={{
                    background: `radial-gradient(circle at 100% 0%, ${plan.glowColor}, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105",
                      plan.isPrimary
                        ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-400"
                        : "bg-white/[0.05] border-white/[0.1] text-slate-300"
                    )}>
                      <plan.icon className="w-5 h-5" />
                    </div>

                    {plan.badge && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-md shadow-cyan-500/20">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-xl font-bold tracking-tight text-white mb-1 group-hover:text-cyan-200 transition-colors duration-200">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#98A0B3] min-h-[36px] leading-relaxed mb-6 font-normal">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pb-6 border-b border-white/[0.08] mb-6">
                    <span className={`tracking-tight font-black whitespace-nowrap ${
                      plan.price.startsWith("₹") 
                        ? "text-4xl sm:text-5xl text-white" 
                        : "text-2xl sm:text-3xl bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent"
                    }`}>
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#98A0B3] font-medium whitespace-nowrap">/ {plan.period}</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">What&apos;s included</p>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.isPrimary 
                            ? "bg-cyan-500/20 text-cyan-400" 
                            : "bg-white/[0.08] text-slate-300"
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan CTA Action */}
                <div className="relative z-10 pt-2">
                  {plan.isPrimary ? (
                    <button
                      disabled
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#7257FF] text-white font-semibold text-xs sm:text-sm shadow-[0_0_30px_rgba(30,167,255,0.4)] flex items-center justify-center gap-2 opacity-90 cursor-not-allowed"
                    >
                      <span>{plan.ctaText}</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    </button>
                  ) : plan.price === "₹0" ? (
                    <Link
                      href={plan.ctaHref}
                      className="w-full h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold text-xs sm:text-sm transition-colors duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full h-12 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <span>{plan.ctaText}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
