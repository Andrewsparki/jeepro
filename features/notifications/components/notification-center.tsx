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
  Trash2,
  X,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useSubSmoothScroll } from "@/components/ui/sub-smooth-scroll";
import { useNotifications } from "../context/notification-context";
import { useSettings } from "@/providers/settings-provider";
import { playHapticSound } from "@/lib/sound-effects";
import { NotificationItem, NotificationType } from "../types";
import { cn } from "@/lib/utils";
import { ContextMenuTrigger } from "@/features/context-menu";
import { toast } from "sonner";

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

// Panel animation variants originating from bell (top-right)
const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: -10,
    transformOrigin: "top right",
    transition: {
      duration: 0.18,
      ease: [0.32, 0, 0.67, 0], // Fast ease-in toward bell on close
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transformOrigin: "top right",
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      mass: 0.8,
      when: "beforeChildren",
    },
  },
};

// Container orchestrator for children
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
};

// Individual notification item variant
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 450,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    x: 20,
    scale: 0.95,
    overflow: "hidden",
    transition: {
      height: { duration: 0.2, ease: "easeOut" },
      opacity: { duration: 0.15 },
      x: { duration: 0.18 },
    },
  },
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const { settings, updateSetting, playSound } = useSettings();

  // Unified Locomotive (Lenis) inertia scroll engine for notifications
  const {
    containerRef: scrollWrapperRef,
    contentRef: scrollContentRef,
    resize: resizeScroll,
  } = useSubSmoothScroll<HTMLDivElement>({
    enabled: isOpen,
    overscroll: true,
  });

  // Recalculate dimensions dynamically when notifications list changes
  React.useEffect(() => {
    resizeScroll();
  }, [notifications.length, resizeScroll]);

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
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isOpen
              ? "bg-accent/15 text-accent shadow-[0_0_12px_rgba(var(--accent-rgb,245,158,11),0.25)]"
              : "hover:bg-muted/50 hover:text-foreground"
          )}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          {/* Bell Icon with Subtle Rotational Chime on Open */}
          <motion.div
            animate={
              isOpen
                ? {
                    rotate: [0, -14, 12, -8, 4, 0],
                    scale: 1.05,
                  }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              duration: 0.45,
              ease: "easeOut",
            }}
          >
            <Bell className="h-4 w-4" />
          </motion.div>

          {/* Unread Badge (1-9, 9+, hidden on 0) */}
          <AnimatePresence>
            {badgeText && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn(
                  "absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-accent text-accent-foreground font-bold tracking-tight shadow-[0_0_8px_rgba(var(--accent-rgb,245,158,11),0.4)] pointer-events-none",
                  badgeText === "9+"
                    ? "h-4 min-w-4 px-1 text-[9px]"
                    : "h-3.5 min-w-3.5 text-[9px]"
                )}
              >
                {badgeText}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Notifications</span>
        </motion.button>
      </PopoverPrimitive.Trigger>

      <AnimatePresence>
        {isOpen && (
          <PopoverPrimitive.Portal forceMount>
            <PopoverPrimitive.Content
              asChild
              forceMount
              align="end"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="z-50 outline-none"
            >
              <motion.div
                key="notification-panel"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                data-lenis-prevent="true"
                className="w-[360px] max-w-[calc(100vw-24px)] p-0 rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-2xl shadow-strong overflow-hidden text-popover-foreground"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-surface/50 select-none">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight">
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
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
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
                        type="button"
                        onClick={() => {
                          playSound("success");
                          markAllAsRead();
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1 px-1.5 rounded-md hover:bg-muted/50"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5 text-accent" />
                        <span>Mark read</span>
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          playSound("soft-tap");
                          clearAll();
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-rose-400 transition-colors py-1 px-1.5 rounded-md hover:bg-rose-500/10"
                        title="Clear all notifications"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear all</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification History List with Dedicated Locomotive / Lenis Scroll */}
                <div 
                  ref={scrollWrapperRef}
                  data-lenis-prevent="true"
                  className="max-h-[360px] sm:max-h-[400px] overflow-y-auto overscroll-contain touch-pan-y divide-y divide-border/30 pointer-events-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:hover:bg-accent/50 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors"
                >
                  <div ref={scrollContentRef}>
                    {isLoading && notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-r-transparent" />
                        <p className="text-xs text-muted-foreground mt-2">Loading updates...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      /* Empty State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.25 }}
                        className="py-12 px-6 flex flex-col items-center justify-center text-center"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mb-3 text-muted-foreground">
                          <Inbox className="h-6 w-6 opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                          New study milestones, streak alerts, and announcements will appear here.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={listContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-border/30"
                      >
                        <AnimatePresence initial={false}>
                          {notifications.map((item: NotificationItem) => {
                            const isUnseen = !item.seen_at;

                            const notifMenuItems = [
                              {
                                id: "read-notif",
                                label: isUnseen ? "Mark as Read" : "Already Read",
                                icon: CheckCheck,
                                disabled: !isUnseen,
                                onClick: () => markAsRead(item.id),
                              },
                              {
                                id: "delete-notif",
                                label: "Delete Notification",
                                icon: Trash2,
                                danger: true,
                                onClick: () => deleteNotification(item.id),
                              },
                              { id: "sep-1", separator: true, label: "" },
                              {
                                id: "copy-notif-msg",
                                label: "Copy Message",
                                icon: Copy,
                                onClick: () => {
                                  navigator.clipboard.writeText(item.message);
                                  toast.success("Notification message copied");
                                },
                              },
                            ];

                            return (
                              <ContextMenuTrigger key={item.id} items={notifMenuItems} title={item.title}>
                                <motion.div
                                  variants={itemVariants}
                                  exit="exit"
                                  onClick={() => {
                                    if (isUnseen) {
                                      playSound("soft-tap");
                                      markAsRead(item.id);
                                    }
                                  }}
                                  className={cn(
                                    "relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer group",
                                    isUnseen
                                      ? "bg-accent/[0.06] hover:bg-accent/[0.1]"
                                      : "hover:bg-muted/30"
                                  )}
                                >
                                {/* Icon */}
                                <div className="mt-0.5 p-2 rounded-xl bg-muted/40 border border-border/40 group-hover:border-border/60 transition-colors">
                                  {getNotificationIcon(item.type)}
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0 pr-1">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p
                                      className={cn(
                                        "text-xs leading-snug truncate",
                                        isUnseen
                                          ? "font-semibold text-foreground"
                                          : "font-medium text-foreground/80"
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

                                {/* Actions & Status */}
                                <div className="flex items-center gap-1 shrink-0 mt-0.5 self-center">
                                  {isUnseen && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0 shadow-[0_0_6px_rgba(var(--accent-rgb,245,158,11),0.5)] group-hover:opacity-30 transition-opacity" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playSound("soft-tap");
                                      deleteNotification(item.id);
                                    }}
                                    title="Delete notification"
                                    aria-label="Delete notification"
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                              </ContextMenuTrigger>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        )}
      </AnimatePresence>
    </PopoverPrimitive.Root>
  );
}
