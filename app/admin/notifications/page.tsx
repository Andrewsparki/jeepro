"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { ConfirmationDialog } from "@/features/admin/components/confirmation-dialog";
import { Bell, Plus, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, useReducedMotion } from "framer-motion";
import { playHapticSound } from "@/lib/sound-effects";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  target_type: "all" | "user";
  target_user_id: string | null;
  creator_email?: string;
  target_user_email?: string;
  created_at: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const TYPE_COLORS = {
  info: "text-blue-400",
  warning: "text-amber-400",
  success: "text-emerald-400",
  error: "text-rose-400",
};

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<"info" | "warning" | "success" | "error">("info");
  const [formTargetType, setFormTargetType] = useState<"all" | "user">("all");
  const [formTargetUserId, setFormTargetUserId] = useState("");

  const fetchNotifications = useCallback(async (p: number, search: string, type: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/notifications?page=${p}&pageSize=20`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (type !== "all") url += `&type=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications(page, searchQuery, typeFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [page, searchQuery, typeFilter, fetchNotifications]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleClearNotifications = async () => {
    setIsClearing(true);
    try {
      let url = "/api/admin/notifications";
      const params: string[] = [];
      if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (typeFilter !== "all") params.push(`type=${encodeURIComponent(typeFilter)}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        toast.success(
          searchQuery.trim() || typeFilter !== "all"
            ? `Cleared matching notifications.`
            : `All notifications have been purged.`
        );
        setShowClearConfirm(false);
        setPage(1);
        fetchNotifications(1, searchQuery, typeFilter);
      } else {
        toast.error(result.error || "Failed to clear notifications");
      }
    } catch {
      toast.error("Failed to clear notifications");
    } finally {
      setIsClearing(false);
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      toast.error("Title and message are required");
      return;
    }

    if (formTargetType === "user" && !formTargetUserId.trim()) {
      toast.error("Target user ID is required for user-targeted notifications");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          message: formMessage.trim(),
          type: formType,
          target_type: formTargetType,
          target_user_id: formTargetType === "user" ? formTargetUserId.trim() : null,
        }),
      });

      if (res.ok) {
        toast.success("Notification created successfully");
        setShowCreate(false);
        resetForm();
        fetchNotifications(1, searchQuery, typeFilter);
        setPage(1);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create notification");
      }
    } catch {
      toast.error("Failed to create notification");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications/${deleteTarget}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Notification deleted");
        setDeleteTarget(null);
        fetchNotifications(page, searchQuery, typeFilter);
      } else {
        toast.error("Failed to delete notification");
      }
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormMessage("");
    setFormType("info");
    setFormTargetType("all");
    setFormTargetUserId("");
  };

  const columns = [
    {
      key: "type",
      label: "Type",
      className: "w-[60px]",
      render: (item: NotificationItem) => {
        const Icon = TYPE_ICONS[item.type];
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Icon className={`w-4 h-4 ${TYPE_COLORS[item.type]}`} />
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title & Message",
      render: (item: NotificationItem) => (
        <div className="min-w-0">
          <p className="text-sm text-zinc-200 font-medium truncate">{item.title}</p>
          <p className="text-xs text-zinc-500 truncate mt-0.5 max-w-[320px]">{item.message}</p>
        </div>
      ),
    },
    {
      key: "target_type",
      label: "Target Audience",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-400">
          {item.target_type === "all" ? (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
              Global Broadcast
            </span>
          ) : (
            <span className="text-zinc-300 truncate block max-w-[160px]">
              {item.target_user_email || item.target_user_id || "Specific User"}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "creator_email",
      label: "Originator",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-500 truncate block max-w-[160px]">
          {item.creator_email || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Dispatched",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-500 font-mono">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-[50px] text-right",
      render: (item: NotificationItem) => (
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            playHapticSound("click");
            setDeleteTarget(item.id);
          }}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Dispatch announcements, maintenance alerts, and system telemetry to students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              onClick={() => {
                playHapticSound("click");
                setShowClearConfirm(true);
              }}
              disabled={!data?.total || isLoading}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-semibold gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {searchQuery.trim() || typeFilter !== "all" ? "Clear Filtered Logs" : "Purge Notifications"}
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => {
                playHapticSound("click");
                setShowCreate(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Plus className="w-4 h-4" />
              Dispatch Notification
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mr-1">Severity:</span>
        {[
          { id: "all", label: "All Types" },
          { id: "info", label: "Info" },
          { id: "warning", label: "Warning" },
          { id: "success", label: "Success" },
          { id: "error", label: "Error" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              playHapticSound("click");
              setTypeFilter(t.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === t.id
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminDataTable<NotificationItem>
        columns={columns}
        data={data?.notifications || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.pageSize || 20}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder="Search title, message, target ID, or email..."
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyMessage="No broadcast notifications recorded yet."
      />

      {/* Create Notification Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          className="sm:max-w-lg bg-[#111111]/95 border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <span>Compose Broadcast</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Direct notification payload to student accounts. Duplicate protection enforced within 5 minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Header Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Notice: Scheduled maintenance or update"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/15 transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Detailed Body
              </label>
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Full notification text delivered to user center..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/15 resize-none transition-all"
              />
            </div>

            {/* Type Selector with subtle micro-selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["info", "warning", "success", "error"] as const).map((t) => {
                  const Icon = TYPE_ICONS[t];
                  const isSelected = formType === t;
                  return (
                    <motion.button
                      key={t}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        playHapticSound("click");
                        setFormType(t);
                      }}
                      className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                          : "border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? TYPE_COLORS[t] : ""}`} />
                      <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <div className="flex gap-2 p-1 rounded-lg bg-black/40 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    playHapticSound("click");
                    setFormTargetType("all");
                  }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    formTargetType === "all"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All Users (Broadcast)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playHapticSound("click");
                    setFormTargetType("user");
                  }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    formTargetType === "user"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Specific User (Direct)
                </button>
              </div>

              {formTargetType === "user" && (
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    value={formTargetUserId}
                    onChange={(e) => setFormTargetUserId(e.target.value)}
                    placeholder="User ID UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                    className="mt-2 w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/15 font-mono text-xs"
                  />
                </motion.div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                onClick={() => {
                  playHapticSound("click");
                  setShowCreate(false);
                  resetForm();
                }}
                disabled={createLoading}
                className="border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              >
                Cancel
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => {
                  playHapticSound("click");
                  handleCreate();
                }}
                disabled={createLoading || !formTitle.trim() || !formMessage.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {createLoading ? "Dispatching..." : "Transmit Notification"}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Revoke Notification"
        description="This will immediately purge the notification from all recipient inboxes and event caches."
        confirmLabel="Purge Notification"
        onConfirm={handleDelete}
        isDestructive
        isLoading={deleteLoading}
      />

      {/* Clear All/Filtered Notifications Dialog */}
      <ConfirmationDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title={
          searchQuery.trim() || typeFilter !== "all"
            ? "Clear Filtered Notifications"
            : "Purge All Notifications"
        }
        description={
          searchQuery.trim() || typeFilter !== "all"
            ? `Are you sure you want to permanently delete all notification records matching current search/filter criteria? This action cannot be undone.`
            : "Are you sure you want to permanently purge all system broadcast notifications? This action cannot be undone."
        }
        confirmLabel={
          searchQuery.trim() || typeFilter !== "all"
            ? "Clear Matching Notifications"
            : "Permanently Purge All"
        }
        onConfirm={handleClearNotifications}
        isDestructive
        isLoading={isClearing}
      />
    </div>
  );
}
