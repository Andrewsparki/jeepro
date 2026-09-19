"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wrench,
  Bot,
  Rocket,
  Zap,
  CheckCircle2,
  Megaphone,
  Gift,
  Bell,
  Flame,
  Star,
  ShieldCheck,
  ExternalLink,
  CheckCheck,
  Filter,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AppUpdate, AppUpdateCategory, AppUpdateStatus } from "../types/whats-new.types";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import Link from "next/link";

interface WhatsNewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updates: AppUpdate[];
  onMarkRead?: (updateId: string) => void;
  onMarkAllRead?: () => void;
  isLoading?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Wrench,
  Bot,
  Rocket,
  Zap,
  CheckCircle2,
  Megaphone,
  Gift,
  Bell,
  Flame,
  Star,
  ShieldCheck,
};

function renderIcon(iconName?: string | null) {
  if (!iconName) return <Sparkles className="w-5 h-5 text-primary" />;
  const IconComponent = ICON_MAP[iconName] || Sparkles;
  return <IconComponent className="w-5 h-5 text-primary" />;
}

export function WhatsNewModal({
  open,
  onOpenChange,
  updates,
  onMarkRead,
  onMarkAllRead,
  isLoading = false,
}: WhatsNewModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const unreadCount = updates.filter((u) => !u.is_read).length;

  const filteredUpdates = updates.filter((u) => {
    if (selectedStatus !== "all" && u.status !== selectedStatus) return false;
    if (selectedCategory !== "all" && u.category !== selectedCategory) return false;
    return true;
  });

  const handleStatusFilterChange = (status: string) => {
    dispatchInteractionSound("ui.tab");
    setSelectedStatus(status);
  };

  const handleCategoryFilterChange = (cat: string) => {
    dispatchInteractionSound("ui.tab");
    setSelectedCategory(cat);
  };

  const handleCardClick = (update: AppUpdate) => {
    if (!update.is_read && onMarkRead) {
      onMarkRead(update.id);
    }
  };

  const getStatusBadge = (status: AppUpdateStatus) => {
    switch (status) {
      case "Live":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
            In Progress
          </Badge>
        );
      case "Coming Soon":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 flex items-center gap-1 font-medium">
            <Rocket className="w-3 h-3 text-purple-500" />
            Coming Soon
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: AppUpdateCategory) => {
    const colors: Record<AppUpdateCategory, string> = {
      Feature: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      Improvement: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      Fix: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      Announcement: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
          colors[category] || "bg-muted text-muted-foreground"
        }`}
      >
        {category}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl">
        {/* Header section */}
        <div className="p-6 border-b border-border/40 bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Product Updates</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  See what&apos;s new, improved, and currently building in JEE Pro
                </DialogDescription>
              </div>
            </div>

            {unreadCount > 0 && onMarkAllRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  dispatchInteractionSound("ui.click");
                  onMarkAllRead();
                }}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                Mark all read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
              {["all", "Live", "In Progress", "Coming Soon"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusFilterChange(st)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    selectedStatus === st
                      ? "bg-background text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "all" ? "All Status" : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
              {["all", "Feature", "Improvement", "Fix", "Announcement"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilterChange(cat)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-background text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All Types" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Feed List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" data-lenis-prevent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <p className="text-sm">Loading update feed...</p>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl p-8">
              <Filter className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-medium">No updates match the selected filters</p>
              <p className="text-xs text-muted-foreground/70">
                Try resetting your status or category filter above.
              </p>
            </div>
          ) : (
            filteredUpdates.map((update) => (
              <div
                key={update.id}
                onClick={() => handleCardClick(update)}
                className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                  !update.is_read
                    ? "bg-primary/[0.03] border-primary/30 shadow-xs"
                    : "bg-card/50 border-border/50 hover:border-border hover:bg-card"
                }`}
              >
                {/* Unread Dot Indicator */}
                {!update.is_read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
                )}

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-muted/80 group-hover:bg-primary/10 transition-colors border border-border/40 shrink-0">
                    {renderIcon(update.icon_name)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {getStatusBadge(update.status)}
                      {getCategoryBadge(update.category)}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(update.published_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      {update.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">
                      {update.description}
                    </p>

                    {/* Optional Image */}
                    {update.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border/50 bg-black/5">
                        <img
                          src={update.image_url}
                          alt={update.title}
                          className="w-full max-h-52 object-cover"
                        />
                      </div>
                    )}

                    {/* Optional Link Button */}
                    {update.link_url && (
                      <div className="mt-3">
                        <Link
                          href={update.link_url}
                          onClick={() => {
                            dispatchInteractionSound("ui.click");
                            onOpenChange(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline hover:text-primary/90"
                        >
                          {update.link_label || "Explore Feature"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
