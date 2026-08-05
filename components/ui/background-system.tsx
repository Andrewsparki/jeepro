"use client";

import { useEffect, useState } from "react";
import { usePerformance } from "@/lib/performance-context";

export function BackgroundSystem() {
  const [mounted, setMounted] = useState(false);
  const { enableBackgroundAnimation } = usePerformance();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-background -z-50" />;

  // Battery saver: static gradient only
  if (!enableBackgroundAnimation) {
    return (
      <div className="fixed inset-0 -z-50 bg-background">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255,255,255,0.05), transparent),radial-gradient(ellipse 60% 80% at 80% 100%, rgba(255,255,255,0.03), transparent)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-background">
      <style>{`
        @keyframes mesh-drift {
          0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
          25% { transform: translate(2%, -3%) rotate(1deg); }
          50% { transform: translate(-1%, 2%) rotate(-1deg); }
          75% { transform: translate(3%, 1%) rotate(0.5deg); }
        }
        @keyframes mesh-drift-alt {
          0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
          25% { transform: translate(-3%, 2%) rotate(-1deg); }
          50% { transform: translate(2%, -1%) rotate(1deg); }
          75% { transform: translate(-1%, -2%) rotate(-0.5deg); }
        }
      `}</style>

      {/* Layer 1: Primary ambient glow — deep, intentional, soft cyan/white mix */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.05), transparent), radial-gradient(ellipse 70% 60% at 80% 110%, rgba(255,255,255,0.02), transparent)",
          animation: "mesh-drift 60s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />

      {/* Layer 2: Secondary anchor glow — static to provide grounded lighting */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 10% 90%, rgba(37,99,235,0.04), transparent)",
        }}
      />

      {/* Layer 3: Vignette — dark edges for depth focus */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10,10,10,0.8) 100%)",
        }}
      />

      {/* Layer 4: Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
