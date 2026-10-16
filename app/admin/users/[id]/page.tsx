import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/features/admin/services/admin-users.service";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Activity,
  ShieldCheck,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { AdminUserModerationTrigger } from "@/features/admin/components/admin-user-moderation-trigger";
import {
  AdminStagger,
  AdminMotionItem,
} from "@/features/admin/components/admin-motion-wrapper";
import { getAuthUser } from "@/lib/supabase/server";
import { logAuditEvent } from "@/features/admin/services/audit-log.service";
import { pseudonymiseUserId } from "@/features/analytics/services/telemetry.service";
import { getUserTelemetryInsight } from "@/features/analytics/services/server-analytics.service";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUserDetail(id);

  if (!user) {
    notFound();
  }

  // Derive non-reversible pseudonym separating analytics from student identity
  const userPseudonym = pseudonymiseUserId(user.id);
  const telemetry = getUserTelemetryInsight(userPseudonym);

  // Administrative audit logging: record access to individual user telemetry
  const adminUser = await getAuthUser();
  if (adminUser) {
    await logAuditEvent(adminUser.id, "admin.view_user_telemetry", "profile", user.id, {
      user_pseudonym: userPseudonym,
      target_email: user.email,
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back link with micro-motion */}
      <Link
        href="/admin/users"
        className="group inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors select-none"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-zinc-500 group-hover:text-amber-400" />
        <span>Return to Student Directory</span>
      </Link>

      {/* Header Profile Card */}
      <div className="flex items-start gap-4 p-5 rounded-xl border border-white/[0.06] bg-[#0c0c0c]/80 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-xl font-bold text-amber-400">
            {(user.full_name || user.email)?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight truncate">
              {user.full_name || "Unnamed Student"}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border font-mono uppercase tracking-wider ${
                user.role === "superadmin"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : user.role === "admin" || user.is_admin
                  ? "bg-[#78A9FF]/15 text-[#78A9FF] border-[#78A9FF]/30 shadow-[0_0_12px_rgba(120,169,255,0.1)]"
                  : user.role === "moderator"
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                  : "bg-white/[0.06] text-zinc-400 border-white/[0.08]"
              }`}
            >
              {user.role ? user.role.toUpperCase() : user.is_admin ? "ADMIN" : "STUDENT"}
            </span>
            <Link
              href="/admin/roles"
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            >
              Manage Role →
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Enrolled {formatDate(user.created_at)}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">
              ID: {user.id}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <AdminUserModerationTrigger user={user} />
        </div>
      </div>

      {/* Stats Grid */}
      <AdminStagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-4 space-y-1.5 hover:border-white/[0.12] transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Study Time</span>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{formatDuration(user.total_study_time_seconds)}</p>
            <p className="text-xs text-zinc-500 font-mono">{user.study_sessions_count} logged sessions</p>
          </div>
        </AdminMotionItem>

        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-4 space-y-1.5 hover:border-white/[0.12] transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Mastered</span>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{user.topics_mastered_count}</p>
            <p className="text-xs text-zinc-500 font-mono">syllabi topics</p>
          </div>
        </AdminMotionItem>

        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-4 space-y-1.5 hover:border-white/[0.12] transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">In Progress</span>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{user.topics_in_progress_count}</p>
            <p className="text-xs text-zinc-500 font-mono">active chapters</p>
          </div>
        </AdminMotionItem>

        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-4 space-y-1.5 hover:border-white/[0.12] transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Target Exam</span>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{user.target_exam || "Not Set"}</p>
            <p className="text-xs text-zinc-500 font-mono">{user.target_year ? `Class of ${user.target_year}` : "General Track"}</p>
          </div>
        </AdminMotionItem>
      </AdminStagger>

      {/* User Telemetry & Product Intelligence Section */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/90 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)] space-y-5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#78A9FF]" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Product Intelligence & Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Audit-Logged Access
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Pseudonymous telemetry strictly separated from account records. Never shared with third parties.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Pseudonym:</span>
            <span className="text-[#78A9FF] font-semibold">{telemetry.userPseudonym}</span>
          </div>
        </div>

        {/* Telemetry Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
              Active Engagement
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {formatDuration(telemetry.totalEngagementSeconds)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Paused on idle / tab blur</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
              Browser Sessions
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {telemetry.totalSessions}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Distinct browser visits</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
              Activity Window
            </span>
            <span className="text-xs font-semibold text-zinc-200 block truncate">
              {formatDateTime(telemetry.lastSeen)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">
              First: {formatDate(telemetry.firstSeen)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
              Client Health
            </span>
            <div className="flex items-center gap-1.5">
              {telemetry.errorsEncountered === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400 font-mono">0 Errors</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {telemetry.errorsEncountered} Errors
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Browser runtime alerts</span>
          </div>
        </div>

        {/* Breakdown & Recent Stream Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Top Features Breakdown */}
          <div className="lg:col-span-5 space-y-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Top Features & Workflows
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">By Engagement Time</span>
            </div>

            {telemetry.topFeatures.length > 0 ? (
              <div className="space-y-2.5">
                {telemetry.topFeatures.slice(0, 5).map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium truncate">{f.feature}</span>
                      <span className="font-mono text-[#78A9FF] text-[11px]">
                        {formatDuration(f.durationSeconds)} ({f.count} hits)
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-[#78A9FF] rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (f.durationSeconds / (telemetry.totalEngagementSeconds || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">No feature engagement logged yet.</p>
            )}
          </div>

          {/* Recent Consented Activity Stream */}
          <div className="lg:col-span-7 space-y-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Recent Consented Activity Stream</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Last 10 Events</span>
            </div>

            {telemetry.recentActivity.length > 0 ? (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                {telemetry.recentActivity.slice(0, 10).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 uppercase">
                        {evt.type}
                      </span>
                      <span className="font-mono text-zinc-300 truncate text-[11px]">
                        {evt.path}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">
                No activity stream available for this student.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Study Sessions</h2>
          <span className="text-xs text-zinc-500 font-mono">Latest Activity</span>
        </div>

        {user.recent_sessions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            No study sessions recorded for this student yet.
          </div>
        ) : (
          <AdminStagger className="divide-y divide-white/[0.04]">
            {user.recent_sessions.map((session) => (
              <AdminMotionItem key={session.id} variant="fadeUp">
                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors duration-150">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {formatDuration(session.duration_seconds)} focused study
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {formatDateTime(session.started_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.chapter_id && (
                      <p className="text-xs text-zinc-400 font-medium truncate max-w-[240px]">
                        Chapter: {session.chapter_id}
                      </p>
                    )}
                    {session.topic_id && (
                      <p className="text-[11px] text-zinc-500 truncate max-w-[240px] font-mono">
                        Topic: {session.topic_id}
                      </p>
                    )}
                  </div>
                </div>
              </AdminMotionItem>
            ))}
          </AdminStagger>
        )}
      </div>
    </div>
  );
}
