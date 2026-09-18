"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { ConfirmationDialog } from "@/features/admin/components/confirmation-dialog";
import { ScrollText, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { playHapticSound } from "@/lib/sound-effects";
import { toast } from "sonner";

interface AuditLogItem {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  admin_email?: string;
}

interface AuditLogsResponse {
  logs: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function getActionBadge(action: string) {
  if (action.includes("enabled") || action.includes("created")) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (action.includes("disabled") || action.includes("deleted") || action.includes("cleared")) {
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
  if (action.includes("maintenance") || action.includes("warn")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

export default function AdminAuditLogPage() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchAuditLogs = useCallback(async (p: number, search: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/audit-logs?page=${p}&pageSize=25`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAuditLogs(page, searchQuery);
    }, 0);

    return () => clearTimeout(timeout);
  }, [page, searchQuery, fetchAuditLogs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      let url = "/api/admin/audit-logs";
      if (searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        toast.success(
          searchQuery.trim()
            ? `Cleared matching audit log records.`
            : `All audit logs have been purged.`
        );
        setShowClearConfirm(false);
        setPage(1);
        fetchAuditLogs(1, searchQuery);
      } else {
        toast.error(result.error || "Failed to clear audit logs");
      }
    } catch {
      toast.error("Failed to clear audit logs");
    } finally {
      setIsClearing(false);
    }
  };

  const columns = [
    {
      key: "created_at",
      label: "Timestamp",
      className: "w-[180px]",
      render: (item: AuditLogItem) => (
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
          <span className="text-xs text-zinc-400 font-mono">
            {new Date(item.created_at).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "medium",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (item: AuditLogItem) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono ${getActionBadge(
            item.action
          )}`}
        >
          {item.action}
        </span>
      ),
    },
    {
      key: "admin_email",
      label: "Admin",
      render: (item: AuditLogItem) => (
        <span className="text-xs text-zinc-300 font-medium truncate block max-w-[200px]">
          {item.admin_email || item.admin_user_id}
        </span>
      ),
    },
    {
      key: "target",
      label: "Target",
      render: (item: AuditLogItem) => (
        <span className="text-xs text-zinc-400">
          {item.target_type ? (
            <span>
              <span className="text-zinc-500 font-medium">{item.target_type}:</span>{" "}
              <span className="font-mono text-zinc-300">{item.target_id || "all"}</span>
            </span>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "metadata",
      label: "Details",
      render: (item: AuditLogItem) => {
        const hasMetadata =
          item.metadata && Object.keys(item.metadata).length > 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 truncate max-w-[250px] font-mono">
              {hasMetadata ? JSON.stringify(item.metadata) : "None"}
            </span>
            {hasMetadata && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playHapticSound("click");
                  setSelectedLog(item);
                }}
                className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="View full details"
              >
                <Eye className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Immutable chronological ledger of administrative authorizations and security events
          </p>
        </div>

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
            {searchQuery.trim() ? "Clear Filtered Logs" : "Purge Audit Log"}
          </Button>
        </motion.div>
      </div>

      <AdminDataTable<AuditLogItem>
        columns={columns}
        data={data?.logs || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.pageSize || 25}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder="Search action, target ID, or admin email..."
        isLoading={isLoading}
        onRowClick={(item) => setSelectedLog(item)}
        keyExtractor={(item) => item.id}
        emptyMessage="No audit logs recorded yet."
      />

      {/* Metadata Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      >
        <DialogContent
          className="sm:max-w-lg bg-[#111111]/95 border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-amber-500" />
              </div>
              <span>Audit Log Record</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Recorded on {selectedLog && new Date(selectedLog.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Action Event</p>
                  <p className="text-white font-mono mt-0.5">{selectedLog.action}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Administrator</p>
                  <p className="text-white truncate mt-0.5">
                    {selectedLog.admin_email || selectedLog.admin_user_id}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Target Type</p>
                  <p className="text-white mt-0.5">{selectedLog.target_type || "N/A"}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Target Identifier</p>
                  <p className="text-white truncate font-mono mt-0.5">{selectedLog.target_id || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1.5">JSON Payload</p>
                <pre className="p-3 rounded-lg border border-white/[0.06] bg-black/60 text-xs text-amber-300/90 font-mono overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear Logs Confirmation Dialog */}
      <ConfirmationDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title={searchQuery.trim() ? "Clear Filtered Audit Logs" : "Purge All Audit Logs"}
        description={
          searchQuery.trim()
            ? `Are you sure you want to permanently delete all audit log records matching search "${searchQuery}"? This action cannot be undone.`
            : "Are you sure you want to permanently purge all administrative audit log records? This action cannot be undone, though a record of this clear action will be recorded."
        }
        confirmLabel={searchQuery.trim() ? "Clear Matching Logs" : "Permanently Purge All"}
        onConfirm={handleClearLogs}
        isDestructive
        isLoading={isClearing}
      />
    </div>
  );
}
