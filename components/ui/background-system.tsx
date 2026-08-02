"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function BackgroundSystem() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-background -z-50" />;

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#020617]">
      {/* Layer 1: Deep navy to black gradient */}
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #0f172a 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #0f172a 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #0f172a 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #0f172a 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, #0f172a 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Layer 2: Blurred blue/cyan/purple blobs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-10 filter blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(56,189,248,0) 70%)" }}
        animate={{
          x: ["0%", "20%", "-20%", "0%"],
          y: ["0%", "-20%", "20%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] rounded-full mix-blend-screen opacity-10 filter blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0) 70%)" }}
        animate={{
          x: ["0%", "-30%", "10%", "0%"],
          y: ["0%", "20%", "-30%", "0%"],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3: Aurora ribbons */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400 to-transparent w-[200%] h-[200%] -left-1/2 -top-1/2 origin-center"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-400 to-transparent w-[200%] h-[200%] -left-1/2 -top-1/2 origin-center"
          animate={{
            rotate: [360, 0],
          }}
          transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
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
