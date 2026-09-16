"use client";

import React from "react";
import Link from "next/link";
import { useDirectConversations } from "../hooks/use-direct-conversations";
import { MessageSquare, Users, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ConversationItem } from "../types/private-chat.types";

interface DirectConversationsListProps {
  onSelectUser?: (userId: string) => void;
  conversations?: ConversationItem[];
  isLoading?: boolean;
  error?: string | null;
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function DirectConversationsList({
  onSelectUser,
  conversations: propConversations,
  isLoading: propIsLoading,
  error: propError,
}: DirectConversationsListProps) {
  const hasParentData = propConversations !== undefined;
  const hookData = useDirectConversations(!hasParentData);

  const conversations = hasParentData ? propConversations : hookData.conversations;
  const isLoading = hasParentData ? (propIsLoading ?? false) : hookData.isLoading;
  const error = hasParentData ? (propError ?? null) : hookData.error;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-accent" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading direct conversations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shadow-sm">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            No Private Messages Yet
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Message your accepted study friends 1-on-1 to discuss complex
            problems, share revision tips, and collaborate.
          </p>
        </div>
        <Link href="/friends">
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold gap-1.5 rounded-xl h-9"
          >
            <Users className="w-4 h-4" />
            <span>Find Study Friends</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30 overflow-y-auto max-h-[calc(100dvh-12rem)]">
      {conversations.map((conv) => {
        const friend = conv.other_user;
        const initial = (friend.full_name || "S").charAt(0).toUpperCase();

        const content = (
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 hover:bg-surface/60 transition-colors cursor-pointer group">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center overflow-hidden shadow-sm">
                {friend.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={friend.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            </div>

            {/* Content preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                  {friend.full_name || "Study Partner"}
                </h4>
                {conv.last_message && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  {conv.last_message
                    ? conv.last_message.content
                    : "No messages yet"}
                </p>

                {conv.unread_count > 0 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground shadow-sm">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        );

        if (onSelectUser) {
          return (
            <div key={conv.id} onClick={() => onSelectUser(friend.id)}>
              {content}
            </div>
          );
        }

        return (
          <Link key={conv.id} href={`/chat/${friend.id}`}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
