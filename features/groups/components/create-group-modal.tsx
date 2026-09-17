"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Rocket,
  Target,
  Brain,
  Trophy,
  Lock,
  Globe,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateGroupInput, GroupAvatarColor, GroupAvatarIcon, StudyGroup } from "../types/groups.types";

const ICONS: { id: GroupAvatarIcon; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "book", label: "Study", icon: BookOpen },
  { id: "atom", label: "Physics", icon: Atom },
  { id: "flask", label: "Chemistry", icon: FlaskConical },
  { id: "calculator", label: "Maths", icon: Calculator },
  { id: "target", label: "Target", icon: Target },
  { id: "rocket", label: "Sprint", icon: Rocket },
  { id: "brain", label: "Mindset", icon: Brain },
  { id: "trophy", label: "Rankers", icon: Trophy },
];

const COLORS: { id: GroupAvatarColor; name: string; bg: string; ring: string }[] = [
  { id: "blue", name: "Blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { id: "purple", name: "Purple", bg: "bg-purple-500", ring: "ring-purple-500" },
  { id: "emerald", name: "Emerald", bg: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "amber", name: "Amber", bg: "bg-amber-500", ring: "ring-amber-500" },
  { id: "rose", name: "Rose", bg: "bg-rose-500", ring: "ring-rose-500" },
  { id: "indigo", name: "Indigo", bg: "bg-indigo-500", ring: "ring-indigo-500" },
  { id: "cyan", name: "Cyan", bg: "bg-cyan-500", ring: "ring-cyan-500" },
];

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateGroupInput) => Promise<StudyGroup | null>;
}

export function CreateGroupModal({ open, onOpenChange, onCreate }: CreateGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<GroupAvatarIcon>("book");
  const [selectedColor, setSelectedColor] = useState<GroupAvatarColor>("blue");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Group name must be at least 2 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const group = await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        avatar_icon: selectedIcon,
        avatar_color: selectedColor,
        is_private: isPrivate,
      });

      if (group) {
        onOpenChange(false);
        // Reset form
        setName("");
        setDescription("");
        setSelectedIcon("book");
        setSelectedColor("blue");
        setIsPrivate(false);
        router.push(`/groups/${group.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Create Study Group</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Form a focused study circle with friends or public aspirants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div className="space-y-1.5">
            <Label htmlFor="group-name" className="text-xs font-semibold">
              Group Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="group-name"
              placeholder="e.g., JEE Advanced 2026 Physics Pod"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              className="h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="group-desc" className="text-xs font-semibold">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea
              id="group-desc"
              placeholder="What is the goal of this study group? (e.g. Daily problem solving, doubt clearing)"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Choose Group Icon</Label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-[10px] leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Accent Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.id)}
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      color.bg,
                      isSelected ? "ring-2 ring-offset-2 ring-offset-background scale-110" : "opacity-80 hover:opacity-100"
                    )}
                    title={color.name}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Switch */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className={cn("p-2 rounded-md", isPrivate ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {isPrivate ? "Private Group" : "Public Group"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isPrivate
                    ? "Only invited friends can view and join this group."
                    : "Anyone can discover and join this study group."}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPrivate}
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isPrivate ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
                  isPrivate ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 font-medium">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
