import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { COOKIE_DECLARATIONS } from "@/features/privacy/types/cookie-consent.types";
import { ShieldCheck, Lock, EyeOff, Server, HardDrive, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Principles & Cookie Policy | JEE Pro",
  description: "Learn how JEE Pro safeguards student privacy: zero third-party ads, strictly transparent authentication cookies, and opt-in analytics.",
});

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4 sm:px-6 space-y-12 text-[#F5F7FB]">
      {/* Hero */}
      <div className="space-y-4 text-center sm:text-left border-b border-[#2B3342] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/30 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero Surveillance Guarantee
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Privacy Principles &amp; Cookie Declarations
        </h1>
        <p className="text-sm sm:text-base text-[#A4ADBB] max-w-2xl leading-relaxed">
          JEE Pro is an engineering study operating system. We respect your focus and do not sell data, deploy behavioral ad pixels, or capture private information.
        </p>
      </div>

      {/* Core Privacy Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#5DC98B]/15 text-[#5DC98B] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">No Advertising Trackers</h3>
          <p className="text-xs text-[#A4ADBB] leading-relaxed">
            We never integrate third-party ad networks, social tracking beacons, or cross-site profiling scripts.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#78A9FF]/15 text-[#78A9FF] flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">Zero Keystroke / Chat Logging</h3>
          <p className="text-xs text-[#A4ADBB] leading-relaxed">
            We never monitor your typing, search inputs, passwords, formula notes, or personal conversation logs.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#2B3342] bg-[#121722]/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#A8C5FF]/15 text-[#A8C5FF] flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">Data Ownership &amp; Export</h3>
          <p className="text-xs text-[#A4ADBB] leading-relaxed">
            Your study sessions and syllabus checklist belong to you. Export your complete archive or reset progress anytime.
          </p>
        </div>
      </div>

      {/* Actual Cookie Declaration Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Declared Cookies &amp; Local Storage</h2>
          <p className="text-xs text-[#A4ADBB] mt-1">
            Below is the comprehensive list of first-party technologies stored on your browser:
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#2B3342] bg-[#121722]/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2B3342] bg-[#171D28]/80 text-[#A4ADBB] font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Cookie / Key</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3342]/50 font-sans">
              {COOKIE_DECLARATIONS.map((c) => (
                <tr key={c.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#78A9FF] font-semibold">{c.name}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] border border-white/[0.1]">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#F5F7FB]/90 leading-relaxed max-w-sm">{c.purpose}</td>
                  <td className="py-3 px-4 font-mono text-[#A4ADBB] text-[11px]">{c.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to manage preferences */}
      <div className="p-6 rounded-2xl border border-[#78A9FF]/30 bg-[#78A9FF]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#F5F7FB]">Change or Withdraw Your Consent</h3>
          <p className="text-xs text-[#A4ADBB] mt-0.5">
            You can modify or revoke your analytics consent at any time in your Account Settings.
          </p>
        </div>
        <Link
          href="/dashboard/settings?tab=privacy"
          className="px-4 py-2 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-xs"
        >
          Manage Cookie Preferences
        </Link>
      </div>
    </div>
  );
}
