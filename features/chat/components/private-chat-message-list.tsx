"use client";

import React, { useRef, useEffect, UIEvent } from "react";
import Link from "next/link";
import { PrivateMessage, DirectUser } from "../types/private-chat.types";
import {
  ArrowDown,
  MessageSquare,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Trash2,
  Lock,
  Users,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubSmoothScroll } from "@/components/ui/sub-smooth-scroll";
import { isModerationError, extractModerationReason } from "../utils/moderation";

interface PrivateChatMessageListProps {
  messages: PrivateMessage[];
  otherUser: DirectUser | null;
  friendshipStatus: "accepted" | "pending" | "none" | "blocked";
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasMore: boolean;
  error: string | null;
  currentUserId?: string;
  unreadCountBelow: number;
  onLoadOlder: () => void;
  onDeleteMessage: (id: string) => void;
  setNearBottom: (isNear: boolean) => void;
  onRetry: () => void;
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

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function PrivateChatMessageList({
  messages,
  otherUser,
  friendshipStatus,
  isLoading,
  isLoadingOlder,
  hasMore,
  error,
  currentUserId,
  unreadCountBelow,
  onLoadOlder,
  onDeleteMessage,
  setNearBottom,
  onRetry,
}: PrivateChatMessageListProps) {
  const { containerRef, contentRef, resize: resizeScroll } = useSubSmoothScroll<HTMLDivElement>({
    overscroll: true,
  });
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDoneRef = useRef(false);
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    resizeScroll();
  }, [messages.length, resizeScroll]);

  const scrollToBottom = (smooth = true) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // 1. Initial scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialScrollDoneRef.current) {
      scrollToBottom(false);
      isInitialScrollDoneRef.current = true;
    }
  }, [isLoading, messages.length]);

  // 2. Adjust scroll offset after loading older messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isLoadingOlder) return;
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

  // 3. Scroll proximity detection
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    setNearBottom(distanceToBottom < 80);
  };

  // 4. Pin to bottom on incoming message if already near bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceToBottom < 100) {
      scrollToBottom(true);
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 space-y-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Opening secure private conversation...
        </p>
      </div>
    );
  }

  if (error) {
    if (isModerationError(error)) {
      const reason = extractModerationReason(error);

      return (
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">
              Direct Messaging Restricted
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your direct messaging access has been restricted by an administrator.
            </p>
          </div>

          {reason && (
            <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                Reason for Restriction
              </span>
              <p className="text-xs font-medium text-foreground leading-relaxed break-words">
                {reason}
              </p>
            </div>
          )}
        </div>
      );
    }

    const isFriendshipError =
      error.toLowerCase().includes("friend") ||
      error.toLowerCase().includes("unauthorized");

    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center max-w-sm mx-auto space-y-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isFriendshipError
              ? "bg-accent/15 text-accent"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {isFriendshipError ? (
            <Users className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          {isFriendshipError
            ? "Connect as Friends to Chat"
            : "Conversation Unavailable"}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>

        {isFriendshipError ? (
          <Link href="/friends">
            <Button
              size="sm"
              className="mt-2 text-xs bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
            >
              View Friends
            </Button>
          </Link>
        ) : onRetry ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 mt-2 text-xs rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        ) : null}
      </div>
    );
  }

  const initial = (otherUser?.full_name || "S").charAt(0).toUpperCase();

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Friendship status notice if not currently accepted */}
      {friendshipStatus !== "accepted" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-300 shrink-0">
          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            You are not currently friends with this student. Conversation
            history is read-only.
          </span>
        </div>
      )}

      {/* Internal Scrollable Message Stream with Locomotive Inertia */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-lenis-prevent="true"
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 overscroll-contain"
        role="log"
        aria-live="polite"
      >
        <div ref={contentRef} className="space-y-3">
          {/* Load Older Messages */}
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
                  Loading older messages...
                </>
              ) : (
                "Load older messages"
              )}
            </Button>
          </div>
        )}

        {/* Empty Conversation State */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center py-16 text-center max-w-sm mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Direct Conversation
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is the beginning of your private direct conversation with{" "}
              <span className="font-semibold text-foreground">
                {otherUser?.full_name || "your study partner"}
              </span>
              . Messages are secure and private between the two of you.
            </p>
          </div>
        )}

        {/* Chronological Messages Stream */}
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const showDayLabel =
            index === 0 ||
            getDayLabel(messages[index - 1].created_at) !==
              getDayLabel(message.created_at);

          return (
            <React.Fragment key={message.id}>
              {showDayLabel && (
                <div className="flex items-center justify-center my-3">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-medium bg-muted/40 border border-border/40 text-muted-foreground">
                    {getDayLabel(message.created_at)}
                  </span>
                </div>
              )}

              <div
                className={`group flex items-end gap-2 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Other user avatar (only for incoming messages) */}
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 mb-1">
                    {otherUser?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={otherUser.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-all ${
                    isOwn
                      ? "bg-accent/20 border border-accent/30 text-foreground rounded-br-sm"
                      : "bg-surface border border-border/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  {/* Message Content */}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>

                  {/* Timestamp & Status */}
                  <div
                    className={`flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{formatTime(message.created_at)}</span>
                  </div>

                  {/* Delete Button for Own Message */}
                  {isOwn && (
                    <button
                      onClick={() => onDeleteMessage(message.id)}
                      className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-background/90 border border-border/60 hover:text-destructive text-muted-foreground rounded-full p-1 shadow-sm"
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        <div ref={bottomAnchorRef} className="h-1" />
        </div>
      </div>

      {/* Floating Unread Scroll-to-Bottom Button */}
      {unreadCountBelow > 0 && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            size="sm"
            onClick={() => scrollToBottom(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg rounded-full px-3.5 py-1.5 h-8 text-xs font-semibold gap-1.5 animate-bounce"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>
              {unreadCountBelow} new message{unreadCountBelow > 1 ? "s" : ""}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
