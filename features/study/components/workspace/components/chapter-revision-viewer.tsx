"use client";

import React from "react";
import { PhysicsChapterDataset } from "@/features/study/services/physics-knowledge.service";
import { AlertTriangle, Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterRevisionViewerProps {
  dataset: PhysicsChapterDataset;
}

export function ChapterRevisionViewer({ dataset }: ChapterRevisionViewerProps) {
  const quickRevision = dataset.quickRevision || [];
  const commonMistakes = dataset.commonMistakes || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FB] flex items-center gap-2">
              <span>{dataset.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20 uppercase">
                High-Yield Revision & Traps
              </span>
            </h2>
            <p className="text-xs text-[#A4ADBB] mt-0.5">
              High-yield summary points and fatal calculation traps that cost marks in JEE.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Revision Bullet Cards */}
      {quickRevision.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-[#F5F7FB]">
              Quick Revision Takeaways
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {quickRevision.map((point, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/60 flex items-start gap-3 hover:border-amber-400/40 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-amber-400/20 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs font-medium text-[#F5F7FB]/95 leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes & Pitfalls */}
      {commonMistakes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#2B3342]/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-[#F5F7FB]">
              Common JEE Pitfalls & Critical Corrections
            </h3>
          </div>

          <div className="space-y-3.5">
            {commonMistakes.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-rose-400">
                    Topic: {m.topic}
                  </span>
                  {m.category && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {m.category}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Mistake */}
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-[#0B0D12] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Frequent Fatal Mistake</span>
                    </div>
                    <p className="text-xs text-[#F5F7FB]/90 leading-relaxed pl-5">
                      {m.mistake}
                    </p>
                  </div>

                  {/* Correction */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-[#0B0D12] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Correct Approach</span>
                    </div>
                    <p className="text-xs text-[#F5F7FB]/90 leading-relaxed pl-5">
                      {m.correction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
