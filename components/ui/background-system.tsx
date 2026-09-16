"use client";

import { useEffect, useState } from "react";

export function BackgroundSystem() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-background -z-50" />;

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-background">
      {/* Primary ambient glow — static */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.05), transparent), radial-gradient(ellipse 70% 60% at 80% 110%, rgba(255,255,255,0.02), transparent)",
        }}
      />

      {/* Secondary anchor glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 10% 90%, rgba(37,99,235,0.04), transparent)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10,10,10,0.8) 100%)",
        }}
      />
    </div>
  );
}
