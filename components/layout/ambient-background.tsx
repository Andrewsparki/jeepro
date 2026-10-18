"use client";

import React from "react";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { FloatingParticles } from "@/components/ui/floating-particles";

export interface AmbientBackgroundProps {
  /**
   * "obsidian": Restrained, zero-video, high-contrast dark graphite canvas (Apple/Linear grade).
   * "default": Maintained for backwards compatibility, uses Obsidian atmospheric canvas.
   */
  variant?: "default" | "obsidian";
}

/**
 * AmbientBackground — Atmospheric background canvas for public routes.
 *
 * - Zero video decode overhead or battery drain
 * - Restrained neutral graphite & obsidian surfaces (#0B0D12 / #06080E)
 * - Compositor-only CSS radial lighting, micro-grid texture, and lightweight floating particles
 */
export function AmbientBackground({ variant = "obsidian" }: AmbientBackgroundProps) {
  const isDefaultVariant = variant === "default";

  return (
    <FixedPortal>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0D12] select-none transform-gpu"
        style={{ contain: "paint layout" }}
      >
        {/* 1. Neutral Obsidian & Subtle Electric Blue Atmospheric Gradients */}
        <div
          className={
            isDefaultVariant
              ? "absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-10%,#121722_0%,#0B0D12_70%,#06070A_100%)]"
              : "absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(120,169,255,0.035)_0%,rgba(11,13,18,0.95)_60%,#0B0D12_100%)]"
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(168,197,255,0.02)_0%,transparent_70%)]" />

        {/* 2. Microscopic Floating Particles Canvas */}
        <FloatingParticles zIndexClass="z-0" />

        {/* 3. Micro-Grid Dot Texture (Clean GPU Canvas) */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 247, 251, 0.6) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* 4. Subtle Peripheral Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(11,13,18,0.85)_100%)] pointer-events-none" />
      </div>
    </FixedPortal>
  );
}

export { AmbientBackground as LandingBackground };
