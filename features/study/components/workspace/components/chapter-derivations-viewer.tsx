"use client";

import React, { useState } from "react";
import { PhysicsChapterDataset, ChapterDerivation } from "@/features/study/services/physics-knowledge.service";
import { MathRenderer } from "@/components/ui/math-renderer";
import { BlockMath } from "react-katex";
import { 
  GitFork, CheckCircle2, ChevronDown, Sparkles, BookOpen, 
  HelpCircle, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterDerivationsViewerProps {
  dataset: PhysicsChapterDataset;
}

export function ChapterDerivationsViewer({ dataset }: ChapterDerivationsViewerProps) {
  const derivations = dataset.derivations || [];
  const [expandedId, setExpandedId] = useState<string>(derivations[0]?.id || "");

  if (derivations.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[#A4ADBB] border border-dashed border-[#2B3342] rounded-2xl">
        No formal derivations recorded for this chapter.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shrink-0">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FB] flex items-center gap-2">
              <span>{dataset.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/20 uppercase">
                {derivations.length} Key Derivations
              </span>
            </h2>
            <p className="text-xs text-[#A4ADBB] mt-0.5">
              Step-by-step rigorous proofs and fundamental derivations frequently tested in JEE Advanced and Main.
            </p>
          </div>
        </div>
      </div>

      {/* Derivation Cards List */}
      <div className="space-y-4">
        {derivations.map((d, index) => {
          const isExpanded = expandedId === d.id;

          return (
            <div
              key={d.id || `derivation-${index}`}
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isExpanded
                  ? "border-[#78A9FF]/40 bg-[#0B0D12]/95 shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(120,169,255,0.06)]"
                  : "border-[#2B3342] bg-[#121722]/60 hover:bg-[#121722]/90 hover:border-[#2B3342]/90"
              )}
            >
              {/* Collapsible Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? "" : d.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-[#78A9FF]/15 text-[#78A9FF] font-mono text-xs font-bold flex items-center justify-center border border-[#78A9FF]/30 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#F5F7FB] hover:text-[#78A9FF] transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-xs text-[#A4ADBB] leading-relaxed line-clamp-2">
                      {d.context}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-[11px] font-mono text-[#78A9FF]">
                    {d.steps.length} steps
                  </span>
                  <div className={cn("p-1 rounded-lg text-[#A4ADBB] transition-transform duration-200", isExpanded && "rotate-180 text-[#78A9FF]")}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Expanded Derivation Body */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#2B3342]/70 space-y-6">
                  {/* Context Banner */}
                  <div className="p-3.5 rounded-xl bg-[#171D28]/80 border border-[#2B3342] text-xs text-[#F5F7FB]/90 leading-relaxed">
                    <span className="font-semibold text-[#78A9FF] mr-1.5">Context & Assumptions:</span>
                    {d.context}
                  </div>

                  {/* Sequential Steps */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A4ADBB]/80 block mb-2">
                      Proof Steps
                    </span>
                    {d.steps.map((st, stepIdx) => {
                      const stepKey =
                        (st as any)?.id ||
                        (typeof st === "object" && st !== null && st.step != null
                          ? `${d.id || `derivation-${index}`}-step-${st.step}`
                          : `${d.id || `derivation-${index}`}-step-${stepIdx}`);
                      const stepNumber = typeof st === "object" && st !== null && st.step != null ? st.step : stepIdx + 1;
                      const stepDescription = typeof st === "string" ? st : st?.description;

                      return (
                        <div
                          key={stepKey}
                          className="p-4 rounded-xl border border-[#2B3342]/80 bg-[#121722]/40 space-y-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#171D28] text-[10px] font-mono font-bold text-[#78A9FF] border border-[#2B3342] shrink-0">
                              Step {stepNumber}
                            </span>
                            <div className="text-xs font-medium text-[#F5F7FB]/95 leading-relaxed">
                              {typeof st === "string" ? (
                                <MathRenderer content={stepDescription || ""} />
                              ) : (
                                stepDescription
                              )}
                            </div>
                          </div>

                          {typeof st === "object" && st?.math && (
                            <div className="py-2 px-3 rounded-lg bg-[#0B0D12] border border-[#2B3342]/60 overflow-x-auto text-sm">
                              <BlockMath math={st.math} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Final Result Card */}
                  {d.finalResult && (
                    <div className="p-4 rounded-xl border border-[#78A9FF]/40 bg-[#78A9FF]/5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78A9FF]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Final Concluded Formula</span>
                      </div>
                      <div className="py-2 text-base overflow-x-auto text-[#F5F7FB]">
                        <BlockMath math={d.finalResult} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
