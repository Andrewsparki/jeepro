"use client";

import Link from "next/link";
import { StudyGroup } from "../types/groups.types";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Rocket,
  Target,
  Brain,
  Trophy,
  Users,
  Lock,
  Globe,
  ArrowRight,
  ShieldCheck,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  atom: Atom,
  flask: FlaskConical,
  calculator: Calculator,
  rocket: Rocket,
  target: Target,
  brain: Brain,
  trophy: Trophy,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/20" },
};

interface GroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function GroupCard({ group, onJoin, isLoading }: GroupCardProps) {
  const IconComponent = ICON_MAP[group.avatar_icon] || BookOpen;
  const colorTheme = COLOR_MAP[group.avatar_color] || COLOR_MAP.blue;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:border-border transition-all duration-200 hover:shadow-md">
      <div>
        {/* Header: Icon & Privacy / Role Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 transition-transform duration-200 group-hover:scale-105",
              colorTheme.bg,
              colorTheme.text,
              colorTheme.border
            )}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {group.is_private ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                <Lock className="h-3 w-3" />
                Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <Globe className="h-3 w-3" />
                Public
              </span>
            )}

            {group.user_role === "owner" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            )}

            {group.user_role === "admin" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Group Name & Description */}
        <h3 className="text-base font-semibold text-foreground tracking-tight line-clamp-1 mb-1.5">
          {group.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4 leading-relaxed">
          {group.description || "A focused JEE preparation study group."}
        </p>
      </div>

      {/* Footer: Member Count & Action */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Users className="h-3.5 w-3.5 opacity-70" />
          <span>
            {group.member_count} {group.member_count === 1 ? "member" : "members"}
          </span>
        </div>

        {group.is_member ? (
          <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium gap-1.5 hover:bg-muted/50">
            <Link href={`/groups/${group.id}`}>
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : group.is_private ? (
          <Button size="sm" variant="ghost" disabled className="h-8 text-xs text-muted-foreground">
            Invite Only
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onJoin && onJoin(group.id)}
            disabled={isLoading}
            className="h-8 text-xs font-medium gap-1.5"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Join Group"}
          </Button>
        )}
      </div>
    </div>
  );
}
