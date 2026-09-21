"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsNewModal } from "./whats-new-modal";
import { AppUpdate } from "../types/whats-new.types";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

interface WhatsNewTriggerProps {
  variant?: "ghost" | "outline" | "default" | "sidebar";
  showLabel?: boolean;
  className?: string;
}

export function WhatsNewTrigger({
  variant = "ghost",
  showLabel = true,
  className,
}: WhatsNewTriggerProps) {
  const [open, setOpen] = useState(false);
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch("/api/whats-new");
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates || []);
      }
    } catch (error) {
      console.error("Failed to fetch What's New updates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialUpdates() {
      await fetchUpdates();
      if (!active) return;
    }

    void loadInitialUpdates();

    return () => {
      active = false;
    };
  }, [fetchUpdates]);

  const unreadCount = updates.filter((u) => !u.is_read).length;

  const handleOpenModal = () => {
    dispatchInteractionSound("ui.open");
    setOpen(true);
  };

  const handleMarkRead = async (updateId: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === updateId ? { ...u, is_read: true } : u))
    );

    try {
      await fetch("/api/whats-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId }),
      });
    } catch (err) {
      console.error("Error marking update read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = updates.filter((u) => !u.is_read).map((u) => u.id);
    if (unreadIds.length === 0) return;

    setUpdates((prev) => prev.map((u) => ({ ...u, is_read: true })));

    try {
      await fetch("/api/whats-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, updateIds: unreadIds }),
      });
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  if (variant === "sidebar") {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors hover:bg-accent text-muted-foreground hover:text-foreground relative group",
            className
          )}
        >
          <div className="relative p-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            )}
          </div>
          {showLabel && <span className="truncate">What&apos;s New</span>}

          {unreadCount > 0 && (
            <span className="ml-auto text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary">
              {unreadCount}
            </span>
          )}
        </button>

        <WhatsNewModal
          open={open}
          onOpenChange={setOpen}
          updates={updates}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={showLabel ? "sm" : "icon"}
        onClick={handleOpenModal}
        className={cn("relative gap-2", className)}
      >
        <Sparkles className="w-4 h-4 text-primary" />
        {showLabel && <span>What&apos;s New</span>}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </Button>

      <WhatsNewModal
        open={open}
        onOpenChange={setOpen}
        updates={updates}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        isLoading={isLoading}
      />
    </>
  );
}
