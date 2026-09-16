"use client";

import React, { useState } from "react";
import { Users, Globe, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { ChatPresenceUser, ChatSystemStatus } from "../types/chat.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onlineUsers: ChatPresenceUser[];
  onlineCount: number;
  chatStatus: ChatSystemStatus;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ChatHeader({
  onlineUsers,
  onlineCount,
  chatStatus,
  onRefresh,
  isLoading,
}: ChatHeaderProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <header className="border-b border-border/40 bg-card/60 backdrop-blur-xl px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20">
      {/* Title and Status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 shadow-sm text-accent">
          <Globe className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-base sm:text-lg tracking-tight truncate text-foreground">
              Global Chat
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-2.5 h-2.5" />
              Community
            </span>
          </div>

          {/* Presence Indicator */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group mt-0.5 outline-none cursor-pointer"
                title="Click to view online aspirants"
                aria-label={`${onlineCount} students currently online. Click to see members.`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {onlineCount} {onlineCount === 1 ? "aspirant" : "aspirants"} online
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-3 rounded-xl bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl"
              align="start"
              sideOffset={8}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  Active Aspirants
                </span>
                <span className="text-[11px] text-muted-foreground">{onlineCount}</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {onlineUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">You are currently active</p>
                ) : (
                  onlineUsers.map((u) => {
                    const initial = (u.full_name || "S").charAt(0).toUpperCase();
                    return (
                      <div key={u.user_id} className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-muted/30">
                        <div className="h-6 w-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            initial
                          )}
                        </div>
                        <span className="text-xs text-foreground truncate">{u.full_name || "JEE Aspirant"}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh messages"
          aria-label="Refresh messages"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-accent" : ""}`} />
        </Button>
      </div>

      {/* Disabled Banner */}
      {!chatStatus.enabled && (
        <div className="absolute top-full left-0 right-0 z-30 bg-destructive/15 border-b border-destructive/30 backdrop-blur-md px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {chatStatus.disabled_reason || "Global Chat has been temporarily paused by administrators."}
          </span>
        </div>
      )}
    </header>
  );
}
