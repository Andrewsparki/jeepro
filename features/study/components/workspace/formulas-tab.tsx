"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, History, Loader2, Calculator } from "lucide-react";
import { Formula, searchFormulas } from "@/features/study/services/formulas";
import { Chapter } from "@/features/syllabus/services/syllabus";
import { FormulaCard } from "./components/formula-card";
import { WorkspaceEmptyState } from "./components/workspace-empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormulasTabProps {
  chapter: Chapter;
}

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

export function FormulasTab({ chapter }: FormulasTabProps) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchFormulas = async () => {
      setIsLoading(true);
      const results = await searchFormulas(query, chapter.id);
      if (isActive) {
        setFormulas(results);
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchFormulas();
    }, query ? 300 : 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query, chapter.id]);

  const filteredFormulas = useMemo(() => {
    if (difficulty === "All") return formulas;
    return formulas.filter(f => f.difficulty === difficulty);
  }, [formulas, difficulty]);

  if (!isLoading && query === "" && formulas.length === 0) {
    return (
      <WorkspaceEmptyState
        icon={Calculator}
        title="Formula Sheet Empty"
        description="We are still compiling the formulas for this chapter. Check back later or add your own custom formulas."
        actionLabel="Request Formulas"
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto pb-20">
      
      {/* Search & Filter Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2 pb-6 border-b border-border/50 mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search formulas, variables, or keywords..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-surface/50 border-glass-border h-11 rounded-xl w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar-arrows pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-glass-border">
              {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    difficulty === d 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-lg border-glass-border bg-surface">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-lg border-glass-border bg-surface hidden sm:flex">
              <History className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
            <p className="text-sm">Searching knowledge base...</p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-medium mb-1">No formulas found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or filters.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFormulas.map((formula, idx) => (
                <motion.div
                  key={formula.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: Math.min(idx * 0.05, 0.3),
                    ease: [0.32, 0.72, 0, 1] 
                  }}
                >
                  <FormulaCard formula={formula} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

    </div>
  );
}
