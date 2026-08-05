"use client";

import { Heart, Coffee } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function CreatorSupport() {
  return (
    <div className="py-12 mt-12 mb-8">
      <GlassCard interactive className="p-8 sm:p-12 relative overflow-hidden group">
        
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
          <Heart className="w-64 h-64 -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Support Development
          </span>
          
          <p className="text-xl sm:text-2xl font-light text-foreground/90 leading-relaxed mb-10">
            Every feature.<br/>
            Every animation.<br/>
            Every update.<br/><br/>
            Exists because someone believed<br/>
            studying deserved better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a 
              href="https://patreon.com/devAndrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full border border-glass-border bg-surface hover:bg-surface-hover hover:border-primary/30 transition-all text-sm font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Patreon
            </a>
            <a 
              href="https://buymeacoffee.com/devandrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full border border-glass-border bg-surface hover:bg-surface-hover hover:border-yellow-500/30 transition-all text-sm font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Coffee className="w-4 h-4 text-yellow-500" />
              Buy Me A Coffee
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
