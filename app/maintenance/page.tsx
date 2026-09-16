"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Clock, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceData {
  enabled: boolean;
  message: string;
  expected_return_time: string | null;
}

/**
 * Safely parses expected return time.
 * Handles ISO dates, local datetime strings, standard date strings, and arbitrary text phrases.
 * Prevents NaN results under all conditions.
 */
function parseReturnTime(input: string | null | undefined): {
  isTimestamp: boolean;
  targetTimestamp: number | null;
  formattedText: string | null;
} {
  if (!input || !input.trim()) {
    return { isTimestamp: false, targetTimestamp: null, formattedText: null };
  }

  const raw = input.trim();
  const parsed = Date.parse(raw);

  if (!isNaN(parsed)) {
    return { isTimestamp: true, targetTimestamp: parsed, formattedText: raw };
  }

  // Not a valid parseable date, return as custom text label
  return { isTimestamp: false, targetTimestamp: null, formattedText: raw };
}

export default function MaintenancePage() {
  const router = useRouter();
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/maintenance", { cache: "no-store" });
      if (res.ok) {
        const json: MaintenanceData = await res.json();
        setData(json);

        // If maintenance is turned off, redirect back to home / dashboard
        if (!json.enabled) {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Failed to check maintenance status:", err);
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/maintenance", { cache: "no-store" });
        if (res.ok && !ignore) {
          const json: MaintenanceData = await res.json();
          setData(json);
          if (!json.enabled) {
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Failed to fetch maintenance status:", err);
      }
    }
    init();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [checkStatus, router]);

  // Tick clock every second for countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Safely parse return time information
  const returnInfo = parseReturnTime(data?.expected_return_time);

  // Compute countdown metrics without NaN or negative values
  let countdown = null;
  if (returnInfo.isTimestamp && returnInfo.targetTimestamp !== null) {
    const diff = returnInfo.targetTimestamp - now;
    const clampedDiff = Math.max(0, diff);

    const hours = Math.floor(clampedDiff / (1000 * 60 * 60));
    const minutes = Math.floor((clampedDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((clampedDiff % (1000 * 60)) / 1000);

    // Ensure no NaN values occur under any circumstance
    const safeHours = isNaN(hours) ? 0 : hours;
    const safeMinutes = isNaN(minutes) ? 0 : minutes;
    const safeSeconds = isNaN(seconds) ? 0 : seconds;

    countdown = {
      hours: safeHours,
      minutes: safeMinutes,
      seconds: safeSeconds,
      isPast: diff <= 0,
    };
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/20 selection:text-amber-300">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none -z-10 blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.4) 0%, rgba(217,119,6,0.1) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none -z-10 blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Luminous System Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-8">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
            System Maintenance In Progress
          </span>
        </div>

        {/* Icon & Brand Title */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <Wrench className="w-9 h-9 text-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          We&apos;ll be back shortly
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          {data?.message ||
            "JEE Pro is undergoing scheduled infrastructure upgrades to provide a faster, more reliable prep experience."}
        </p>

        {/* Return Time Card */}
        <div className="w-full p-5 mb-8 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Estimated Return</span>
          </div>

          {countdown !== null ? (
            countdown.isPast ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-400">
                  Returning any moment now
                </p>
                <p className="text-xs text-zinc-500">
                  Final maintenance checks in progress
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {String(countdown.hours).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Hours</p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {String(countdown.minutes).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Mins</p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {String(countdown.seconds).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Secs</p>
                </div>
              </div>
            )
          ) : returnInfo.formattedText ? (
            <p className="text-sm font-medium text-zinc-300 font-mono">
              {returnInfo.formattedText}
            </p>
          ) : (
            <p className="text-xs font-medium text-zinc-500 italic">
              Return time not specified
            </p>
          )}
        </div>

        {/* Status Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={checkStatus}
            disabled={checking}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/10 px-5 py-2 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Check Status"}
          </Button>
        </div>

        {/* Brand footer watermark */}
        <div className="mt-16 text-xs text-zinc-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>JEE Pro Advanced Examination Platform</span>
        </div>
      </div>
    </main>
  );
}
