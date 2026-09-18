import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { AdminPageTransition } from "@/features/admin/components/admin-motion-wrapper";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 select-none">
      <AdminPageTransition className="text-center max-w-md">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <ShieldOff className="w-8 h-8 text-rose-400" />
          <span className="absolute inset-0 rounded-2xl bg-rose-500/10 animate-ping opacity-40" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          You do not possess the required security authorizations to access the JEE Pro Command Center.
          This perimeter is strictly reserved for authenticated administrators.
        </p>
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15] active:scale-95 transition-all duration-200 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:-translate-x-1 group-hover:text-amber-400 transition-all" />
          <span>Return to Dashboard</span>
        </Link>
      </AdminPageTransition>
    </div>
  );
}
