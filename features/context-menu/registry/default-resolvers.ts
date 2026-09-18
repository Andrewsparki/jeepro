import { contextMenuRegistry } from "./context-menu-registry";
import { ContextMenuItem } from "../types/context-menu.types";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Copy,
  MessageSquare,
  Trash2,
  Flag,
  User,
  CheckCheck,
  Clock,
  Trophy,
  Calendar,
  Pause,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  GraduationCap,
  Info,
  Circle,
  Pencil,
  Bookmark,
  Reply,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Initializes and registers default context action resolvers for all core
 * JEE Pro semantic targets.
 */
export function initDefaultResolvers() {
  // ── 1. STUDY CHAPTER ──
  contextMenuRegistry.register("study-chapter", ({ target, router }) => {
    const data = target.data || {};
    const title = target.title || data.title || "Chapter";
    const subjectSlug = data.subjectSlug || "physics";
    const chapterSlug = data.slug || data.chapterSlug;

    const items: ContextMenuItem[] = [];

    if (chapterSlug) {
      items.push({
        id: "open-workspace",
        label: "Open Chapter Workspace",
        icon: BookOpen,
        onClick: () => router?.push(`/dashboard/study/${subjectSlug}/${chapterSlug}`),
      });
    }

    if (data.onStartSession) {
      items.push({
        id: "start-session",
        label: "Start Chapter Focus",
        icon: Play,
        onClick: () => data.onStartSession(),
      });
    }

    if (data.onToggleStatus) {
      items.push({
        id: "toggle-status",
        label: data.isMastered ? "Mark as Not Started" : "Mark as Mastered",
        icon: CheckCircle2,
        onClick: () => data.onToggleStatus(),
      });
    }

    items.push({
      id: "bookmark-chapter",
      label: data.isBookmarked ? "Remove Bookmark" : "Bookmark Chapter",
      icon: Bookmark,
      onClick: () => {
        if (data.onBookmark) {
          data.onBookmark();
        } else {
          toast.success(`Bookmarked ${title}`);
        }
      },
    });

    items.push({ id: "sep-copy-chapter", separator: true, label: "" });

    if (subjectSlug && chapterSlug) {
      items.push({
        id: "copy-chapter-link",
        label: "Copy Chapter Link",
        icon: LinkIcon,
        onClick: () => {
          if (typeof window !== "undefined") {
            const url = `${window.location.origin}/dashboard/study/${subjectSlug}/${chapterSlug}`;
            navigator.clipboard.writeText(url);
            toast.success("Chapter link copied to clipboard");
          }
        },
      });
    }

    items.push({
      id: "copy-title",
      label: "Copy Chapter Title",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(title);
        toast.success("Chapter title copied");
      },
    });

    return items;
  });

  // ── 2. STUDY TOPIC ──
  contextMenuRegistry.register("study-topic", ({ target }) => {
    const data = target.data || {};
    const title = target.title || data.title || "Topic";

    const items: ContextMenuItem[] = [];

    if (data.onStartSession) {
      items.push({
        id: "start-topic-session",
        label: "Start Focus Module",
        icon: Play,
        onClick: () => data.onStartSession(),
      });
    }

    if (data.onToggleComplete) {
      items.push({
        id: "toggle-topic-complete",
        label: data.isCompleted ? "Mark as Incomplete" : "Mark as Completed",
        icon: CheckCircle2,
        onClick: () => data.onToggleComplete(),
      });
    }

    items.push({
      id: "bookmark-topic",
      label: data.isBookmarked ? "Remove Bookmark" : "Bookmark Topic",
      icon: Bookmark,
      onClick: () => {
        if (data.onBookmark) {
          data.onBookmark();
        } else {
          toast.success(`Bookmarked ${title}`);
        }
      },
    });

    items.push({ id: "sep-copy-topic", separator: true, label: "" });

    items.push({
      id: "copy-topic-link",
      label: "Copy Topic Link",
      icon: LinkIcon,
      onClick: () => {
        if (typeof window !== "undefined") {
          const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(title)}`;
          navigator.clipboard.writeText(url);
          toast.success("Topic link copied");
        }
      },
    });

    items.push({
      id: "copy-topic-title",
      label: "Copy Topic Title",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(title);
        toast.success("Topic title copied");
      },
    });

    return items;
  });

  // ── 3. CHAT MESSAGE ──
  contextMenuRegistry.register("chat-message", ({ target }) => {
    const data = target.data || {};
    const content = data.content || "";

    const items: ContextMenuItem[] = [
      {
        id: "copy-chat-text",
        label: "Copy Text",
        icon: Copy,
        onClick: () => {
          navigator.clipboard.writeText(content);
          toast.success("Message copied to clipboard");
        },
      },
      {
        id: "reply-chat-msg",
        label: "Reply to Message",
        icon: Reply,
        onClick: () => {
          if (data.onReply) {
            data.onReply();
          } else {
            toast.info("Reply initiated");
          }
        },
      },
    ];

    if (data.isCurrentUser && data.onDelete) {
      items.push({
        id: "delete-chat-msg",
        label: "Delete Message",
        icon: Trash2,
        danger: true,
        onClick: () => data.onDelete(),
      });
    } else if (!data.isCurrentUser && data.onReport) {
      items.push({
        id: "report-chat-msg",
        label: "Report Message",
        icon: Flag,
        onClick: () => data.onReport(),
      });
    }

    return items;
  });

  // ── 3B. PLANNER EVENT ──
  contextMenuRegistry.register("planner-event", ({ target }) => {
    const data = target.data || {};
    const title = target.title || "Study Event";
    const isCompleted = Boolean(data.isCompleted);

    const items: ContextMenuItem[] = [];

    if (data.onToggleStatus) {
      items.push({
        id: "toggle-planner-event",
        label: isCompleted ? "Mark as Pending" : "Mark as Complete",
        icon: isCompleted ? Circle : CheckCircle2,
        onClick: () => data.onToggleStatus(),
      });
    }

    if (data.onEdit) {
      items.push({
        id: "edit-planner-event",
        label: "Edit Event",
        icon: Pencil,
        onClick: () => data.onEdit(),
      });
    }

    if (data.onDelete) {
      items.push({
        id: "delete-planner-event",
        label: "Delete Event",
        icon: Trash2,
        danger: true,
        onClick: () => data.onDelete(),
      });
    }

    items.push({ id: "sep-copy-planner", separator: true, label: "" });
    items.push({
      id: "copy-event-title",
      label: "Copy Event Title",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(title);
        toast.success("Event title copied");
      },
    });

    return items;
  });

  // ── 4. FRIEND CARD ──
  contextMenuRegistry.register("friend-card", ({ target, router }) => {
    const data = target.data || {};
    const name = target.title || data.fullName || "Friend";
    const userId = data.userId || target.id;

    const items: ContextMenuItem[] = [];

    if (data.onViewProfile || userId) {
      items.push({
        id: "view-profile",
        label: "View Profile",
        icon: User,
        onClick: () => {
          if (data.onViewProfile) data.onViewProfile();
        },
      });
    }

    if (userId) {
      items.push({
        id: "send-dm",
        label: "Send Message",
        icon: MessageSquare,
        onClick: () => router?.push(`/dashboard/chat/${userId}`),
      });
    }

    if (data.onAccept) {
      items.push({
        id: "accept-request",
        label: "Accept Friend Request",
        icon: CheckCircle2,
        onClick: () => data.onAccept(),
      });
    }

    if (data.onCancel) {
      items.push({
        id: "cancel-request",
        label: "Cancel Friend Request",
        icon: Trash2,
        danger: true,
        onClick: () => data.onCancel(),
      });
    }

    if (data.onRemove) {
      items.push({
        id: "remove-friend",
        label: "Remove Friend",
        icon: Trash2,
        danger: true,
        onClick: () => data.onRemove(),
      });
    }

    items.push({ id: "sep-copy", separator: true, label: "" });
    items.push({
      id: "copy-name",
      label: "Copy Name",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(name);
        toast.success("Name copied");
      },
    });

    return items;
  });

  // ── 5. LEADERBOARD USER ──
  contextMenuRegistry.register("leaderboard-user", ({ target, router }) => {
    const data = target.data || {};
    const userId = data.userId || target.id;
    const name = target.title || data.fullName || "Aspirant";
    const isCurrentUser = Boolean(data.isCurrentUser);

    if (isCurrentUser) {
      return [
        {
          id: "my-analytics",
          label: "View My Analytics",
          icon: Trophy,
          onClick: () => router?.push("/dashboard/analytics"),
        },
        {
          id: "my-achievements",
          label: "View Achievements",
          icon: Sparkles,
          onClick: () => router?.push("/dashboard/achievements"),
        },
        { id: "sep-copy", separator: true, label: "" },
        {
          id: "copy-rank-info",
          label: "Copy My Rank & XP",
          icon: Copy,
          onClick: () => {
            navigator.clipboard.writeText(`Rank #${data.rank || 1}: ${data.totalXp || 0} XP on JEE Pro`);
            toast.success("Rank summary copied");
          },
        },
      ];
    }

    const items: ContextMenuItem[] = [];

    if (data.onUserClick || userId) {
      items.push({
        id: "view-profile",
        label: "View Public Profile",
        icon: User,
        onClick: () => {
          if (data.onUserClick) data.onUserClick(userId);
        },
      });
    }

    if (userId) {
      items.push({
        id: "send-dm",
        label: "Send Message",
        icon: MessageSquare,
        onClick: () => router?.push(`/dashboard/chat/${userId}`),
      });
    }

    items.push({ id: "sep-copy", separator: true, label: "" });
    items.push({
      id: "copy-name",
      label: "Copy Name",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(name);
        toast.success("Name copied");
      },
    });

    return items;
  });

  // ── 6. NOTIFICATION ITEM ──
  contextMenuRegistry.register("notification-item", ({ target }) => {
    const data = target.data || {};
    const items: ContextMenuItem[] = [];

    if (data.onMarkAsRead) {
      items.push({
        id: "read-notif",
        label: data.isUnseen ? "Mark as Read" : "Already Read",
        icon: CheckCheck,
        disabled: !data.isUnseen,
        onClick: () => data.onMarkAsRead(),
      });
    }

    if (data.onDelete) {
      items.push({
        id: "delete-notif",
        label: "Delete Notification",
        icon: Trash2,
        danger: true,
        onClick: () => data.onDelete(),
      });
    }

    if (data.message) {
      items.push({ id: "sep-copy", separator: true, label: "" });
      items.push({
        id: "copy-notif-msg",
        label: "Copy Message",
        icon: Copy,
        onClick: () => {
          navigator.clipboard.writeText(data.message);
          toast.success("Notification message copied");
        },
      });
    }

    return items;
  });

  // ── 7. DASHBOARD WIDGET ──
  contextMenuRegistry.register("dashboard-widget", ({ target, router }) => {
    const data = target.data || {};
    const widgetKind = data.widget || target.id;

    switch (widgetKind) {
      case "missions":
        return [
          {
            id: "open-planner",
            label: "Open Daily Missions & Planner",
            icon: Calendar,
            onClick: () => router?.push("/dashboard/planner"),
          },
          {
            id: "copy-mission-summary",
            label: "Copy Missions Summary",
            icon: Copy,
            onClick: () => {
              navigator.clipboard.writeText("Daily Missions on JEE Pro");
              toast.success("Missions copied");
            },
          },
        ];

      case "continue-learning":
        return [
          {
            id: "resume-study",
            label: "Resume Study Chapter",
            icon: Play,
            onClick: () => {
              if (data.chapterSlug && data.subjectSlug) {
                router?.push(`/dashboard/study/${data.subjectSlug}/${data.chapterSlug}`);
              } else {
                router?.push("/dashboard/study");
              }
            },
          },
          {
            id: "all-chapters",
            label: "Browse All Chapters",
            icon: BookOpen,
            onClick: () => router?.push("/dashboard/study"),
          },
        ];

      case "stat-time":
      case "stat-topics":
        return [
          {
            id: "view-analytics",
            label: "View Study Analytics",
            icon: Trophy,
            onClick: () => router?.push("/dashboard/analytics"),
          },
          {
            id: "view-history",
            label: "View Study History",
            icon: Clock,
            onClick: () => router?.push("/dashboard/history"),
          },
        ];

      case "stat-streak":
      case "stat-level":
        return [
          {
            id: "view-achievements",
            label: "View Achievements",
            icon: Sparkles,
            onClick: () => router?.push("/dashboard/achievements"),
          },
          {
            id: "view-leaderboard",
            label: "View Leaderboard",
            icon: Trophy,
            onClick: () => router?.push("/dashboard/leaderboard"),
          },
        ];

      case "timeline":
        return [
          {
            id: "open-planner-calendar",
            label: "Open Planner Calendar",
            icon: Calendar,
            onClick: () => router?.push("/dashboard/planner"),
          },
        ];

      default:
        return [
          {
            id: "view-study",
            label: "Go to Study Workspace",
            icon: GraduationCap,
            onClick: () => router?.push("/dashboard/study"),
          },
          {
            id: "view-analytics",
            label: "View Analytics",
            icon: Trophy,
            onClick: () => router?.push("/dashboard/analytics"),
          },
        ];
    }
  });

  // ── 8. HISTORY SESSION ──
  contextMenuRegistry.register("history-session", ({ target, router }) => {
    const data = target.data || {};
    const items: ContextMenuItem[] = [];

    if (data.onViewDetails) {
      items.push({
        id: "view-details",
        label: "View Session Details",
        icon: Info,
        onClick: () => data.onViewDetails(),
      });
    }

    if (data.subjectSlug && data.chapterSlug) {
      items.push({
        id: "open-workspace",
        label: "Open Chapter Workspace",
        icon: BookOpen,
        onClick: () => router?.push(`/dashboard/study/${data.subjectSlug}/${data.chapterSlug}`),
      });
    }

    if (data.onStartAgain) {
      items.push({
        id: "resume-study",
        label: "Study This Chapter Again",
        icon: Play,
        onClick: () => data.onStartAgain(),
      });
    }

    items.push({ id: "sep-copy", separator: true, label: "" });
    items.push({
      id: "copy-session-info",
      label: "Copy Session Details",
      icon: Copy,
      onClick: () => {
        const text = `${data.chapterTitle || "Session"} - ${data.durationText || ""} (${data.dateText || ""})`;
        navigator.clipboard.writeText(text);
        toast.success("Session details copied");
      },
    });

    return items;
  });

  // ── 9. FOCUS SESSION ──
  contextMenuRegistry.register("focus-session", ({ target }) => {
    const data = target.data || {};
    const items: ContextMenuItem[] = [];

    if (data.onToggleActive) {
      items.push({
        id: "toggle-active",
        label: data.isActive ? "Pause Session" : "Resume Session",
        icon: data.isActive ? Pause : Play,
        onClick: () => data.onToggleActive(),
      });
    }

    if (data.onEndSession) {
      items.push({
        id: "end-session",
        label: "End & Save Session",
        icon: CheckCircle2,
        onClick: () => data.onEndSession(),
      });
    }

    if (data.onRestart) {
      items.push({
        id: "restart-session",
        label: "Reset Timer",
        icon: RotateCcw,
        onClick: () => data.onRestart(),
      });
    }

    return items;
  });

  // ── 10. ANALYTICS CHART ──
  contextMenuRegistry.register("analytics-chart", ({ target, router }) => {
    const data = target.data || {};
    const title = target.title || data.title || "Metric";
    const value = data.value;

    const items: ContextMenuItem[] = [];

    if (value !== undefined) {
      items.push({
        id: "copy-stat",
        label: `Copy ${title}`,
        icon: Copy,
        onClick: () => {
          navigator.clipboard.writeText(`${title}: ${value}`);
          toast.success(`${title} copied`);
        },
      });
      items.push({ id: "sep-stat", separator: true, label: "" });
    }

    items.push({
      id: "view-history",
      label: "View Study Sessions History",
      icon: Clock,
      onClick: () => router?.push("/dashboard/history"),
    });

    if (data.onRefresh) {
      items.push({
        id: "refresh-analytics",
        label: "Refresh Analytics",
        icon: RotateCcw,
        onClick: () => {
          data.onRefresh();
          toast.success("Analytics data refreshed");
        },
      });
    }

    return items;
  });

  // ── 11. SETTING ITEM ──
  contextMenuRegistry.register("setting-item", ({ target }) => {
    const data = target.data || {};
    return [
      {
        id: "setting-help",
        label: "Setting Details & Help",
        icon: HelpCircle,
        onClick: () => {
          toast.info(data.description || "Configure this setting to customize your JEE Pro experience.");
        },
      },
    ];
  });
}
