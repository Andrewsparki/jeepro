"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FloatingParticles } from "@/components/ui/floating-particles";

export function BackgroundSystem() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-background -z-50" />;

  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-background">
      {/* Dynamic ambient floating particles canvas */}
      <FloatingParticles />

      {/* Dark mode glows & vignette (preserved 100% for dark themes) */}
      {!isLight && (
        <div className="absolute inset-0">
          {/* Primary ambient glow — static */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120,169,255,0.035), transparent), radial-gradient(ellipse 70% 60% at 80% 110%, rgba(245,247,251,0.015), transparent)",
            }}
          />

          {/* Secondary anchor glow */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: "radial-gradient(ellipse 50% 50% at 10% 90%, rgba(168,197,255,0.02), transparent)",
            }}
          />

          {/* Dark Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(11,13,18,0.85) 100%)",
            }}
          />
        </div>
      )}

      {/* Light mode refined architectural ambient mesh */}
      {isLight && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(120, 169, 255, 0.05), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(168, 197, 255, 0.03), transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: "radial-gradient(rgba(15, 23, 42, 0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>
      )}
    </div>
  );
}
