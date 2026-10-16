"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Music,
  Trash2,
  Check,
  Disc,
  Play,
  FileAudio,
  Plus,
} from "lucide-react";
import { TrackItem } from "../hooks/use-concert-audio";
import { ThemeConfig } from "../types/themes";

interface TrackSelectorDrawerProps {
  tracks: TrackItem[];
  activeTrackId: string;
  onSelectTrack: (track: TrackItem) => void;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteTrack?: (trackId: string) => void;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function TrackSelectorDrawer({
  tracks,
  activeTrackId,
  onSelectTrack,
  onUploadFile,
  onDeleteTrack,
  theme,
  isOpen,
  onClose,
}: TrackSelectorDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setIsUploading(true);
      await onUploadFile(file);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)) {
      try {
        setIsUploading(true);
        await onUploadFile(file);
      } catch (err) {
        console.error("Drop upload error:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
      <div
        className="relative w-full max-w-lg bg-[#121722]/95 border border-[#2B3342] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: `0 0 50px ${theme.primaryAccent}22`,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2B3342]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0B0D12]"
              style={{ backgroundColor: theme.primaryAccent }}
            >
              <Music className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FB]">Concert Playlist</h3>
              <p className="text-xs text-[#A4ADBB]">Select or upload audio tracks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#171D28] hover:bg-[#2B3342] text-xs text-[#A4ADBB] hover:text-[#F5F7FB] transition-colors border border-[#2B3342]"
          >
            Done
          </button>
        </div>

        {/* Upload Zone */}
        <div className="p-4 border-b border-[#2B3342]/60">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/m4a,audio/x-m4a,audio/aac,audio/*,.mp3,.wav,.m4a"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-[#78A9FF] bg-[#78A9FF]/10 scale-[1.01]"
                : "border-[#2B3342] hover:border-[#78A9FF]/50 bg-[#171D28]/50 hover:bg-[#171D28]"
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${theme.primaryAccent}20`,
                color: theme.primaryAccent,
              }}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#F5F7FB]">
                {isUploading ? "Storing track in local IndexedDB..." : "Upload your own song"}
              </p>
              <p className="text-[11px] text-[#A4ADBB] mt-0.5">
                MP3, WAV, or M4A • Stored locally in your browser
              </p>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {tracks.map((track) => {
            const isActive = track.id === activeTrackId;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                  isActive
                    ? "bg-[#171D28] border-opacity-100 shadow-md"
                    : "bg-[#171D28]/40 hover:bg-[#171D28] border-[#2B3342]/60 hover:border-[#2B3342]"
                }`}
                style={{
                  borderColor: isActive ? theme.primaryAccent : undefined,
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "text-[#0B0D12]" : "text-[#78A9FF] bg-[#121722]"
                    }`}
                    style={{
                      backgroundColor: isActive ? theme.primaryAccent : undefined,
                    }}
                  >
                    {isActive ? (
                      <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                    ) : (
                      <FileAudio className="w-4 h-4 text-[#A4ADBB] group-hover:text-[#F5F7FB]" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#F5F7FB] truncate">
                      {track.name}
                    </p>
                    <p className="text-[11px] text-[#A4ADBB] truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActive && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-mono rounded font-medium"
                      style={{
                        backgroundColor: `${theme.primaryAccent}22`,
                        color: theme.primaryAccent,
                      }}
                    >
                      PLAYING
                    </span>
                  )}
                  {track.isCustom && onDeleteTrack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrack(track.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-[#A4ADBB] hover:text-rose-400 transition-all"
                      title="Remove custom track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
