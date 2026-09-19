"use client";

import { useEffect, useRef } from "react";
import { AmbientSound, useFocusStore } from "../store/focus-store";

const AMBIENT_AUDIO_SOURCES: Partial<Record<AmbientSound, string>> = {
  rain: "/sounds/ambience/rain.mp3",
  library: "/sounds/ambience/library.m4a",
  forest: "/sounds/ambience/forest.m4a",
  ocean: "/sounds/ambience/ocean.m4a",
};

/**
 * Procedural noise buffer generator using standard Web Audio API.
 * Provides authentic, continuous, non-repeating noise for deep focus.
 */
function createNoiseBuffer(ctx: AudioContext, type: "white" | "brown", durationSeconds = 5): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else {
    // Brown / Brownian / Red noise: integrated white noise with gain scaling
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
  }

  return buffer;
}

export function useAmbientSound(isMuted: boolean) {
  const { ambientSound, soundVolume } = useFocusStore();

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const effectiveVolume = isMuted ? 0 : Math.max(0, Math.min(1, soundVolume));
  const effectiveVolumeRef = useRef(effectiveVolume);

  // Keep volume ref up-to-date
  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  // 1. Sync volume changes smoothly without restarting playback
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = effectiveVolume;
    }
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = effectiveVolume * 0.35;
      gainNodeRef.current.gain.setValueAtTime(
        targetGain,
        audioContextRef.current.currentTime
      );
    }
  }, [effectiveVolume]);

  // 2. Manage sound source switching and playback lifecycle
  useEffect(() => {
    const stopAll = () => {
      // Stop HTML5 Audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
        audioElementRef.current.load();
        audioElementRef.current = null;
      }

      // Stop Web Audio noise source
      if (noiseSourceRef.current) {
        try {
          noiseSourceRef.current.stop();
          noiseSourceRef.current.disconnect();
        } catch {
          // Ignore if already stopped
        }
        noiseSourceRef.current = null;
      }

      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch {
          // Ignore
        }
        gainNodeRef.current = null;
      }
    };

    if (ambientSound === "none") {
      stopAll();
      return;
    }

    // A. File-based ambient audio (rain, library, forest, ocean)
    const audioUrl = AMBIENT_AUDIO_SOURCES[ambientSound];
    if (audioUrl) {
      stopAll();

      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = effectiveVolumeRef.current;

      audioElementRef.current = audio;

      audio.play().catch((err) => {
        // Autoplay policy restriction before user interaction
        console.warn(`[AmbientAudio] Autoplay blocked for ${ambientSound}:`, err.message);
      });

      return () => {
        stopAll();
      };
    }

    // B. Procedural Web Audio synthesized noise (white, brown)
    if (ambientSound === "white" || ambientSound === "brown") {
      stopAll();

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioCtx) {
          console.warn("[AmbientAudio] Web Audio API not supported in this browser.");
          return;
        }

        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        const buffer = createNoiseBuffer(ctx, ambientSound);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(effectiveVolumeRef.current * 0.35, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(0);

        noiseSourceRef.current = source;
        gainNodeRef.current = gainNode;
      } catch (err) {
        console.warn(`[AmbientAudio] Failed to initialize ${ambientSound} noise:`, err);
      }

      return () => {
        stopAll();
      };
    }

    return () => {
      stopAll();
    };
  }, [ambientSound]);

  // 3. Final unmount cleanup
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
        audioElementRef.current = null;
      }
      if (noiseSourceRef.current) {
        try {
          noiseSourceRef.current.stop();
          noiseSourceRef.current.disconnect();
        } catch {
          // Ignore
        }
        noiseSourceRef.current = null;
      }
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch {
          // Ignore
        }
        gainNodeRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    isAudioActive: ambientSound !== "none",
    ambientSound,
  };
}
