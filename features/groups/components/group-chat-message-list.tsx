"use client";

import { useEffect, useRef } from "react";
import { GroupMessage, GroupRole } from "../types/groups.types";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupChatMessageListProps {
  messages: GroupMessage[];
  currentUserId: string;
  currentUserRole: GroupRole | null;
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  onDeleteMessage: (messageId: string) => Promise<boolean>;
}

export function GroupChatMessageList({
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  isLoadingOlder,
  hasMore,
  onLoadOlder,
  onDeleteMessage,
}: GroupChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef(messages.length);

  // Auto scroll to bottom when new messages arrive (if near bottom)
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [isLoading, messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs">Loading study group chat...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Welcome to the Study Group Chat</h4>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          Start the conversation! Discuss problems, share insights, and keep each other accountable.
        </p>
      </div>
    );
  }

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Load Older Trigger */}
      {hasMore && (
        <div className="flex justify-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadOlder}
            disabled={isLoadingOlder}
            className="text-[11px] h-7 text-muted-foreground hover:text-foreground"
          >
            {isLoadingOlder ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            Load older messages
          </Button>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => {
        const isSelf = msg.sender_id === currentUserId;
        const sender = msg.sender;
        const senderName = isSelf ? "You" : sender?.full_name || "Aspirant";
        const initials = senderName.charAt(0).toUpperCase();
        const canDelete = isSelf || canManage;

        const timeString = new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id}
            className={cn("group flex items-start gap-2.5 max-w-[85%]", isSelf ? "ml-auto flex-row-reverse" : "mr-auto")}
          >
            <div className="h-7 w-7 rounded-full overflow-hidden border border-border/60 shrink-0 mt-0.5 bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
              {sender?.avatar_url ? (
                <img src={sender.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className={cn("flex flex-col", isSelf ? "items-end" : "items-start")}>
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-foreground/90">
                  {senderName}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {timeString}
                </span>
              </div>

              <div className="relative group/msg flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words shadow-sm",
                    isSelf
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-muted/70 text-foreground border border-border/40 rounded-tl-xs"
                  )}
                >
                  {msg.content}
                </div>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(msg.id)}
                    className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 text-muted-foreground/50 hover:text-destructive rounded"
                    title="Delete message"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
