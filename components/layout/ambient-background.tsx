"use client";

import React, { useRef, useEffect, useState } from "react";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { FloatingParticles } from "@/components/ui/floating-particles";

export interface AmbientBackgroundProps {
  /**
   * "obsidian": Restrained, zero-video, high-contrast dark graphite canvas (Apple/Linear grade).
   * "default": Cinematic ambient video loop (legacy marketing/auth fallback).
   */
  variant?: "default" | "obsidian";
}

/**
 * AmbientBackground — Atmospheric background canvas for public routes.
 *
 * In "obsidian" mode:
 *   - Zero video decode overhead or battery drain
 *   - Restrained neutral graphite & obsidian surfaces (#06080E)
 *   - Compositor-only CSS radial lighting and micro-grid texture
 */
export function AmbientBackground({ variant = "obsidian" }: AmbientBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const isObsidian = variant === "obsidian";

  useEffect(() => {
    if (isObsidian) return;

    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPref = () => {
      if (motionQuery.matches) {
        video.pause();
      } else {
        video.play().catch(() => {
          // Autoplay blocked — static fallback shows
        });
      }
    };

    applyMotionPref();
    motionQuery.addEventListener("change", applyMotionPref);

    return () => {
      motionQuery.removeEventListener("change", applyMotionPref);
    };
  }, [videoFailed, isObsidian]);

  return (
    <FixedPortal>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0D12] select-none transform-gpu"
        style={{ contain: "paint layout" }}
      >
        {isObsidian ? (
          <>
            {/* 1. Neutral Obsidian & Subtle Electric Blue Atmospheric Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(120,169,255,0.035)_0%,rgba(11,13,18,0.95)_60%,#0B0D12_100%)]" />
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

            {/* 3. Subtle Peripheral Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(11,13,18,0.85)_100%)] pointer-events-none" />
          </>
        ) : (
          <>
            {/* Obsidian Base Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-10%,#121722_0%,#0B0D12_70%,#06070A_100%)]" />

            {/* Ambient Video Loop */}
            {!videoFailed && (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={() => setVideoFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              >
                <source
                  src="/videos/jee-pro-ambient-loop-9s-unlimited-fps.webm"
                  type="video/webm"
                />
              </video>
            )}

            {/* Micro-Star Grid Mesh */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
                backgroundSize: "36px 36px",
              }}
            />

            {/* Peripheral Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.65)_100%)] pointer-events-none" />
          </>
        )}
      </div>
    </FixedPortal>
  );
}

export { AmbientBackground as LandingBackground };
