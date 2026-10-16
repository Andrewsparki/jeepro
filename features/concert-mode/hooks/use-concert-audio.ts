"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TrackItem {
  id: string;
  name: string;
  artist: string;
  url: string; // either static /audio/ or blob URL
  isCustom?: boolean;
}

export const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: "default-miguel-phonk",
    name: "Miguel Phonk ft. Matadora",
    artist: "Ultra Slowed // Live Arena Phonk",
    url: "/audio/miguel-phonk-matadora.m4a",
    isCustom: false,
  },
];

export interface AudioFrequencySnapshot {
  freqArray: Uint8Array | null;
  timeArray: Uint8Array | null; // Waveform data
  bass: number;       // 0 - 1
  mid: number;        // 0 - 1
  treble: number;     // 0 - 1
  overall: number;    // 0 - 1
  waveformPeak: number; // 0 - 1
}

export function useConcertAudio(
  isActive: boolean,
  activeTrack: TrackItem | null
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolumeState] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // Audio nodes and refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const freqArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Performance: Throttle time updates to ~4 times per second instead of every audio frame
  const lastTimeUpdateRef = useRef<number>(0);

  // Audio frequency snapshot caching to prevent redundant garbage collection
  const snapshotRef = useRef<AudioFrequencySnapshot>({
    freqArray: null,
    timeArray: null,
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
    waveformPeak: 0,
  });

  // Helper to safely tear down current audio
  const cleanupCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    sourceRef.current = null;
    gainNodeRef.current = null;
    freqArrayRef.current = null;
    timeArrayRef.current = null;
    setIsPlaying(false);
    setIsLoaded(false);
    setCurrentTime(0);
    setDuration(0);
    setNeedsUserGesture(false);
  }, []);

  // Initialize audio when activeTrack or isActive changes
  useEffect(() => {
    if (!isActive || !activeTrack) {
      cleanupCurrentAudio();
      return;
    }

    const audio = new Audio();
    audio.src = activeTrack.url;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.loop = true;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoaded(true);
    };

    // Throttle React state updates from audio timeupdate (reduces re-renders by ~80%)
    const handleTimeUpdate = () => {
      const now = performance.now();
      if (now - lastTimeUpdateRef.current > 250) {
        lastTimeUpdateRef.current = now;
        setCurrentTime(audio.currentTime || 0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // Setup Web Audio API Context
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      // Optimal FFT size: 256 yields 128 frequency bins, which is light on CPU
      // while retaining tight bass responsiveness and instant audio reaction
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78; // Tighter, snappy attack without sluggish decay
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      freqArrayRef.current = new Uint8Array(bufferLength);
      timeArrayRef.current = new Uint8Array(bufferLength);

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;

      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;

      // Connect: source -> analyser -> gainNode -> destination
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Attempt immediate playback
      const startPlayback = async () => {
        try {
          if (ctx.state === "suspended") {
            await ctx.resume();
          }
          await audio.play();
          setIsPlaying(true);
          setNeedsUserGesture(false);
        } catch {
          setNeedsUserGesture(true);
          setIsPlaying(false);
        }
      };

      startPlayback();
    } catch {
      audio.play().then(() => setIsPlaying(true)).catch(() => setNeedsUserGesture(true));
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isActive, activeTrack?.id, activeTrack?.url]);

  // Volume control
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    }
  }, []);

  // Play / Pause toggle
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setNeedsUserGesture(false);
      } catch (err) {
        console.error("Audio play failed:", err);
      }
    }
  }, [isPlaying]);

  // Seek control
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Frame ticker to extract live FFT frequencies and time-domain waveform
  const getFrequencySnapshot = useCallback((): AudioFrequencySnapshot => {
    const analyser = analyserRef.current;
    const freqArray = freqArrayRef.current;
    const timeArray = timeArrayRef.current;
    const snap = snapshotRef.current;

    if (!analyser || !freqArray || !timeArray || !isPlaying) {
      snap.freqArray = null;
      snap.timeArray = null;
      snap.bass = 0;
      snap.mid = 0;
      snap.treble = 0;
      snap.overall = 0;
      snap.waveformPeak = 0;
      return snap;
    }

    analyser.getByteFrequencyData(freqArray);
    analyser.getByteTimeDomainData(timeArray);

    // With fftSize = 256, bufferLength = 128
    // Bass: bins 0 - 6 (~0 to ~1000Hz)
    // Mid: bins 7 - 35 (~1000 to ~6000Hz)
    // Treble: bins 36 - 110 (~6000 to ~19000Hz)
    let bassSum = 0;
    const bassCount = 7;
    for (let i = 0; i < bassCount; i++) {
      bassSum += freqArray[i];
    }
    const bass = bassSum / (bassCount * 255);

    let midSum = 0;
    const midCount = 29;
    for (let i = 7; i < 36; i++) {
      midSum += freqArray[i];
    }
    const mid = midSum / (midCount * 255);

    let trebleSum = 0;
    const trebleCount = 75;
    for (let i = 36; i < 111; i++) {
      trebleSum += freqArray[i];
    }
    const treble = trebleSum / (trebleCount * 255);

    const overall = bass * 0.5 + mid * 0.3 + treble * 0.2;

    // Fast peak sampling
    let peakDiff = 0;
    const step = 4; // Sub-sample waveform for speed
    for (let i = 0; i < timeArray.length; i += step) {
      const diff = Math.abs(timeArray[i] - 128);
      if (diff > peakDiff) peakDiff = diff;
    }
    const waveformPeak = peakDiff / 128;

    snap.freqArray = freqArray;
    snap.timeArray = timeArray;
    snap.bass = bass;
    snap.mid = mid;
    snap.treble = treble;
    snap.overall = overall;
    snap.waveformPeak = waveformPeak;

    return snap;
  }, [isPlaying]);

  return {
    isPlaying,
    isLoaded,
    volume,
    currentTime,
    duration,
    needsUserGesture,
    setVolume,
    togglePlay,
    seek,
    getFrequencySnapshot,
  };
}
