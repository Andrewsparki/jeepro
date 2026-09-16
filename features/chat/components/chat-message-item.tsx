"use client";

import React from "react";
import { ChatMessage } from "../types/chat.types";
import { cn } from "@/lib/utils";
import { MoreVertical, Trash2, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  isGrouped: boolean;
  onDelete: (id: string) => void;
  onReport: (message: ChatMessage) => void;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatMessageItem({
  message,
  isCurrentUser,
  isGrouped,
  onDelete,
  onReport,
}: ChatMessageItemProps) {
  const senderName = message.sender?.full_name || "JEE Aspirant";
  const initial = senderName.charAt(0).toUpperCase();
  const timeStr = formatTime(message.created_at);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2.5 px-3 sm:px-4 transition-colors",
        isGrouped ? "mt-1" : "mt-3.5",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (visible only when not grouped) */}
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        {!isGrouped ? (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border",
              isCurrentUser
                ? "bg-accent text-accent-foreground border-accent/40"
                : "bg-surface text-foreground border-border/40"
            )}
          >
            {message.sender?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.sender.avatar_url}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Message Content Container */}
      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-[75%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Header with Name & Timestamp (only when not grouped) */}
        {!isGrouped && (
          <div
            className={cn(
              "flex items-center gap-2 mb-1 px-1",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span className="text-xs font-semibold text-foreground/90 truncate max-w-[140px] sm:max-w-[200px]">
              {isCurrentUser ? "You" : senderName}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              {timeStr}
            </span>
          </div>
        )}

        {/* Message Bubble + Action Button wrapper */}
        <div
          className={cn(
            "relative flex items-center group/bubble",
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm transition-all",
              isCurrentUser
                ? "bg-accent text-accent-foreground rounded-tr-sm selection:bg-white/20"
                : "bg-surface hover:bg-surface-hover text-foreground border border-border/40 rounded-tl-sm selection:bg-accent/30"
            )}
          >
            {message.content}
          </div>

          {/* Action Trigger (Dropdown Menu) */}
          <div
            className={cn(
              "opacity-0 group-hover/bubble:opacity-100 focus-within:opacity-100 transition-opacity px-1",
              isCurrentUser ? "mr-0.5" : "ml-0.5"
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors outline-none"
                  aria-label="Message options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isCurrentUser ? "end" : "start"}
                className="w-36 rounded-xl bg-background/95 backdrop-blur-xl border-border/50 text-xs shadow-xl"
              >
                {isCurrentUser ? (
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onReport(message)}
                    className="flex items-center gap-2 text-muted-foreground focus:text-foreground cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-warning" />
                    <span>Report</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
