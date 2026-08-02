"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[40rem] w-[40rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-sm text-muted backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Redefining JEE Preparation</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-8 max-w-4xl text-5xl font-semibold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Study with <span className="text-muted-foreground">focus.</span>
            <br />
            Conquer the <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">exam.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mb-10 max-w-2xl text-lg text-muted md:text-xl"
          >
            The most premium, distraction-free platform designed to help you master Physics, Chemistry, and Mathematics. Say goodbye to clutter.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-sm font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card/50 px-8 text-sm font-medium text-foreground backdrop-blur-md transition-all hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              View features
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
