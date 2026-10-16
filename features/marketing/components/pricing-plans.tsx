"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Shield, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "FREE",
    badge: null,
    price: "₹0",
    period: "forever",
    description: "Full access to the core syllabus architecture and topic trackers.",
    features: [
      "Complete 90-chapter syllabus taxonomy",
      "Chapter status tracking (5 stages)",
      "Daily study roadmap & sprint timer",
      "Formula memory anchors & derivations",
      "Zero advertising & zero social feeds",
    ],
    ctaText: "Launch Free Workspace",
    ctaHref: "/signup",
    isPrimary: false,
    icon: Shield,
  },
  {
    id: "pro",
    name: "PRO",
    badge: "RECOMMENDED",
    price: "Coming soon",
    period: "flexible plans",
    description: "For serious aspirants targeting top ranks in JEE Main & Advanced.",
    features: [
      "Everything in Free tier",
      "Algorithmic spaced formula decay queue",
      "10+ years categorized PYQ matrix",
      "Error classification telemetry (Concept / Calc)",
      "Floating Picture-in-Picture focus chamber",
      "40Hz acoustic focus soundscapes",
      "Circadian dark themes (AMOLED 0-nit)",
    ],
    ctaText: "Coming soon",
    ctaHref: "#faq",
    isPrimary: true,
    icon: Zap,
  },
  {
    id: "pro-max",
    name: "PRO MAX",
    badge: null,
    price: "Coming soon",
    period: "annual cohort",
    description: "Deep analytics suite for aspirants aiming for single-digit ranks.",
    features: [
      "Everything in Pro tier",
      "Personalized velocity & accuracy heatmaps",
      "Exam tier breakdown (Main vs Advanced Multi)",
      "Adaptive study scheduling",
      "Offline state persistence & sync",
      "Priority feature access & early releases",
    ],
    ctaText: "Coming soon",
    ctaHref: "#faq",
    isPrimary: false,
    icon: Crown,
  },
];

export function PricingPlans() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Pricing Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs font-mono text-zinc-300"
          >
            <span>TRANSPARENT PRICING // 100% OPEN SYLLABUS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-5 leading-[1.08]"
          >
            Choose Your Level <br className="hidden sm:inline" />
            of Preparation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto"
          >
            Start free with full 90-chapter syllabus access. No credit card required, no hidden paywalls, and zero advertising interruptions.
          </motion.p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative rounded-2xl sm:rounded-3xl p-8 sm:p-9 flex flex-col justify-between overflow-hidden transition-all duration-200",
                  plan.isPrimary
                    ? "bg-[#0B0F19] border-2 border-white/[0.22] shadow-[0_24px_70px_rgba(0,0,0,0.8)] lg:-translate-y-2"
                    : "bg-[#090C15] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                )}
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.1] bg-white/[0.04] text-zinc-200">
                      <Icon className="w-5 h-5" />
                    </div>

                    {plan.badge && (
                      <span className="font-mono text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Plan Name & Price */}
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      / {plan.period}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-normal">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06] mb-8">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div>
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      "w-full h-11 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      plan.isPrimary
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1]"
                    )}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
