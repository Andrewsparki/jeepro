"use client";

export type SoundType =
  | "click"
  | "toggleOn"
  | "toggleOff"
  | "success"
  | "danger"
  | "pop"
  | "soft-tap"
  | "swish"
  | "liquid-glass"
  | "pop-up"
  | "pop-down"
  | "chime"
  | "celebration"
  | "xp-up"
  | "muted-error"
  | "tick"
  | "nav-drop"
  | "notification"
  | "message-sent"
  | "message-received";

export function playHapticSound(type: SoundType = "click", enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case "toggleOn": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case "toggleOff": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case "success": {
        // C-Major triad chord cascade (C5, E5, G5)
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.05;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.3, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.15);
        });
        break;
      }

      case "danger": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case "pop": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "soft-tap": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.02);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
        break;
      }

      case "tick": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }

      case "liquid-glass":
      case "swish": {
        // Pristine Liquid-Glass Drop Acoustic Effect
        // 1. Primary Liquid Droplet Pitch Glide
        const oscBody = ctx.createOscillator();
        const gainBody = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        oscBody.type = "sine";
        // Smooth hydrostatic pitch sweep from ~650Hz to ~1450Hz
        oscBody.frequency.setValueAtTime(650, now);
        oscBody.frequency.exponentialRampToValueAtTime(1450, now + 0.045);

        // Hydrodynamic resonant lowpass filter
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2600, now);
        filter.Q.setValueAtTime(2.5, now);

        gainBody.gain.setValueAtTime(0, now);
        gainBody.gain.linearRampToValueAtTime(0.18, now + 0.003);
        gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        oscBody.connect(filter);
        filter.connect(gainBody);
        gainBody.connect(ctx.destination);
        oscBody.start(now);
        oscBody.stop(now + 0.045);

        // 2. High Crystal Glass Overlap Ring
        const oscGlass = ctx.createOscillator();
        const gainGlass = ctx.createGain();

        oscGlass.type = "sine";
        // Shimmering glass harmonic frequency ~2800Hz gliding to ~3600Hz
        oscGlass.frequency.setValueAtTime(2800, now);
        oscGlass.frequency.exponentialRampToValueAtTime(3600, now + 0.035);

        gainGlass.gain.setValueAtTime(0, now);
        gainGlass.gain.linearRampToValueAtTime(0.035, now + 0.002);
        gainGlass.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        oscGlass.connect(gainGlass);
        gainGlass.connect(ctx.destination);
        oscGlass.start(now);
        oscGlass.stop(now + 0.035);

        break;
      }

      case "nav-drop": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        // Fast sweep up in frequency like a water droplet
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "pop-up": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "pop-down": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "chime": {
        const freqs = [523.25, 880]; // C5, A5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.03;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.25, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.3);
        });
        break;
      }

      case "celebration": {
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.08;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.3, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.4);
        });
        break;
      }

      case "xp-up": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case "muted-error": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "notification": {
        // Pristine glass-bell chime (A5: 880Hz -> D6: 1174.66Hz -> A6: 1760Hz)
        // With crystalline harmonic overtones and warm acoustic decay
        const notes = [
          { freq: 880.0, offset: 0, gain: 0.25, decay: 0.35 },
          { freq: 1174.66, offset: 0.07, gain: 0.28, decay: 0.4 },
          { freq: 1760.0, offset: 0.14, gain: 0.32, decay: 0.55 },
        ];

        notes.forEach(({ freq, offset, gain: noteGain, decay }) => {
          const noteTime = now + offset;

          // Pure sine fundamental
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gainNode.gain.setValueAtTime(0.0001, noteTime);
          gainNode.gain.linearRampToValueAtTime(noteGain, noteTime + 0.008);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + decay);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + decay);

          // Subtle crystal overtone (bell shimmer at 2.01x freq)
          const overtone = ctx.createOscillator();
          const overtoneGain = ctx.createGain();
          overtone.type = "sine";
          overtone.frequency.setValueAtTime(freq * 2.01, noteTime);

          overtoneGain.gain.setValueAtTime(0.0001, noteTime);
          overtoneGain.gain.linearRampToValueAtTime(noteGain * 0.22, noteTime + 0.005);
          overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + decay * 0.45);

          overtone.connect(overtoneGain);
          overtoneGain.connect(ctx.destination);
          overtone.start(noteTime);
          overtone.stop(noteTime + decay * 0.45);
        });
        break;
      }

      case "message-sent": {
        // Social App Tactile "Swoosh-Pop" (480Hz -> 1080Hz glide with soft glass resonance)
        const oscBody = ctx.createOscillator();
        const gainBody = ctx.createGain();
        oscBody.type = "sine";
        oscBody.frequency.setValueAtTime(480, now);
        oscBody.frequency.exponentialRampToValueAtTime(1080, now + 0.065);

        gainBody.gain.setValueAtTime(0, now);
        gainBody.gain.linearRampToValueAtTime(0.24, now + 0.005);
        gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

        oscBody.connect(gainBody);
        gainBody.connect(ctx.destination);
        oscBody.start(now);
        oscBody.stop(now + 0.065);

        // High crystal glass over-shimmer
        const oscGlass = ctx.createOscillator();
        const gainGlass = ctx.createGain();
        oscGlass.type = "sine";
        oscGlass.frequency.setValueAtTime(2200, now);
        oscGlass.frequency.exponentialRampToValueAtTime(3200, now + 0.05);

        gainGlass.gain.setValueAtTime(0, now);
        gainGlass.gain.linearRampToValueAtTime(0.04, now + 0.002);
        gainGlass.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        oscGlass.connect(gainGlass);
        gainGlass.connect(ctx.destination);
        oscGlass.start(now);
        oscGlass.stop(now + 0.05);
        break;
      }

      case "message-received": {
        // JEE Pro Custom Social Message Received Chime (F5: 698.46Hz -> A5: 880Hz -> C6: 1046.50Hz)
        const notes = [
          { freq: 698.46, offset: 0, gain: 0.22, decay: 0.25 },
          { freq: 880.0, offset: 0.05, gain: 0.26, decay: 0.3 },
          { freq: 1046.5, offset: 0.1, gain: 0.3, decay: 0.4 },
        ];

        notes.forEach(({ freq, offset, gain: noteGain, decay }) => {
          const noteTime = now + offset;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);

          gainNode.gain.setValueAtTime(0.0001, noteTime);
          gainNode.gain.linearRampToValueAtTime(noteGain, noteTime + 0.006);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + decay);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + decay);
        });
        break;
      }
    }
  } catch {
    // Ignore autoplay restriction errors
  }
}
