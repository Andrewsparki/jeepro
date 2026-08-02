"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-32" id="cta">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />
      
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border/50 bg-card/30 p-12 md:p-20 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
            Ready to upgrade your preparation?
          </h2>
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
            Join thousands of serious JEE aspirants who have switched to a better, faster, and more focused environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className={cn(
                "inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-base font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
