"use client";

import React, { useRef, useEffect, useState } from "react";
import { FixedPortal } from "@/components/ui/fixed-portal";

/**
 * AmbientBackground — Unified cinematic ambient video background for public & auth routes.
 *
 * Layering (bottom to top):
 *   1. Solid dark base (#030712)
 *   2. Deep space radial gradient atmosphere
 *   3. Ambient video loop (jee-pro-ambient-loop-9s-unlimited-fps.webm)
 *   4. Micro-star grid mesh overlay
 *   5. Peripheral vignette
 *
 * Scoping:
 *   - Used across public landing, marketing (/pricing, /about), and auth (/login, /signup, etc.)
 *   - NEVER mounted on authenticated routes (/dashboard, /study, etc.)
 *   - Zero JS animation loops or requestAnimationFrame overhead
 */
export function AmbientBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly guarantee muted on the DOM node for strict browser autoplay policies
    video.defaultMuted = true;
    video.muted = true;

    // Respect prefers-reduced-motion: pause the video, show static fallback
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPref = () => {
      if (motionQuery.matches) {
        video.pause();
      } else {
        // Attempt autoplay — browsers may block it, which is fine (static fallback shows)
        video.play().catch(() => {
          // Autoplay blocked — not an error, static fallback remains visible
        });
      }
    };

    applyMotionPref();
    motionQuery.addEventListener("change", applyMotionPref);

    return () => {
      motionQuery.removeEventListener("change", applyMotionPref);
    };
  }, [videoFailed]);

  return (
    <FixedPortal>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030712] select-none transform-gpu"
        style={{ contain: "paint layout" }}
      >
        {/* 1. Deep Space Base Atmosphere (always visible — serves as static fallback) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-10%,#0c142e_0%,#030712_70%,#010309_100%)]" />

        {/* 2. Ambient Video Loop (compositor-friendly media layer) */}
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

        {/* 3. Micro-Star Grid Mesh (GPU Hardware Texture) */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />

        {/* 4. Peripheral Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.65)_100%)] pointer-events-none" />
      </div>
    </FixedPortal>
  );
}

// Backward-compatible alias for existing imports
export { AmbientBackground as LandingBackground };
