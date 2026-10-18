"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConcertMode } from "../context/concert-mode-context";
import {
  useConcertAudio,
  TrackItem,
  DEFAULT_TRACKS,
} from "../hooks/use-concert-audio";
import { SpectrumCanvas } from "./spectrum-canvas";
import { ConcertStageLights } from "./concert-stage-lights";
import { ConcertSpotlights } from "./concert-spotlights";
import { ConcertControls } from "./concert-controls";
import { TrackSelectorDrawer } from "./track-selector-drawer";
import { VisualThemeId, VISUAL_THEMES } from "../types/themes";
import { usePerformance } from "@/lib/performance-context";
import { useSettings } from "@/providers/settings-provider";
import {
  getAllTracksFromDB,
  saveTrackToDB,
  deleteTrackFromDB,
} from "../services/track-storage";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  if (target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")) {
    return true;
  }
  return false;
}

export function ConcertModal() {
  const { isOpen, closeConcert } = useConcertMode();
  const { settings, updateSetting } = useSettings();
  const [reducedMotion, setReducedMotion] = useState(false);
  const currentThemeId = (settings.activeTheme as VisualThemeId) || "obsidian";
  const [tracks, setTracks] = useState<TrackItem[]>(DEFAULT_TRACKS);
  const [activeTrack, setActiveTrack] = useState<TrackItem | null>(DEFAULT_TRACKS[0]);
  const [isTrackDrawerOpen, setIsTrackDrawerOpen] = useState(false);

  // Keep track of active Blob URLs so we can revoke them cleanly
  const activeBlobUrlsRef = useRef<Map<string, string>>(new Map());

  // Last non-zero volume ref for mute toggle
  const lastNonZeroVolumeRef = useRef<number>(0.85);

  // Listen for prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load custom tracks from IndexedDB when Concert Mode mounts
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getAllTracksFromDB()
      .then((stored) => {
        if (!isMounted) return;
        const loadedCustomTracks: TrackItem[] = stored.map((item) => {
          let url = activeBlobUrlsRef.current.get(item.id);
          if (!url) {
            url = URL.createObjectURL(item.blob);
            activeBlobUrlsRef.current.set(item.id, url);
          }
          return {
            id: item.id,
            name: item.name,
            artist: item.artist,
            url,
            isCustom: true,
          };
        });

        setTracks([...DEFAULT_TRACKS, ...loadedCustomTracks]);
      })
      .catch((err) => console.error("Error loading tracks from IndexedDB:", err));

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean up object URLs when Concert Mode closes
  useEffect(() => {
    if (!isOpen) {
      activeBlobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      activeBlobUrlsRef.current.clear();
      setIsTrackDrawerOpen(false);
    }
  }, [isOpen]);

  // Handle uploading user tracks
  const handleUploadFile = useCallback(async (file: File) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const trackName = file.name.replace(/\.[^/.]+$/, "");
    const blob = new Blob([file], { type: file.type || "audio/mpeg" });

    await saveTrackToDB({
      id,
      name: trackName,
      artist: "Local User Upload",
      blob,
      size: file.size,
      type: file.type,
      dateAdded: Date.now(),
    });

    const url = URL.createObjectURL(blob);
    activeBlobUrlsRef.current.set(id, url);

    const newTrack: TrackItem = {
      id,
      name: trackName,
      artist: "Local User Upload",
      url,
      isCustom: true,
    };

    setTracks((prev) => [...prev, newTrack]);
    setActiveTrack(newTrack);
  }, []);

  // Handle deleting custom track
  const handleDeleteTrack = useCallback(async (trackId: string) => {
    await deleteTrackFromDB(trackId);
    const url = activeBlobUrlsRef.current.get(trackId);
    if (url) {
      URL.revokeObjectURL(url);
      activeBlobUrlsRef.current.delete(trackId);
    }

    setTracks((prev) => {
      return prev.filter((t) => t.id !== trackId);
    });

    setActiveTrack((current) => {
      if (current?.id === trackId) {
        return DEFAULT_TRACKS[0];
      }
      return current;
    });
  }, []);

  // Audio Hook
  const {
    isPlaying,
    volume,
    currentTime,
    duration,
    needsUserGesture,
    setVolume,
    togglePlay,
    seek,
    getFrequencySnapshot,
  } = useConcertAudio(isOpen, activeTrack);

  // Update last non-zero volume ref
  useEffect(() => {
    if (volume > 0) {
      lastNonZeroVolumeRef.current = volume;
    }
  }, [volume]);

  // Playlist navigation indices & bounds
  const currentTrackIndex = tracks.findIndex((t) => t.id === activeTrack?.id);
  const hasNextTrack = currentTrackIndex >= 0 && currentTrackIndex < tracks.length - 1;
  const hasPrevTrack = currentTrackIndex > 0;

  const handleNextTrack = useCallback(() => {
    if (hasNextTrack) {
      setActiveTrack(tracks[currentTrackIndex + 1]);
    }
  }, [hasNextTrack, tracks, currentTrackIndex]);

  const handlePrevTrack = useCallback(() => {
    if (hasPrevTrack) {
      setActiveTrack(tracks[currentTrackIndex - 1]);
    }
  }, [hasPrevTrack, tracks, currentTrackIndex]);

  // Full playlist keyboard shortcuts:
  // - N -> Next song
  // - P -> Previous song
  // - Shift + Right -> Next song
  // - Shift + Left -> Previous song
  // - Left / Right -> Seek backward/forward 5s
  // - Space -> Play/Pause
  // - M -> Mute/Unmute
  // - Up / Down -> Adjust volume (+- 5%)
  // - Escape -> Close drawer or exit Concert Mode
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input, textarea, or contenteditable
      if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) {
        return;
      }

      // 1. Escape: Close Drawer or Exit Concert
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (isTrackDrawerOpen) {
          setIsTrackDrawerOpen(false);
        } else {
          closeConcert();
        }
        return;
      }

      // 2. Space: Toggle Play/Pause
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        return;
      }

      // 3. M: Toggle Mute/Unmute
      if (e.key === "m" || e.key === "M") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          if (volume > 0) {
            setVolume(0);
          } else {
            setVolume(lastNonZeroVolumeRef.current || 0.85);
          }
          return;
        }
      }

      // 4. N: Next song (without modifier)
      if (e.key === "n" || e.key === "N") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          handleNextTrack();
          return;
        }
      }

      // 5. P: Previous song (without modifier)
      if (e.key === "p" || e.key === "P") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          handlePrevTrack();
          return;
        }
      }

      // 6. Shift + Right: Next song
      if (e.key === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleNextTrack();
        return;
      }

      // 7. Shift + Left: Previous song
      if (e.key === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handlePrevTrack();
        return;
      }

      // 8. ArrowRight: Seek forward 5 seconds
      if (e.key === "ArrowRight" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const target = Math.min(duration, currentTime + 5);
        seek(target);
        return;
      }

      // 9. ArrowLeft: Seek backward 5 seconds
      if (e.key === "ArrowLeft" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const target = Math.max(0, currentTime - 5);
        seek(target);
        return;
      }

      // 10. ArrowUp: Increase volume
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setVolume(Math.min(1, volume + 0.05));
        return;
      }

      // 11. ArrowDown: Decrease volume
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setVolume(Math.max(0, volume - 0.05));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    isTrackDrawerOpen,
    closeConcert,
    togglePlay,
    volume,
    setVolume,
    currentTime,
    duration,
    seek,
    handleNextTrack,
    handlePrevTrack,
  ]);

  const { concertVisualComplexity } = usePerformance();
  const effectiveReducedMotion = reducedMotion || !concertVisualComplexity;
  const currentTheme = VISUAL_THEMES[currentThemeId] || VISUAL_THEMES.obsidian;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="concert-stage-viewport"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] overflow-hidden select-none"
          style={{ backgroundColor: currentTheme.bgBase }}
        >
          {/* Cinematic EDM stage spotlights shining down and slowly sweeping across the background */}
          <ConcertSpotlights
            theme={currentTheme}
            reducedMotion={effectiveReducedMotion}
          />

          {/* Independent ambient floating starlight particles */}
          <ConcertStageLights
            getFrequencySnapshot={getFrequencySnapshot}
            isPlaying={isPlaying}
            reducedMotion={effectiveReducedMotion}
            theme={currentTheme}
          />

          {/* Real Audio FFT frequency spectrum visualizer, particles & waveform */}
          <SpectrumCanvas
            getFrequencySnapshot={getFrequencySnapshot}
            isPlaying={isPlaying}
            reducedMotion={effectiveReducedMotion}
            theme={currentTheme}
          />

          {/* Controls, scrub bar, volume, theme picker, playlist buttons, and close button */}
          <ConcertControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            volume={volume}
            onVolumeChange={setVolume}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            onClose={closeConcert}
            needsUserGesture={needsUserGesture}
            activeTrack={activeTrack}
            onOpenTrackSelector={() => setIsTrackDrawerOpen(true)}
            currentTheme={currentTheme}
            onSelectTheme={(id) => updateSetting("activeTheme", id)}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
            hasNextTrack={hasNextTrack}
            hasPrevTrack={hasPrevTrack}
          />

          {/* Modal Drawer for Song Selection & Local Upload */}
          <TrackSelectorDrawer
            tracks={tracks}
            activeTrackId={activeTrack?.id || ""}
            onSelectTrack={(t) => {
              setActiveTrack(t);
              setIsTrackDrawerOpen(false);
            }}
            onUploadFile={handleUploadFile}
            onDeleteTrack={handleDeleteTrack}
            theme={currentTheme}
            isOpen={isTrackDrawerOpen}
            onClose={() => setIsTrackDrawerOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
