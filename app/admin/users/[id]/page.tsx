import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/features/admin/services/admin-users.service";
import { ArrowLeft, Mail, Calendar, Clock, BookOpen, Target, Activity } from "lucide-react";
import { AdminUserModerationTrigger } from "@/features/admin/components/admin-user-moderation-trigger";
import {
  AdminStagger,
  AdminMotionItem,
} from "@/features/admin/components/admin-motion-wrapper";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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
            {user.is_admin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                Security Admin
              </span>
            )}
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
