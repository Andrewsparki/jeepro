"use client";

import React from "react";

export function LandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030712] select-none transform-gpu"
      style={{ contain: "strict" }}
    >
      {/* 1. Deep Space Base Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-10%,#0c142e_0%,#030712_70%,#010309_100%)]" />

      {/* 2. Micro-Star Grid Mesh (Tactile depth without blend mode lag) */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 30%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 30%, black 40%, transparent 85%)",
        }}
      />

      {/* 3. Luminous Volumetric Ambient Halos (GPU Native Alpha Shaders - 0 Reflow / 0 Blending Lag) */}
      
      {/* Top Hero Radiant Cyan / Sapphire Nova */}
      <div 
        className="absolute -top-[12%] left-[15%] h-[750px] w-[750px] rounded-full blur-[90px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.38) 0%, rgba(99,102,241,0.20) 40%, transparent 70%)",
        }}
      />

      {/* Hero Secondary Magenta / Violet Beam */}
      <div 
        className="absolute -top-[5%] right-[10%] h-[600px] w-[600px] rounded-full blur-[80px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(217,70,239,0.26) 0%, rgba(124,58,237,0.16) 45%, transparent 70%)",
        }}
      />

      {/* Subjects Section: Emerald & Cyan Light */}
      <div 
        className="absolute top-[28%] left-[-10%] h-[800px] w-[800px] rounded-full blur-[95px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(16,185,129,0.14) 45%, transparent 70%)",
        }}
      />

      {/* Subjects & Progress: Deep Purple Nebula */}
      <div 
        className="absolute top-[38%] right-[-5%] h-[850px] w-[850px] rounded-full blur-[100px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.30) 0%, rgba(236,72,153,0.14) 50%, transparent 70%)",
        }}
      />

      {/* Bento Features Section: Radiant Azure Pool */}
      <div 
        className="absolute top-[62%] left-[20%] h-[900px] w-[900px] rounded-full blur-[100px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.24) 0%, rgba(99,102,241,0.16) 45%, transparent 70%)",
        }}
      />

      {/* Focus & CTA Section: Ultraviolet Flame */}
      <div 
        className="absolute bottom-[-8%] left-[25%] h-[800px] w-[800px] rounded-full blur-[90px] transform-gpu pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.30) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)",
        }}
      />

      {/* 4. Peripheral Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,7,18,0.6)_100%)] pointer-events-none" />
    </div>
  );
}
