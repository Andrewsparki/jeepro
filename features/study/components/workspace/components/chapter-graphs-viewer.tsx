"use client";

import React, { useState } from "react";
import { PhysicsChapterDataset, ChapterGraph } from "@/features/study/services/physics-knowledge.service";
import { InlineMath, BlockMath } from "react-katex";
import { LineChart, Sparkles, TrendingUp, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterGraphsViewerProps {
  dataset: PhysicsChapterDataset;
}

export function ChapterGraphsViewer({ dataset }: ChapterGraphsViewerProps) {
  const graphs = dataset.graphs || [];
  const [selectedGraphIndex, setSelectedGraphIndex] = useState(0);

  if (graphs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[#A4ADBB] border border-dashed border-[#2B3342] rounded-2xl">
        No graphs registered for this chapter.
      </div>
    );
  }

  const currentGraph = graphs[selectedGraphIndex] || graphs[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shrink-0">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FB] flex items-center gap-2">
              <span>{dataset.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/20 uppercase">
                {graphs.length} Graphical Models
              </span>
            </h2>
            <p className="text-xs text-[#A4ADBB] mt-0.5">
              Geometric curves, slope gradients, and area interpretations essential for JEE problem-solving.
            </p>
          </div>
        </div>
      </div>

      {/* Graph Selector Pills */}
      {graphs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {graphs.map((g, idx) => (
            <button
              key={g.id || idx}
              onClick={() => setSelectedGraphIndex(idx)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                selectedGraphIndex === idx
                  ? "bg-[#78A9FF] text-[#0B0D12] shadow-[0_2px_12px_rgba(120,169,255,0.25)]"
                  : "bg-[#121722] text-[#A4ADBB] hover:text-[#F5F7FB] border border-[#2B3342]"
              )}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Graph Card */}
      <div className="rounded-2xl border border-[#2B3342] bg-[#0B0D12]/95 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        {/* Title & Axes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B3342]/70">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#78A9FF] block mb-1">
              Curve Analysis
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FB]">
              {currentGraph.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#171D28] text-[#78A9FF] border border-[#2B3342]">
              Y: {currentGraph.yAxis}
            </span>
            <span className="text-xs text-[#A4ADBB]">vs</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#171D28] text-[#78A9FF] border border-[#2B3342]">
              X: {currentGraph.xAxis}
            </span>
          </div>
        </div>

        {/* Mathematical Equation & Curve Nature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/60 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-[#A4ADBB]">Governing Equation</span>
            <div className="text-base text-[#F5F7FB] overflow-x-auto">
              <BlockMath math={currentGraph.equation} />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/60 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#A4ADBB]">Curve Trajectory</span>
            <p className="text-sm font-semibold text-[#F5F7FB] pt-2">
              {currentGraph.curveType}
            </p>
          </div>
        </div>

        {/* Physical Interpretation */}
        <div className="p-4 sm:p-5 rounded-xl border border-[#78A9FF]/30 bg-[#78A9FF]/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78A9FF]">
            <Info className="w-4 h-4" />
            <span>Physical Interpretation & Significance</span>
          </div>
          <p className="text-sm leading-relaxed text-[#F5F7FB]/95">
            {currentGraph.physicalInterpretation}
          </p>
        </div>

        {/* Slope and Area Interpretations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {currentGraph.slopeInterpretation && (
            <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/50 space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase text-[#78A9FF] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Slope of the Curve (dy/dx)
              </span>
              <p className="text-xs text-[#A4ADBB] leading-relaxed">
                {currentGraph.slopeInterpretation}
              </p>
            </div>
          )}

          {currentGraph.areaInterpretation && (
            <div className="p-4 rounded-xl border border-[#2B3342] bg-[#121722]/50 space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase text-[#78A9FF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Area Under the Curve (∫ y dx)
              </span>
              <p className="text-xs text-[#A4ADBB] leading-relaxed">
                {currentGraph.areaInterpretation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
