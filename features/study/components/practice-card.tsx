"use client";

import { WorkspaceCard } from "./workspace-card";
import { PenTool, Library, Bookmark, Target } from "lucide-react";

export function PracticeCard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Practice</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Apply your knowledge with exam-level questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PYQs */}
        <WorkspaceCard delay={0.4} hoverEffect className="p-6 md:p-6 group border-orange-500/10">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center transition-transform">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 group-hover:text-orange-400 transition-colors">Previous Year Questions</h3>
              <p className="text-sm text-muted-foreground">Solve official JEE Main & Advanced questions from the last 15 years, filtered by this chapter.</p>
            </div>
            <div className="flex items-center gap-4 mt-2 pt-4 border-t border-border/40">
              <div className="text-sm"><span className="font-medium text-foreground">142</span> total</div>
              <div className="text-sm"><span className="font-medium text-foreground">12</span> solved</div>
            </div>
          </div>
        </WorkspaceCard>

        <div className="grid grid-rows-2 gap-4">
          {/* Topic-wise Practice */}
          <WorkspaceCard delay={0.5} hoverEffect className="p-5 md:p-5 flex items-center gap-5 group">
            <div className="w-10 h-10 rounded-full bg-muted/20 text-muted-foreground flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Topic-wise Practice</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">Curated problem sets for individual concepts.</p>
            </div>
          </WorkspaceCard>

          {/* Bookmarks */}
          <WorkspaceCard delay={0.6} hoverEffect className="p-5 md:p-5 flex items-center gap-5 group">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Bookmarked Questions</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">Review questions you&apos;ve saved for later.</p>
            </div>
          </WorkspaceCard>
        </div>

      </div>
    </div>
  );
}
