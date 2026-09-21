"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calculator, Sparkles, X } from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { FormulaVariable, createCustomFormula, Formula } from "@/features/study/services/formulas";
import { Topic } from "@/features/syllabus/services/syllabus";
import { toast } from "sonner";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface AddFormulaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  subjectId: string;
  topics?: Topic[];
  onFormulaCreated: (formula: Formula) => void;
}

export function AddFormulaDialog({
  isOpen,
  onClose,
  chapterId,
  subjectId,
  topics = [],
  onFormulaCreated,
}: AddFormulaDialogProps) {
  const [title, setTitle] = useState("");
  const [formulaLaTeX, setFormulaLaTeX] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [memoryTrick, setMemoryTrick] = useState("");
  const [variables, setVariables] = useState<FormulaVariable[]>([
    { name: "", symbol: "", unit: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVariable = () => {
    dispatchInteractionSound("ui.click");
    setVariables((prev) => [...prev, { name: "", symbol: "", unit: "" }]);
  };

  const handleRemoveVariable = (index: number) => {
    dispatchInteractionSound("ui.click");
    setVariables((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariableChange = (index: number, field: keyof FormulaVariable, val: string) => {
    setVariables((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: val } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !formulaLaTeX.trim()) {
      toast.error("Please provide both a title and a LaTeX formula.");
      return;
    }

    setIsSubmitting(true);
    try {
      const validVariables = variables.filter((v) => v.name.trim() && v.symbol.trim());

      const created = await createCustomFormula({
        subjectId,
        chapterId,
        topicId: selectedTopicId || null,
        title: title.trim(),
        formula: formulaLaTeX.trim(),
        description: description.trim(),
        variables: validVariables,
        difficulty,
        tags: ["My Formula", difficulty],
        memoryTrick: memoryTrick.trim() || undefined,
      });

      dispatchInteractionSound("feedback.success");
      toast.success("Custom formula created!");
      onFormulaCreated(created);

      // Reset form
      setTitle("");
      setFormulaLaTeX("");
      setDescription("");
      setMemoryTrick("");
      setVariables([{ name: "", symbol: "", unit: "" }]);
      onClose();
    } catch (err) {
      console.error(err);
      dispatchInteractionSound("feedback.error");
      toast.error("Failed to create formula.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        dispatchInteractionSound("ui.close");
        onClose();
      }}
      className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-6 bg-background/95 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl relative"
    >
      {/* Close Button */}
      <button
        onClick={() => {
          dispatchInteractionSound("ui.close");
          onClose();
        }}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex flex-col gap-1 pr-8 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Add Custom Formula</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add a personal formula or theorem to your study reference sheet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Formula Title *
          </label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="e.g. Work-Energy Theorem"
            className="bg-surface/50 border-glass-border rounded-xl"
            required
          />
        </div>

        {/* LaTeX Input & Live Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            LaTeX Equation *
          </label>
          <Input
            value={formulaLaTeX}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormulaLaTeX(e.target.value)}
            placeholder="e.g. W_{net} = \Delta K = \frac{1}{2}mv^2 - \frac{1}{2}mu^2"
            className="bg-surface/50 border-glass-border font-mono text-sm rounded-xl"
            required
          />
          {/* Live KaTeX Preview */}
          <div className="mt-2 p-4 rounded-xl bg-surface border border-glass-border flex flex-col items-center justify-center min-h-[60px]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Live Math Preview
            </span>
            {formulaLaTeX.trim() ? (
              <div className="text-lg font-serif overflow-x-auto max-w-full">
                <BlockMath math={formulaLaTeX} />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Type LaTeX above to preview</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description / Notes
          </label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Explain when to apply this formula or key constraints..."
            className="w-full bg-surface/50 border border-glass-border rounded-xl p-3 resize-none text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            rows={2}
          />
        </div>

        {/* Metadata Row: Difficulty & Topic */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
              className="w-full h-10 px-3 rounded-xl bg-surface/50 border border-glass-border text-xs text-foreground outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Associated Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTopicId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface/50 border border-glass-border text-xs text-foreground outline-none"
            >
              <option value="">Entire Chapter</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Variables Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Variables Definition
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddVariable} className="h-7 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add Variable
            </Button>
          </div>

          <div className="space-y-2">
            {variables.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={v.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVariableChange(idx, "name", e.target.value)}
                  placeholder="Variable Name (e.g. Mass)"
                  className="flex-1 bg-surface/50 border-glass-border text-xs rounded-lg h-9"
                />
                <Input
                  value={v.symbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVariableChange(idx, "symbol", e.target.value)}
                  placeholder="Symbol (e.g. m)"
                  className="w-20 bg-surface/50 border-glass-border text-xs font-mono rounded-lg h-9"
                />
                <Input
                  value={v.unit || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVariableChange(idx, "unit", e.target.value)}
                  placeholder="Unit (e.g. kg)"
                  className="w-20 bg-surface/50 border-glass-border text-xs rounded-lg h-9"
                />
                {variables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVariable(idx)}
                    className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Memory Trick */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Memory Trick (Optional)
          </label>
          <Input
            value={memoryTrick}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemoryTrick(e.target.value)}
            placeholder="Mnemonic or tip to easily recall this equation..."
            className="bg-surface/50 border-glass-border rounded-xl text-xs"
          />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary gap-2">
            {isSubmitting ? "Saving..." : "Save Formula"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

