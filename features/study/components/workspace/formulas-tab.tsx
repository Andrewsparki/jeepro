"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Calculator } from "lucide-react";
import { Formula, searchFormulas, deleteCustomFormula } from "@/features/study/services/formulas";
import { Chapter, Subject } from "@/features/syllabus/services/syllabus";
import { FormulaCard } from "./components/formula-card";
import { AddFormulaDialog } from "./components/add-formula-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface FormulasTabProps {
  chapter: Chapter;
  subject?: Subject;
}

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
type SourceFilter = "All" | "Official" | "Custom";

export function FormulasTab({ chapter, subject }: FormulasTabProps) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("All");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("All");
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchFormulas = useCallback(async () => {
    setIsLoading(true);
    const results = await searchFormulas(
      query,
      chapter.id,
      selectedTopicId === "All" ? undefined : selectedTopicId,
      difficulty,
      sourceFilter
    );
    setFormulas(results);
    setIsLoading(false);
  }, [query, chapter.id, selectedTopicId, difficulty, sourceFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFormulas();
    }, query ? 250 : 0);

    return () => clearTimeout(timer);
  }, [fetchFormulas, query]);

  const handleDeleteCustomFormula = async (id: string) => {
    await deleteCustomFormula(id, chapter.id);
    toast.success("Custom formula deleted.");
    fetchFormulas();
  };

  const handleFormulaCreated = (newFormula: Formula) => {
    setFormulas((prev) => [newFormula, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-full max-w-5xl mx-auto pb-20 space-y-6">
      {/* Search & Filters Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pt-2 pb-5 border-b border-border/50 shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search equations, variables, or definitions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-surface/50 border-glass-border h-11 rounded-xl w-full text-sm"
            />
          </div>

          {/* Add Custom Formula Action */}
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full sm:w-auto rounded-xl px-4 py-2.5 gap-2 bg-primary text-primary-foreground font-medium shadow-md hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Formula
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border">
            {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  dispatchInteractionSound("ui.tab");
                  setDifficulty(d);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  difficulty === d
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border">
            <button
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                setSourceFilter("All");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sourceFilter === "All"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                setSourceFilter("Official");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sourceFilter === "Official"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Official Reference
            </button>
            <button
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                setSourceFilter("Custom");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sourceFilter === "Custom"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Formulas
            </button>
          </div>

          {/* Topic Select */}
          {chapter.topics && chapter.topics.length > 0 && (
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="h-9 px-3 rounded-xl bg-surface border border-glass-border text-xs text-foreground outline-none"
            >
              <option value="All">All Topics ({chapter.topics.length})</option>
              {chapter.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-glass-border bg-glass">
                <Skeleton className="h-6 w-1/3 mb-4 rounded" />
                <Skeleton className="h-4 w-2/3 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : formulas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-3xl p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4 text-muted-foreground">
              <Calculator className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No formulas match filters</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6">
              Try resetting your search query or add a personal custom formula for this chapter.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              className="rounded-full gap-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Formula
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {formulas.map((formula, idx) => (
                <motion.div
                  key={formula.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(idx * 0.04, 0.2),
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <FormulaCard
                    formula={formula}
                    onDelete={handleDeleteCustomFormula}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Add Custom Formula Dialog */}
      <AddFormulaDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        chapterId={chapter.id}
        subjectId={subject?.id || "physics"}
        topics={chapter.topics}
        onFormulaCreated={handleFormulaCreated}
      />
    </div>
  );
}
