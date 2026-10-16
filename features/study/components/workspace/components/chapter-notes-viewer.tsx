"use client";

import React, { useState } from "react";
import { PhysicsChapterDataset } from "@/features/study/services/physics-knowledge.service";
import { MathRenderer } from "@/components/ui/math-renderer";
import { 
  FileText, BookOpen, Sparkles, CheckCircle2, ChevronRight, 
  ExternalLink, Layers, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterNotesViewerProps {
  dataset: PhysicsChapterDataset;
}

export function ChapterNotesViewer({ dataset }: ChapterNotesViewerProps) {
  const [selectedSection, setSelectedSection] = useState<number>(0);

  // Parse notes markdown into conceptual sections
  const sections = React.useMemo(() => {
    if (!dataset.notes) return [];
    
    // Split by top-level or secondary headers: "## "
    const rawChunks = dataset.notes.split(/\n(?=##\s+)/g);
    
    return rawChunks.map((chunk, idx) => {
      const trimmed = chunk.trim();
      const firstLineEnd = trimmed.indexOf("\n");
      const titleLine = firstLineEnd !== -1 ? trimmed.slice(0, firstLineEnd) : trimmed;
      const title = titleLine.replace(/^##\s+/, "").replace(/^\d+\.\s*/, "").trim();
      const content = firstLineEnd !== -1 ? trimmed.slice(firstLineEnd).trim() : "";

      return {
        id: idx,
        title: title || `Concept ${idx + 1}`,
        rawContent: trimmed,
        content: content || trimmed,
      };
    });
  }, [dataset.notes]);

  const activeSection = sections[selectedSection] || sections[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#78A9FF]/15 border border-[#78A9FF]/30 flex items-center justify-center text-[#78A9FF] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FB] flex items-center gap-2">
              <span>{dataset.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#78A9FF]/15 text-[#78A9FF] border border-[#78A9FF]/20 uppercase">
                Official Theory Notes
              </span>
            </h2>
            <p className="text-xs text-[#A4ADBB] mt-0.5">
              Comprehensive conceptual coverage aligned with the official JEE Main syllabus.
            </p>
          </div>
        </div>

        {dataset.topics && dataset.topics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-[#A4ADBB] mr-1">Modules:</span>
            {dataset.topics.slice(0, 3).map((topic, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#171D28] text-[#A4ADBB] border border-[#2B3342]">
                {topic}
              </span>
            ))}
            {dataset.topics.length > 3 && (
              <span className="text-[10px] text-[#78A9FF] font-medium">+{dataset.topics.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-[#2B3342] bg-[#121722]/70 p-3 space-y-1.5 backdrop-blur-md">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#A4ADBB]/70 flex items-center justify-between">
            <span>Index of Concepts</span>
            <span className="text-[10px] font-mono">{sections.length} Units</span>
          </div>

          <div className="space-y-1 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
            {sections.map((sec, idx) => {
              const isSelected = selectedSection === idx;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(idx)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2.5 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#78A9FF]",
                    isSelected
                      ? "bg-[#171D28] text-[#F5F7FB] border border-[#78A9FF]/40 shadow-[0_2px_12px_rgba(120,169,255,0.08)]"
                      : "text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-white/[0.03] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 font-bold",
                      isSelected ? "bg-[#78A9FF] text-[#0B0D12]" : "bg-[#171D28] text-[#A4ADBB] border border-[#2B3342]"
                    )}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 shrink-0 transition-transform", isSelected ? "text-[#78A9FF] translate-x-0.5" : "text-[#A4ADBB]/40")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Reader Body */}
        <div className="lg:col-span-8 rounded-2xl border border-[#2B3342] bg-[#0B0D12]/90 p-6 sm:p-8 backdrop-blur-xl min-h-[500px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#2B3342]/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#78A9FF]/15 text-[#78A9FF] text-xs font-mono font-bold flex items-center justify-center border border-[#78A9FF]/30">
                  {selectedSection + 1}
                </span>
                <h3 className="text-xl font-extrabold text-[#F5F7FB] tracking-tight">
                  {activeSection?.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#A4ADBB]/70">
                {selectedSection + 1} of {sections.length}
              </span>
            </div>

            {/* LaTeX Rendered Theory */}
            <div className="text-sm leading-relaxed text-[#F5F7FB]/90">
              <MathRenderer 
                content={activeSection?.rawContent || ""} 
                className="[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#78A9FF] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-[#F5F7FB]/90 [&_p]:mb-3 [&_strong]:text-[#F5F7FB] [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-[#F5F7FB]/85"
              />
            </div>
          </div>

          {/* Section Navigation Footer */}
          <div className="pt-6 mt-8 border-t border-[#2B3342]/60 flex items-center justify-between gap-4">
            <button
              disabled={selectedSection === 0}
              onClick={() => setSelectedSection(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl border border-[#2B3342] bg-[#121722] text-xs font-semibold text-[#A4ADBB] hover:text-[#F5F7FB] hover:border-[#78A9FF]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous Section
            </button>

            <button
              disabled={selectedSection >= sections.length - 1}
              onClick={() => setSelectedSection(prev => Math.min(sections.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <span>Next Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
