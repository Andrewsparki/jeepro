"use client";

import { motion } from "framer-motion";
import { BookOpen, LineChart, Target, Zap, Clock, Brain } from "lucide-react";

const features = [
  {
    title: "Smart Study Modules",
    description: "Adaptive learning paths that adjust to your strengths and weaknesses in real-time.",
    icon: BookOpen,
    colSpan: "md:col-span-2",
  },
  {
    title: "Deep Analytics",
    description: "Visualize your progress with beautiful, intuitive charts and identify areas for improvement.",
    icon: LineChart,
    colSpan: "md:col-span-1",
  },
  {
    title: "Precision Targeting",
    description: "Focus purely on what matters. We cut the fluff so you can maximize your score.",
    icon: Target,
    colSpan: "md:col-span-1",
  },
  {
    title: "Lightning Fast",
    description: "Built on modern web technologies ensuring zero lag during your intensive study sessions.",
    icon: Zap,
    colSpan: "md:col-span-2",
  },
  {
    title: "Time Management",
    description: "Built-in pomodoro timers and schedule planners to keep you on track.",
    icon: Clock,
    colSpan: "md:col-span-2",
  },
  {
    title: "AI Generation",
    description: "Endless practice problems generated instantly based on your historical data.",
    icon: Brain,
    colSpan: "md:col-span-1",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need. Nothing you don&apos;t.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            A cohesive suite of tools engineered specifically for JEE Main and Advanced aspirants.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-card/30 p-8 hover:bg-card/50 transition-colors ${feature.colSpan}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <feature.icon className="h-8 w-8 text-muted-foreground mb-6" />
                <h3 className="text-xl font-medium text-foreground mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
