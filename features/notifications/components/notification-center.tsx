"use client";

import React from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Inbox,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../context/notification-context";
import { useSettings } from "@/providers/settings-provider";
import { playHapticSound } from "@/lib/sound-effects";
import { NotificationItem, NotificationType } from "../types";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "success":
    case "milestone":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    case "achievement":
      return <Trophy className="h-4 w-4 text-amber-400 shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
    case "error":
      return <XCircle className="h-4 w-4 text-rose-400 shrink-0" />;
    case "info":
      return <Info className="h-4 w-4 text-sky-400 shrink-0" />;
    default:
      return <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />;
  }
}

function formatRelativeTime(dateString: string): string {
  const timestamp = new Date(dateString).getTime();
  if (isNaN(timestamp)) return "";

  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const { settings, updateSetting, playSound } = useSettings();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      playSound("pop-up");
    } else {
      playSound("pop-down");
    }
  };

  // Format badge display: 1-9 or 9+
  const badgeText = unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-white/5 hover:text-foreground relative transition-colors"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="h-4 w-4" />

          {/* Unread Badge (1-9, 9+, hidden on 0) */}
          {badgeText && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-accent text-accent-foreground font-bold tracking-tight shadow-[0_0_8px_rgba(var(--accent-rgb,245,158,11),0.4)] pointer-events-none transition-all duration-300",
                badgeText === "9+"
                  ? "h-4 min-w-4 px-1 text-[9px]"
                  : "h-3.5 min-w-3.5 text-[9px]"
              )}
            >
              {badgeText}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] max-w-[calc(100vw-24px)] p-0 rounded-2xl border border-white/10 bg-[#0e0e11]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent/20 text-accent border border-accent/30 tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Chime Preview & Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!settings.sounds) {
                  updateSetting("sounds", true);
                  playHapticSound("notification", true);
                } else {
                  playSound("notification");
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateSetting("sounds", !settings.sounds);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white transition-colors hover:bg-white/5"
              title={
                settings.sounds
                  ? "Sound cues active (click to test chime, right-click to mute)"
                  : "Sound cues muted (click to unmute & test chime)"
              }
              aria-label={
                settings.sounds
                  ? "Test notification sound chime"
                  : "Unmute and test notification sound chime"
              }
            >
              {settings.sounds ? (
                <Volume2 className="h-3.5 w-3.5 text-accent" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 opacity-50" />
              )}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => {
                  playSound("success");
                  markAllAsRead();
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-white transition-colors py-1 px-1.5 rounded-md hover:bg-white/5"
              >
                <CheckCheck className="h-3.5 w-3.5 text-accent" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification History List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-r-transparent" />
              <p className="text-xs text-muted-foreground mt-2">Loading updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3 text-muted-foreground">
                <Inbox className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium text-white">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                New study milestones, streak alerts, and announcements will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item: NotificationItem) => {
              const isUnseen = !item.seen_at;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isUnseen) {
                      playSound("soft-tap");
                      markAsRead(item.id);
                    }
                  }}
                  className={cn(
                    "relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer group",
                    isUnseen
                      ? "bg-accent/[0.04] hover:bg-accent/[0.08]"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  {/* Icon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={cn(
                          "text-xs leading-snug truncate",
                          isUnseen
                            ? "font-semibold text-white"
                            : "font-medium text-zinc-300"
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums font-mono">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Unseen indicator dot */}
                  {isUnseen && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse mt-2 shrink-0 shadow-[0_0_6px_rgba(var(--accent-rgb,245,158,11),0.5)]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
