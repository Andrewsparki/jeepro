"use client";

import { WorkspaceCard } from "./workspace-card";
import { RotateCw, Layers, BrainCircuit, Activity } from "lucide-react";

export function RevisionCard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <RotateCw className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Revision</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Strengthen neural pathways with spaced repetition.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Flashcards */}
        <WorkspaceCard delay={0.7} hoverEffect className="p-6 md:p-6 group flex flex-col justify-between gap-6 border-purple-500/10 h-full">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 group-hover:text-purple-400 transition-colors">Flashcards</h3>
            <p className="text-sm text-muted-foreground">Active recall for formulas and facts.</p>
          </div>
          <div className="text-sm font-medium text-foreground pt-4 border-t border-border/40">
            24 cards due today
          </div>
        </WorkspaceCard>

        {/* Weak Areas */}
        <WorkspaceCard delay={0.8} hoverEffect className="p-6 md:p-6 group flex flex-col justify-between gap-6 h-full">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 group-hover:text-red-400 transition-colors">Weak Areas</h3>
            <p className="text-sm text-muted-foreground">AI-identified topics needing immediate review.</p>
          </div>
          <div className="text-sm font-medium text-foreground pt-4 border-t border-border/40">
            3 critical topics
          </div>
        </WorkspaceCard>

        {/* Spaced Repetition */}
        <WorkspaceCard delay={0.9} hoverEffect className="p-6 md:p-6 group flex flex-col justify-between gap-6 h-full">
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center transition-transform">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 group-hover:text-green-400 transition-colors">Diagnostic</h3>
            <p className="text-sm text-muted-foreground">Take a quick 15-minute test to calibrate your retention.</p>
          </div>
          <div className="text-sm font-medium text-foreground pt-4 border-t border-border/40">
            Recommended now
          </div>
        </WorkspaceCard>

      </div>
    </div>
  );
}
