"use client";

import { motion } from "framer-motion";

export function TypographyArt() {
  return (
    <div className="py-24 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden my-8">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 space-y-2 flex flex-col items-center"
      >
        <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/50 mb-4 block">
          Design Philosophy
        </span>
        
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-foreground/90 leading-tight">
          Crafted in <span className="font-serif italic font-normal text-primary">silence</span>.<br />
          Measured in <span className="font-serif italic font-normal text-primary">progress</span>.
        </h2>
        
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-border to-transparent mt-8" />
      </motion.div>
    </div>
  );
}
