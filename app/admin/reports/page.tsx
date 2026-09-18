import { Flag, ShieldAlert, CheckCircle2, XCircle, Trash2, Clock, Mail } from "lucide-react";
import Link from "next/link";
import {
  getAdminChatReports,
  updateReportStatus,
  deleteReportedMessage,
} from "@/features/admin/services/chat-reports.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  AdminStagger,
  AdminMotionItem,
} from "@/features/admin/components/admin-motion-wrapper";

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: "pending" | "reviewed" | "dismissed" | "all";
  }>;
}

export default async function AdminReportsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);
  const statusFilter = searchParams.status || "all";

  const { reports, total, pendingCount, totalPages } = await getAdminChatReports(
    page,
    20,
    statusFilter
  );

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const reportId = formData.get("reportId") as string;
    const newStatus = formData.get("status") as "pending" | "reviewed" | "dismissed";
    
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await updateReportStatus(reportId, newStatus, user.id);
    revalidatePath("/admin/reports");
  }

  async function handleDeleteMessage(formData: FormData) {
    "use server";
    const messageId = formData.get("messageId") as string;
    const reportId = formData.get("reportId") as string;

    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await deleteReportedMessage(messageId, reportId, user.id);
    revalidatePath("/admin/reports");
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Chat Moderation</h1>
            {pendingCount > 0 && (
              <span className="relative flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Student safety dispatch and reported Global Chat violations
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {[
          { key: "all", label: "All Reports" },
          { key: "pending", label: `Pending (${pendingCount})` },
          { key: "reviewed", label: "Reviewed" },
          { key: "dismissed", label: "Dismissed" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/reports?status=${tab.key}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/[0.06] bg-[#0c0c0c]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <Flag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No reports in this queue</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {statusFilter === "pending"
              ? "All chat reports have been investigated and resolved!"
              : "No chat reports match the active filter criteria."}
          </p>
        </div>
      ) : (
        <AdminStagger className="space-y-4">
          {reports.map((report) => (
            <AdminMotionItem key={report.id} variant="card">
              <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 space-y-4 hover:border-white/[0.12] hover:bg-[#0c0c0c]/90 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                {/* Top Row: Reason, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">{report.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        report.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : report.status === "reviewed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(report.created_at)}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Reported Message Content & Reporter Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Reported Message */}
                  <div className="md:col-span-2 space-y-2 p-3.5 rounded-lg bg-black/50 border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-medium text-zinc-300">
                        Author: {report.reported_message?.sender_name || report.reported_message?.sender_email || "Unknown"}
                      </span>
                      {report.reported_message?.deleted_at && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono border border-rose-500/20">
                          DELETED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-200 italic font-mono bg-white/[0.02] p-2.5 rounded border border-white/[0.04] break-words">
                      &ldquo;{report.reported_message?.content || "[Message unavailable]"}&rdquo;
                    </p>
                    {report.details && (
                      <div className="text-xs text-zinc-400 pt-1">
                        <span className="text-amber-400/90 font-semibold">Incident Context:</span> &ldquo;{report.details}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Reporter & Metadata */}
                  <div className="p-3.5 rounded-lg bg-white/[0.015] border border-white/[0.04] space-y-2 text-xs">
                    <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                      Reporter Identity
                    </div>
                    <div className="space-y-1 text-zinc-300">
                      <p className="font-medium text-white">
                        {report.reporter?.full_name || "Student"}
                      </p>
                      <p className="text-zinc-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" />
                        {report.reporter?.email || "No email available"}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">
                        ID: {report.reporter_id.slice(0, 8)}...
                      </p>
                    </div>

                    {report.reviewer && (
                      <div className="pt-2 border-t border-white/[0.04] text-[11px] text-zinc-500">
                        Reviewed by {report.reviewer.email} {report.reviewed_at ? formatTimeAgo(report.reviewed_at) : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Controls with micro-press physics */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  {report.reported_message && !report.reported_message.deleted_at && (
                    <form action={handleDeleteMessage}>
                      <input type="hidden" name="messageId" value={report.message_id} />
                      <input type="hidden" name="reportId" value={report.id} />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Purge Message & Approve
                      </button>
                    </form>
                  )}

                  {report.status !== "reviewed" && (
                    <form action={handleUpdateStatus}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="status" value="reviewed" />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    </form>
                  )}

                  {report.status !== "dismissed" && (
                    <form action={handleUpdateStatus}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="status" value="dismissed" />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </AdminMotionItem>
          ))}
        </AdminStagger>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-zinc-400">
          <span>
            Page {page} of {totalPages} ({total} total reports)
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/reports?status=${statusFilter}&page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-white border border-white/10 transition-all"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/reports?status=${statusFilter}&page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-white border border-white/10 transition-all"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
