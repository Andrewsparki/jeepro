"use client";

import { WorkspaceCard } from "./workspace-card";
import { FunctionSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormulaCard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <FunctionSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Formula Sheet</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Quick reference for essential equations.</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex">
          View All <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <WorkspaceCard delay={1.0} className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
          
          <div className="p-6 md:p-8 flex flex-col justify-center items-center gap-4 group cursor-pointer hover:bg-card/50 transition-colors">
            <div className="font-serif text-3xl md:text-4xl tracking-wider text-foreground">
              <span className="italic">v</span> = <span className="italic">u</span> + <span className="italic">at</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">First Equation of Motion</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-center items-center gap-4 group cursor-pointer hover:bg-card/50 transition-colors">
            <div className="font-serif text-3xl md:text-4xl tracking-wider text-foreground">
              <span className="italic">s</span> = <span className="italic">ut</span> + ½<span className="italic">at</span>²
            </div>
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Second Equation of Motion</span>
          </div>

        </div>
        
        <div className="w-full p-4 border-t border-border/40 bg-muted/10 flex justify-center sm:hidden">
          <Button variant="ghost" size="sm" className="gap-2 w-full text-muted-foreground">
            View All Formulas <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </WorkspaceCard>
    </div>
  );
}
