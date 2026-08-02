"use client";

import { motion } from "framer-motion";
import { Activity, LayoutDashboard, LineChart } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 sm:py-32 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A workspace you&apos;ll love.</h2>
          <p className="mt-4 text-lg text-muted">
            The dashboard is engineered to give you a complete overview of your preparation, instantly.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ perspective: "1000px" }}
          className="relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-xl"
        >
          {/* Mac-like Window Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/50 rounded-t-xl">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
          </div>

          {/* Fake Dashboard Content */}
          <div className="bg-card rounded-b-xl p-6 sm:p-10 flex flex-col gap-8 min-h-[400px]">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-6">
              <div>
                <h3 className="text-xl font-medium">Welcome back, Student</h3>
                <p className="text-sm text-muted">Here&apos;s your progress for today.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-muted/10 rounded-md" />
                <div className="h-8 w-8 bg-accent/20 rounded-md flex items-center justify-center">
                  <Activity className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 rounded-xl bg-muted/5 border border-border/50 flex flex-col justify-between p-4">
                <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-muted/20 rounded" />
                  <div className="h-6 w-24 bg-muted/10 rounded" />
                </div>
              </div>
              <div className="h-32 rounded-xl bg-muted/5 border border-border/50 flex flex-col justify-between p-4">
                <LineChart className="w-5 h-5 text-muted-foreground" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted/20 rounded" />
                  <div className="h-6 w-16 bg-muted/10 rounded" />
                </div>
              </div>
              <div className="h-32 rounded-xl bg-accent/5 border border-accent/20 flex flex-col justify-between p-4">
                <Activity className="w-5 h-5 text-accent" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-accent/20 rounded" />
                  <div className="h-6 w-20 bg-accent/10 rounded" />
                </div>
              </div>
            </div>

            {/* Main Graph Area */}
            <div className="flex-1 rounded-xl bg-muted/5 border border-border/50 p-4">
              <div className="h-4 w-32 bg-muted/20 rounded mb-6" />
              <div className="w-full h-[150px] flex items-end justify-between gap-2 px-2">
                {[24, 55, 33, 85, 41, 90, 62, 75, 29, 68, 50, 48].map((height, i) => (
                  <div
                    key={i}
                    className="w-full bg-muted/10 rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
