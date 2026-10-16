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

let cachedUpdates: { data: AppUpdate[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;

export function WhatsNewTrigger({
  variant = "ghost",
  showLabel = true,
  className,
}: WhatsNewTriggerProps) {
  const [open, setOpen] = useState(false);
  const [updates, setUpdates] = useState<AppUpdate[]>(() => cachedUpdates?.data || []);
  const [isLoading, setIsLoading] = useState(!cachedUpdates);

  const fetchUpdates = useCallback(async (force = false) => {
    if (!force && cachedUpdates && Date.now() - cachedUpdates.timestamp < CACHE_TTL_MS) {
      setUpdates(cachedUpdates.data);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/whats-new");
      if (res.ok) {
        const data = await res.json();
        const fresh = (data.updates || []) as AppUpdate[];
        cachedUpdates = { data: fresh, timestamp: Date.now() };
        setUpdates(fresh);
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
            "relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B0D12] active:scale-[0.98] w-full group select-none cursor-pointer",
            open
              ? "text-white font-semibold"
              : "text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-white/[0.04]",
            className
          )}
        >
          {open && (
            <div
              className="absolute inset-0 rounded-lg bg-[#78A9FF]/10 border border-[#78A9FF]/20 shadow-[inset_0_1px_0_rgba(120,169,255,0.12)]"
            />
          )}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center transition-colors duration-200",
                  open ? "text-[#78A9FF]" : "text-[#A4ADBB] group-hover:text-[#F5F7FB]"
                )}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              {showLabel && <span className="truncate">What&apos;s New</span>}
            </div>

            {unreadCount > 0 && (
              <span className="bg-[#78A9FF]/20 text-[#78A9FF] border border-[#78A9FF]/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex items-center justify-center shrink-0">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </button>

        {open && (
          <WhatsNewModal
            open={open}
            onOpenChange={setOpen}
            updates={updates}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            isLoading={isLoading}
          />
        )}
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

      {open && (
        <WhatsNewModal
          open={open}
          onOpenChange={setOpen}
          updates={updates}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
