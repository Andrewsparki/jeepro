"use client";

import { useEffect, useState } from "react";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { ScrollText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  if (action.includes("disabled") || action.includes("deleted")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (action.includes("maintenance")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

export default function AdminAuditLogPage() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/audit-logs?page=${page}&pageSize=25`);
        if (res.ok && !ignore) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    // Defer execution out of synchronous effect body
    const timeout = setTimeout(() => {
      load();
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [page]);

  const columns = [
    {
      key: "created_at",
      label: "Timestamp",
      className: "w-[180px]",
      render: (item: AuditLogItem) => (
        <span className="text-xs text-zinc-400 font-mono">
          {new Date(item.created_at).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "medium",
          })}
        </span>
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
              <span className="text-zinc-500">{item.target_type}:</span>{" "}
              {item.target_id || "all"}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLog(item);
                }}
                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                title="View full details"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Chronological record of all administrative actions and security events
        </p>
      </div>

      <AdminDataTable<AuditLogItem>
        columns={columns}
        data={data?.logs || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.pageSize || 25}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
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
        <DialogContent className="sm:max-w-lg bg-[#111] border-white/[0.08]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ScrollText className="w-5 h-5 text-amber-500" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Recorded on {selectedLog && new Date(selectedLog.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Action</p>
                  <p className="text-white font-mono mt-0.5">{selectedLog.action}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Admin</p>
                  <p className="text-white truncate mt-0.5">
                    {selectedLog.admin_email || selectedLog.admin_user_id}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Target Type</p>
                  <p className="text-white mt-0.5">{selectedLog.target_type || "N/A"}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-zinc-500 font-medium">Target ID</p>
                  <p className="text-white truncate mt-0.5">{selectedLog.target_id || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1.5">Metadata Payload</p>
                <pre className="p-3 rounded-lg border border-white/[0.06] bg-black/50 text-xs text-amber-300 font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
