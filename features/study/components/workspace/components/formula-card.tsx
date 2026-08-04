"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Bookmark, Share2, Lightbulb, AlertTriangle, Layers } from "lucide-react";
import { Formula } from "@/features/study/services/formulas";
import { cn } from "@/lib/utils";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Button } from "@/components/ui/button";

interface FormulaCardProps {
  formula: Formula;
}

export function FormulaCard({ formula }: FormulaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const difficultyColors = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <motion.div 
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        isExpanded 
          ? "bg-surface border-glass-border shadow-xl shadow-black/5" 
          : "bg-surface/50 border-glass-border hover:bg-surface hover:border-border hover:shadow-lg"
      )}
    >
      {/* Header & Math Block (Always Visible) */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <motion.h3 layout="position" className="text-base font-semibold group-hover:text-primary transition-colors">
              {formula.title}
            </motion.h3>
            <motion.div layout="position" className="flex flex-wrap items-center gap-2">
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", difficultyColors[formula.difficulty])}>
                {formula.difficulty}
              </span>
              {formula.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")}
              onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
            >
              <Bookmark className={cn("w-4 h-4 transition-transform", isBookmarked && "fill-current scale-110")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hidden sm:flex">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* The Math Equation */}
        <motion.div 
          layout="position"
          className={cn(
            "py-4 px-2 rounded-xl flex items-center justify-center transition-colors",
            isExpanded ? "bg-background border border-glass-border shadow-inner" : "bg-transparent"
          )}
        >
          <div className="text-xl sm:text-2xl font-serif text-foreground">
            <BlockMath math={formula.formula} />
          </div>
        </motion.div>
        
        {/* Simple Description when collapsed */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm text-muted-foreground line-clamp-1"
            >
              {formula.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Details Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="px-5 pb-5 space-y-6 pt-2 border-t border-border/50">
              
              {/* Description */}
              <div className="text-sm text-foreground/90 leading-relaxed">
                {formula.description}
              </div>

              {/* Variables List */}
              {formula.variables.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Variables
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formula.variables.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/50">
                        <div className="w-8 h-8 shrink-0 rounded bg-muted flex items-center justify-center font-serif text-sm">
                          <InlineMath math={v.symbol} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{v.name}</span>
                          {v.unit && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{v.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Memory Trick */}
                {formula.memoryTrick && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Memory Trick
                    </h4>
                    <p className="text-sm text-amber-600/90 leading-relaxed">
                      {formula.memoryTrick}
                    </p>
                  </div>
                )}

                {/* Common Mistakes */}
                {formula.commonMistakes && formula.commonMistakes.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Common Mistakes
                    </h4>
                    <ul className="text-sm text-rose-600/90 leading-relaxed list-disc list-inside space-y-1">
                      {formula.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="leading-snug">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Close Button at Bottom */}
              <div className="pt-2 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Collapse Details
                </Button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
