"use client";

import { getGlobalSoundSettings } from "@/lib/sound-effects";

export type RecapAudioEffect =
  | "drone"
  | "introChime"
  | "statReveal"
  | "masterySwell"
  | "streakIgnite"
  | "achievementFanfare"
  | "unboxing"
  | "rewardCelebration"
  | "finaleHarmonics";

let recapAudioCtx: AudioContext | null = null;

function getRecapAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!recapAudioCtx) {
      recapAudioCtx = new AudioCtx();
    }
    if (recapAudioCtx.state === "suspended") {
      recapAudioCtx.resume().catch(() => {});
    }
    return recapAudioCtx;
  } catch {
    return null;
  }
}

/**
 * High-fidelity procedural audio synthesis tailored specifically for the cinematic Birthday Year Recap.
 * Uses harmonic overtones, warm lowpass envelopes, and arpeggios that match the premium visual tone.
 */
export function playRecapSound(effect: RecapAudioEffect, customGainMultiplier: number = 1.0) {
  const globalSettings = getGlobalSoundSettings();
  if (!globalSettings.enabled || globalSettings.volume <= 0) return;

  const ctx = getRecapAudioContext();
  if (!ctx) return;

  const masterVol = globalSettings.volume * customGainMultiplier;
  const now = ctx.currentTime;

  try {
    switch (effect) {
      case "drone": {
        // Warm cinematic root + fifth drone (Eb2 / Bb2 / Eb3 / G3 / C4)
        const frequencies = [77.78, 116.54, 155.56, 196.0, 261.63];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx === 0 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(350, now);
          filter.frequency.exponentialRampToValueAtTime(1400, now + 2.0);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.06 * masterVol, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 3.3);
        });
        break;
      }

      case "introChime": {
        // Sparkling cinematic entry chime
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.08;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.12 * masterVol, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 1.3);
        });
        break;
      }

      case "statReveal": {
        // Resonant metallic chime reveal
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(880, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18 * masterVol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }

      case "masterySwell": {
        // Ascending harmonic sweep representing knowledge crystallization
        const sweepOsc = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweepOsc.type = "sine";
        sweepOsc.frequency.setValueAtTime(329.63, now); // E4
        sweepOsc.frequency.exponentialRampToValueAtTime(659.25, now + 0.6); // E5

        sweepGain.gain.setValueAtTime(0.001, now);
        sweepGain.gain.linearRampToValueAtTime(0.15 * masterVol, now + 0.3);
        sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        sweepOsc.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweepOsc.start(now);
        sweepOsc.stop(now + 0.95);
        break;
      }

      case "streakIgnite": {
        // Energy ignition sound with warm sub-bass punch
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(110, now);
        subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.4);

        subGain.gain.setValueAtTime(0.25 * masterVol, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.4);

        // Rising harmonics
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmerOsc.type = "sawtooth";
        shimmerOsc.frequency.setValueAtTime(220, now);
        shimmerOsc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.35);

        shimmerGain.gain.setValueAtTime(0.001, now);
        shimmerGain.gain.linearRampToValueAtTime(0.1 * masterVol, now + 0.15);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        shimmerOsc.connect(filter);
        filter.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);

        shimmerOsc.start(now);
        shimmerOsc.stop(now + 0.5);
        break;
      }

      case "achievementFanfare": {
        // Grand victorious celebration arpeggio in Major triad
        const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        arpeggio.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.07;

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.16 * masterVol, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.75);
        });
        break;
      }

      case "unboxing": {
        // Deep sub impact
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(150, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.6);

        subGain.gain.setValueAtTime(0.35 * masterVol, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.65);
        break;
      }

      case "rewardCelebration": {
        // Lush multi-voice celebratory chord
        const chordNotes = [392.0, 493.88, 587.33, 783.99, 987.77]; // G major
        chordNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.04;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.14 * masterVol, noteTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 1.5);
        });
        break;
      }

      case "finaleHarmonics": {
        // Warm resolution cadence
        const finaleNotes = [261.63, 329.63, 392.0, 523.25];
        finaleNotes.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08 * masterVol, now + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.6);
        });
        break;
      }
    }
  } catch (err) {
    console.debug("[BirthdayAudio] Audio synthesis suppressed:", err);
  }
}
