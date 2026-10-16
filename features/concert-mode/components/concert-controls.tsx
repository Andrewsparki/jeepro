"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  X,
  Radio,
  Disc3,
  Music2,
  Palette,
  Check,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { TrackItem } from "../hooks/use-concert-audio";
import { ThemeConfig, VisualThemeId, VISUAL_THEMES } from "../types/themes";

interface ConcertControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onClose: () => void;
  needsUserGesture: boolean;
  activeTrack: TrackItem | null;
  onOpenTrackSelector: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: VisualThemeId) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  hasNextTrack: boolean;
  hasPrevTrack: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function ConcertControls({
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  currentTime,
  duration,
  onSeek,
  onClose,
  needsUserGesture,
  activeTrack,
  onOpenTrackSelector,
  currentTheme,
  onSelectTheme,
  onNextTrack,
  onPrevTrack,
  hasNextTrack,
  hasPrevTrack,
}: ConcertControlsProps) {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Top Bar: Live Concert Badge + Actions + Close Button */}
      <div className="absolute top-0 inset-x-0 p-6 md:p-8 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121722]/80 border border-[#2B3342] backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: currentTheme.primaryAccent }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: currentTheme.primaryAccent }}
              />
            </span>
            <span className="text-xs font-mono tracking-wider uppercase text-[#F5F7FB] font-medium flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" style={{ color: currentTheme.primaryAccent }} />
              Concert Mode
            </span>
          </div>

          {/* Theme Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121722]/80 hover:bg-[#171D28] border border-[#2B3342] hover:border-[#78A9FF]/40 backdrop-blur-md text-xs font-medium text-[#F5F7FB] transition-all shadow-md active:scale-95"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.primaryAccent }} />
              <span>{currentTheme.name}</span>
            </button>

            {/* Theme Picker Popover */}
            {showThemePicker && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-[#121722]/95 border border-[#2B3342] rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#A4ADBB] px-2 py-1">
                  Stage Atmosphere
                </p>
                <div className="space-y-1 mt-1">
                  {Object.values(VISUAL_THEMES).map((th) => {
                    const isSelected = th.id === currentTheme.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => {
                          onSelectTheme(th.id);
                          setShowThemePicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#171D28] text-[#F5F7FB]"
                            : "text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-[#171D28]/60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: th.primaryAccent }}
                          />
                          <span>{th.name}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5" style={{ color: th.primaryAccent }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Change Song Button */}
          <button
            onClick={onOpenTrackSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121722]/80 hover:bg-[#171D28] border border-[#2B3342] hover:border-[#78A9FF]/40 backdrop-blur-md text-xs font-medium text-[#F5F7FB] transition-all shadow-md active:scale-95"
          >
            <Music2 className="w-3.5 h-3.5" style={{ color: currentTheme.primaryAccent }} />
            <span>Select Song</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Exit Concert Mode (Esc)"
          className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#121722]/80 hover:bg-[#171D28] border border-[#2B3342] hover:border-[#78A9FF]/50 text-[#A4ADBB] hover:text-[#F5F7FB] transition-all duration-200 backdrop-blur-md shadow-xl hover:shadow-[0_0_20px_rgba(120,169,255,0.25)] active:scale-95"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          <span className="sr-only">Exit (Esc)</span>
        </button>
      </div>

      {/* Hero Track Identity (Center Floating) */}
      <div className="absolute top-20 md:top-24 inset-x-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20">
        <div className="relative mb-3">
          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#121722] via-[#171D28] to-[#2B3342] border flex items-center justify-center shadow-2xl transition-all duration-500 ${
              isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
            }`}
            style={{
              borderColor: `${currentTheme.primaryAccent}66`,
              boxShadow: `0 0 35px ${currentTheme.primaryAccent}33`,
            }}
          >
            <Disc3 className="w-8 h-8" style={{ color: currentTheme.primaryAccent }} />
          </div>
          {isPlaying && (
            <div
              className="absolute -inset-1 rounded-full border animate-ping pointer-events-none opacity-40"
              style={{ borderColor: currentTheme.primaryAccent }}
            />
          )}
        </div>

        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[#F5F7FB] drop-shadow-md max-w-xl truncate px-4">
          {activeTrack ? activeTrack.name : "Miguel Phonk ft. Matadora"}
        </h1>
        <p
          className="text-xs md:text-sm font-medium tracking-wide mt-1 uppercase font-mono transition-colors duration-500 max-w-lg truncate px-4"
          style={{ color: currentTheme.primaryAccent }}
        >
          {activeTrack ? activeTrack.artist : "Ultra Slowed // Live Arena Phonk"}
        </p>
      </div>

      {/* Autoplay Blocker Overlay CTA if needed */}
      {needsUserGesture && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm pointer-events-auto">
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-3 px-8 py-4 rounded-full text-[#0B0D12] font-semibold text-base shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: currentTheme.primaryAccent,
              boxShadow: `0 0 40px ${currentTheme.primaryAccent}88`,
            }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Ignite Concert</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-6 md:bottom-8 inset-x-0 flex justify-center px-4 z-30 pointer-events-auto">
        <div className="w-full max-w-2xl bg-[#121722]/90 border border-[#2B3342] backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-3">
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#A4ADBB] w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="relative flex-1 h-2 bg-[#171D28] rounded-full cursor-pointer group overflow-hidden border border-[#2B3342]/60"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                onSeek(pos * duration);
              }}
            >
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-75 group-hover:brightness-110"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${currentTheme.secondaryAccent}, ${currentTheme.primaryAccent})`,
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#A4ADBB] w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Row: Volume, Playback with Prev/Next, Song Selector, Exit */}
          <div className="flex items-center justify-between pt-1">
            {/* Left: Volume Slider */}
            <div className="flex items-center gap-2 w-32 sm:w-36">
              <button
                onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
                className="text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors p-1"
                aria-label={volume === 0 ? "Unmute (M)" : "Mute (M)"}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 md:w-24 h-1.5 bg-[#171D28] rounded-lg appearance-none cursor-pointer border border-[#2B3342]/40"
                style={{ accentColor: currentTheme.primaryAccent }}
              />
            </div>

            {/* Center: Previous Track, Play / Pause, Next Track */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Previous Track Button */}
              <button
                onClick={onPrevTrack}
                disabled={!hasPrevTrack}
                aria-label="Previous Track (P / Shift+Left)"
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${
                  hasPrevTrack
                    ? "bg-[#171D28] hover:bg-[#2B3342] text-[#A4ADBB] hover:text-[#F5F7FB] border-[#2B3342] active:scale-95"
                    : "opacity-40 cursor-not-allowed text-[#A4ADBB] border-transparent"
                }`}
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={onTogglePlay}
                className="flex items-center justify-center w-12 h-12 rounded-full text-[#0B0D12] shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: currentTheme.primaryAccent,
                  boxShadow: `0 0 25px ${currentTheme.primaryAccent}66`,
                }}
                aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track Button */}
              <button
                onClick={onNextTrack}
                disabled={!hasNextTrack}
                aria-label="Next Track (N / Shift+Right)"
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${
                  hasNextTrack
                    ? "bg-[#171D28] hover:bg-[#2B3342] text-[#A4ADBB] hover:text-[#F5F7FB] border-[#2B3342] active:scale-95"
                    : "opacity-40 cursor-not-allowed text-[#A4ADBB] border-transparent"
                }`}
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Right: Select Song & Exit Shortcuts */}
            <div className="flex items-center justify-end gap-2 w-32 sm:w-36">
              <button
                onClick={onOpenTrackSelector}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D28] hover:bg-[#2B3342]/60 border border-[#2B3342] text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-all"
              >
                <Music2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Songs</span>
              </button>
              <button
                onClick={onClose}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#171D28] hover:bg-[#2B3342]/60 border border-[#2B3342] text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-all"
              >
                <kbd className="px-1 text-[10px] font-mono bg-[#0B0D12] border border-[#2B3342] rounded text-[#A4ADBB]">
                  ESC
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
