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
  error: "text-red-400",
};

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<"info" | "warning" | "success" | "error">("info");
  const [formTargetType, setFormTargetType] = useState<"all" | "user">("all");
  const [formTargetUserId, setFormTargetUserId] = useState("");

  const fetchNotifications = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications?page=${p}&pageSize=20`);
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
      fetchNotifications(page);
    }, 0);
    return () => clearTimeout(timer);
  }, [page, fetchNotifications]);

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
        fetchNotifications(1);
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
        fetchNotifications(page);
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
        return <Icon className={`w-4 h-4 ${TYPE_COLORS[item.type]}`} />;
      },
    },
    {
      key: "title",
      label: "Title",
      render: (item: NotificationItem) => (
        <div className="min-w-0">
          <p className="text-sm text-zinc-200 font-medium truncate">{item.title}</p>
          <p className="text-xs text-zinc-500 truncate mt-0.5 max-w-[300px]">{item.message}</p>
        </div>
      ),
    },
    {
      key: "target_type",
      label: "Target",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-400">
          {item.target_type === "all"
            ? "All Users"
            : item.target_user_email || item.target_user_id || "Specific User"}
        </span>
      ),
    },
    {
      key: "creator_email",
      label: "Created By",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-500">{item.creator_email || "—"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (item: NotificationItem) => (
        <span className="text-xs text-zinc-500 tabular-nums">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-[40px]",
      render: (item: NotificationItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(item.id);
          }}
          className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Create and manage application notifications
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </Button>
      </div>

      <AdminDataTable<NotificationItem>
        columns={columns}
        data={data?.notifications || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.pageSize || 20}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyMessage="No notifications created yet."
      />

      {/* Create Notification Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg bg-[#111] border-white/[0.08]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-amber-500" />
              Create Notification
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Send a notification to users. Duplicates within 5 minutes are prevented.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Message</label>
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Notification message"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
              <div className="flex gap-2">
                {(["info", "warning", "success", "error"] as const).map((t) => {
                  const Icon = TYPE_ICONS[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        formType === t
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${formType === t ? TYPE_COLORS[t] : ""}`} />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Audience</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormTargetType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formTargetType === "all"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setFormTargetType("user")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formTargetType === "user"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  Specific User
                </button>
              </div>

              {formTargetType === "user" && (
                <input
                  type="text"
                  value={formTargetUserId}
                  onChange={(e) => setFormTargetUserId(e.target.value)}
                  placeholder="User ID (UUID)"
                  className="mt-2 w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
                />
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowCreate(false); resetForm(); }}
              disabled={createLoading}
              className="border-white/[0.08] text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createLoading || !formTitle.trim() || !formMessage.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              {createLoading ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Notification"
        description="This notification will be permanently removed and cannot be recovered."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
        isLoading={deleteLoading}
      />
    </div>
  );
}
