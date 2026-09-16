import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/features/admin/services/admin-users.service";
import { ArrowLeft, Mail, Calendar, Clock, BookOpen, Target, Activity } from "lucide-react";

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
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center shrink-0">
          <span className="text-xl font-semibold text-zinc-400">
            {(user.full_name || user.email)?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {user.full_name || "Unnamed User"}
            </h1>
            {user.is_admin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Study Time</span>
          </div>
          <p className="text-lg font-bold text-white">{formatDuration(user.total_study_time_seconds)}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{user.study_sessions_count} sessions</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Mastered</span>
          </div>
          <p className="text-lg font-bold text-white">{user.topics_mastered_count}</p>
          <p className="text-xs text-zinc-500 mt-0.5">topics</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">In Progress</span>
          </div>
          <p className="text-lg font-bold text-white">{user.topics_in_progress_count}</p>
          <p className="text-xs text-zinc-500 mt-0.5">topics</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Target</span>
          </div>
          <p className="text-lg font-bold text-white">{user.target_exam || "—"}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{user.target_year || "Not set"}</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Recent Study Sessions</h2>
        </div>

        {user.recent_sessions.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            No study sessions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {user.recent_sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-zinc-300">
                    {formatDuration(session.duration_seconds)} session
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {formatDateTime(session.started_at)}
                  </p>
                </div>
                <div className="text-right">
                  {session.chapter_id && (
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                      Chapter: {session.chapter_id}
                    </p>
                  )}
                  {session.topic_id && (
                    <p className="text-xs text-zinc-600 truncate max-w-[200px]">
                      Topic: {session.topic_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
