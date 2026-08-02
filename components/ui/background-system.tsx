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
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#020617]">
      <style>{`
        @keyframes bg-drift {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 100%; }
          50% { background-position: 0% 100%; }
          75% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }

        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20%, -20%) scale(1.2); }
          66% { transform: translate(-20%, 20%) scale(0.8); }
        }

        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30%, 20%) scale(0.9); }
          66% { transform: translate(10%, -30%) scale(1.3); }
        }

        @keyframes aurora-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes aurora-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        .animate-bg-drift {
          animation: bg-drift 40s linear infinite;
        }

        .animate-blob-1 {
          animation: blob-float-1 25s ease-in-out infinite;
        }

        .animate-blob-2 {
          animation: blob-float-2 30s ease-in-out infinite;
        }

        .animate-aurora-spin {
          animation: aurora-spin 60s linear infinite;
        }

        .animate-aurora-reverse {
          animation: aurora-spin-reverse 75s linear infinite;
        }
      `}</style>

      {/* Layer 1: Deep navy to black gradient */}
      <div
        className="absolute inset-0 opacity-50 animate-bg-drift"
        style={{
          background: "radial-gradient(circle at center, #0f172a 0%, transparent 50%)",
          backgroundSize: "200% 200%",
          willChange: "background-position",
        }}
      />

      {/* Layer 2: Blurred blue/cyan/purple blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-10 animate-blob-1"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0.25) 40%, rgba(56,189,248,0) 100%)",
          willChange: "transform",
        }}
      />

      <div
        className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] rounded-full mix-blend-screen opacity-10 animate-blob-2"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(168,85,247,0.25) 40%, rgba(168,85,247,0) 100%)",
          willChange: "transform",
        }}
      />

      {/* Layer 3: Aurora ribbons */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen">
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400 to-transparent w-[150%] h-[150%] -left-1/4 -top-1/4 origin-center animate-aurora-spin"
          style={{ willChange: "transform" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-400 to-transparent w-[150%] h-[150%] -left-1/4 -top-1/4 origin-center animate-aurora-reverse"
          style={{ willChange: "transform" }}
        />
      </div>

      {/* Layer 4: CSS Film Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
