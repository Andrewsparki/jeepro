import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-6">
          You don&apos;t have permission to access the admin control center.
          This area is restricted to authorized administrators only.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
