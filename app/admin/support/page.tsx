import {
  LifeBuoy,
  Inbox,
  Clock,
  CheckCircle2,
  PlayCircle,
  Mail,
  User,
  BookOpen,
  CreditCard,
  Calendar,
  Bug,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  getAdminSupportTickets,
  updateSupportTicketStatus,
} from "@/features/admin/services/support-tickets.service";
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

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  general: { label: "General", icon: BookOpen },
  account: { label: "Account", icon: User },
  billing: { label: "Billing", icon: CreditCard },
  study_planner: { label: "Study & Planner", icon: Calendar },
  bug_report: { label: "Bug Report", icon: Bug },
  feature_request: { label: "Feature Request", icon: Lightbulb },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  normal: { label: "Normal", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  high: { label: "High", color: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" },
  urgent: { label: "Urgent", color: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  in_progress: { label: "In Progress", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  resolved: { label: "Resolved", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  closed: { label: "Closed", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: "open" | "in_progress" | "resolved" | "closed" | "all";
  }>;
}

export default async function AdminSupportPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);
  const statusFilter = searchParams.status || "all";

  const {
    tickets,
    total,
    openCount,
    inProgressCount,
    resolvedCount,
    totalPages,
  } = await getAdminSupportTickets(page, 20, statusFilter);

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const ticketId = formData.get("ticketId") as string;
    const newStatus = formData.get("status") as "open" | "in_progress" | "resolved" | "closed";

    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await updateSupportTicketStatus(ticketId, newStatus, user.id);
    revalidatePath("/admin/support");
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Support Desk</h1>
            {openCount > 0 && (
              <span className="relative flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                {openCount} Awaiting Response
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Resolve student technical issues, subscription questions, and feature requests
          </p>
        </div>
      </div>

      {/* Stats Cards with entrance stagger */}
      <AdminStagger className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Inquiries", value: total, icon: LifeBuoy, color: "text-zinc-400", bg: "bg-zinc-500/10" },
          { label: "Open Tickets", value: openCount, icon: Inbox, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <AdminMotionItem key={stat.label} variant="card">
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/80 p-4 space-y-2 hover:border-white/[0.12] transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">{stat.label}</span>
                <div className={`p-1.5 rounded-lg border border-white/[0.06] ${stat.bg}`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums tracking-tight">{stat.value}</p>
            </div>
          </AdminMotionItem>
        ))}
      </AdminStagger>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {[
          { key: "all", label: "All Tickets" },
          { key: "open", label: `Open (${openCount})` },
          { key: "in_progress", label: `In Progress (${inProgressCount})` },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/support?status=${tab.key}`}
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

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/[0.06] bg-[#0c0c0c]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <LifeBuoy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No support tickets found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {statusFilter === "open"
              ? "All student support requests have been addressed!"
              : "No tickets match the selected status filter."}
          </p>
        </div>
      ) : (
        <AdminStagger className="space-y-4">
          {tickets.map((ticket) => {
            const catMeta = CATEGORY_META[ticket.category] || CATEGORY_META.general;
            const CatIcon = catMeta.icon;
            const priorityMeta = PRIORITY_META[ticket.priority] || PRIORITY_META.normal;
            const statusMeta = STATUS_META[ticket.status] || STATUS_META.open;

            return (
              <AdminMotionItem key={ticket.id} variant="card">
                <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 space-y-4 hover:border-white/[0.12] hover:bg-[#0c0c0c]/90 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  {/* Top Row: Subject, Category, Priority, Status, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                        <CatIcon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{ticket.subject}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                          {catMeta.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${priorityMeta.color}`}
                      >
                        {priorityMeta.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeAgo(ticket.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Description & User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Description */}
                    <div className="md:col-span-2 space-y-2 p-3.5 rounded-lg bg-black/50 border border-white/[0.04]">
                      <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed break-words">
                        {ticket.description}
                      </p>
                    </div>

                    {/* User Info */}
                    <div className="p-3.5 rounded-lg bg-white/[0.015] border border-white/[0.04] space-y-2 text-xs">
                      <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                        Student Record
                      </div>
                      <div className="space-y-1 text-zinc-300">
                        <p className="font-medium text-white">
                          {ticket.user?.full_name || "Student"}
                        </p>
                        <p className="text-zinc-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {ticket.user?.email || "No email available"}
                        </p>
                        <p className="text-[10px] text-zinc-600 font-mono mt-1">
                          ID: {ticket.user_id.slice(0, 8)}...
                        </p>
                      </div>

                      {ticket.resolved_at && (
                        <div className="pt-2 border-t border-white/[0.04] text-[11px] text-emerald-400 font-medium">
                          Resolved {formatTimeAgo(ticket.resolved_at)}
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/[0.04] text-[10px] text-zinc-600 font-mono">
                        Ticket: {ticket.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Controls with micro-press */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                    {ticket.status !== "in_progress" && ticket.status !== "resolved" && ticket.status !== "closed" && (
                      <form action={handleUpdateStatus}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="status" value="in_progress" />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Mark In Progress
                        </button>
                      </form>
                    )}

                    {ticket.status !== "resolved" && (
                      <form action={handleUpdateStatus}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="status" value="resolved" />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Resolved
                        </button>
                      </form>
                    )}

                    {(ticket.status === "resolved" || ticket.status === "closed") && (
                      <form action={handleUpdateStatus}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="status" value="open" />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Re-open
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </AdminMotionItem>
            );
          })}
        </AdminStagger>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-zinc-400">
          <span>
            Page {page} of {totalPages} ({total} total tickets)
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/support?status=${statusFilter}&page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-white border border-white/10 transition-all"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/support?status=${statusFilter}&page=${page + 1}`}
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
