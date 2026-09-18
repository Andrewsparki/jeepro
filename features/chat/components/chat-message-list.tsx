"use client";

import React, { useRef, useEffect, UIEvent } from "react";
import { ChatMessage, ChatSender } from "../types/chat.types";
import { ChatMessageItem } from "./chat-message-item";
import { ArrowDown, MessageSquare, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubSmoothScroll } from "@/components/ui/sub-smooth-scroll";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasMore: boolean;
  error: string | null;
  currentUserId?: string;
  isAdmin?: boolean;
  unreadCountBelow: number;
  onLoadOlder: () => void;
  onDeleteMessage: (id: string) => void;
  onReportMessage: (message: ChatMessage) => void;
  onAdminModerateUser?: (sender: ChatSender) => void;
  onRefresh: () => void;
  setNearBottom: (isNear: boolean) => void;
}

function getDayLabel(isoString: string): string {
  try {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

export function ChatMessageList({
  messages,
  isLoading,
  isLoadingOlder,
  hasMore,
  error,
  currentUserId,
  isAdmin = false,
  unreadCountBelow,
  onLoadOlder,
  onDeleteMessage,
  onReportMessage,
  onAdminModerateUser,
  onRefresh,
  setNearBottom,
}: ChatMessageListProps) {
  const { containerRef, contentRef, resize: resizeScroll } = useSubSmoothScroll<HTMLDivElement>({
    overscroll: true,
  });
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDoneRef = useRef(false);
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    resizeScroll();
  }, [messages.length, resizeScroll]);

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // 1. Initial scroll to bottom once messages finish loading
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialScrollDoneRef.current) {
      scrollToBottom(false);
      isInitialScrollDoneRef.current = true;
    }
  }, [isLoading, messages.length]);

  // 2. Adjust scroll position after prepending older messages so user doesn't jump
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isLoadingOlder) return;

    // Capture height before update
    prevScrollHeightRef.current = container.scrollHeight;
  }, [isLoadingOlder]);

  useEffect(() => {
    const container = containerRef.current;
    if (container && prevScrollHeightRef.current > 0) {
      const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
      if (heightDiff > 0) {
        container.scrollTop += heightDiff;
      }
      prevScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // 3. Detect scroll proximity to bottom
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const isNear = distanceToBottom < 80;
    setNearBottom(isNear);
  };

  // 4. If a message is sent or received and user is near bottom, keep pinned to bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceToBottom < 100) {
      scrollToBottom(true);
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 space-y-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Connecting to Global Chat...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Failed to Load Chat</h2>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2 mt-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center max-w-sm mx-auto space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shadow-sm">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Welcome to Global Chat</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect, discuss problem-solving techniques, and stay motivated alongside fellow JEE aspirants across India.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Scrollable Message Container with Dedicated Locomotive Inertia */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-lenis-prevent="true"
        className="flex-1 overflow-y-auto px-1 sm:px-2 py-4 overscroll-contain"
        role="log"
        aria-live="polite"
      >
        <div ref={contentRef} className="space-y-1">
          {/* Load Older History Button */}
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadOlder}
                disabled={isLoadingOlder}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-4 rounded-full border border-border/40 hover:bg-muted/30"
              >
                {isLoadingOlder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Loading history...
                  </>
                ) : (
                  "Load older messages"
                )}
              </Button>
            </div>
          )}

          {/* Message Stream with Day Dividers & Grouping */}
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;

            const currentDay = getDayLabel(message.created_at);
            const prevDay = prevMessage ? getDayLabel(prevMessage.created_at) : null;
            const isNewDay = currentDay !== prevDay;

            // Group consecutive messages from same sender within 5 minutes
            let isGrouped = false;
            if (prevMessage && !isNewDay && prevMessage.sender_id === message.sender_id) {
              const timeDiff =
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime();
              if (timeDiff < 5 * 60 * 1000) {
                isGrouped = true;
              }
            }

            return (
              <React.Fragment key={message.id}>
                {/* Day Divider */}
                {isNewDay && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-muted/40 text-muted-foreground border border-border/30 backdrop-blur-sm">
                      {currentDay}
                    </span>
                  </div>
                )}

                <ChatMessageItem
                  message={message}
                  isCurrentUser={message.sender_id === currentUserId}
                  isGrouped={isGrouped}
                  isAdmin={isAdmin}
                  onDelete={onDeleteMessage}
                  onReport={onReportMessage}
                  onAdminModerateUser={onAdminModerateUser}
                />
              </React.Fragment>
            );
          })}

          {/* Bottom anchor for scrolling */}
          <div ref={bottomAnchorRef} className="h-1" />
        </div>
      </div>

      {/* Floating "New Messages" Pill */}
      {unreadCountBelow > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium shadow-lg hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/15"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>
              {unreadCountBelow} new {unreadCountBelow === 1 ? "message" : "messages"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
