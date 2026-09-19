"use client";

import React from "react";
import { usePrivateChat } from "../hooks/use-private-chat";
import { PrivateChatHeader } from "./private-chat-header";
import { PrivateChatMessageList } from "./private-chat-message-list";
import { ChatComposer } from "./chat-composer";
import { isModerationError } from "../utils/moderation";

interface PrivateChatViewProps {
  otherUserId: string;
  onBack?: () => void;
}

export function PrivateChatView({ otherUserId, onBack }: PrivateChatViewProps) {
  const {
    conversationId,
    otherUser,
    friendshipStatus,
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    error,
    isOtherUserOnline,
    unreadCountBelow,
    sendMessage,
    deleteMessage,
    loadOlderMessages,
    setNearBottom,
    retry,
    currentUserId,
  } = usePrivateChat(otherUserId);

  const isFriend = friendshipStatus === "accepted";
  const isModError = Boolean(error && isModerationError(error));
  const composerDisabled = !isFriend || !conversationId || isModError;
  const disabledReason = isModError
    ? "Direct messaging is restricted due to moderation."
    : !isFriend
    ? "Direct messaging is only available between accepted friends."
    : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] w-full max-w-5xl mx-auto rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-soft overflow-hidden relative">
      {/* 1. Header */}
      <PrivateChatHeader
        otherUser={otherUser}
        isOnline={isOtherUserOnline}
        friendshipStatus={friendshipStatus}
        onBack={onBack}
      />

      {/* 2. Scrollable Messages Stream */}
      <PrivateChatMessageList
        messages={messages}
        otherUser={otherUser}
        friendshipStatus={friendshipStatus}
        isLoading={isLoading}
        isLoadingOlder={isLoadingOlder}
        hasMore={hasMore}
        error={error}
        currentUserId={currentUserId}
        unreadCountBelow={unreadCountBelow}
        onLoadOlder={loadOlderMessages}
        onDeleteMessage={deleteMessage}
        setNearBottom={setNearBottom}
        onRetry={retry}
      />

      {/* 3. Composer */}
      <ChatComposer
        onSendMessage={sendMessage}
        disabled={composerDisabled}
        disabledReason={disabledReason}
        placeholder={
          otherUser?.full_name
            ? `Message ${otherUser.full_name}... (Enter to send, Shift+Enter for new line)`
            : "Message your study partner... (Enter to send, Shift+Enter for new line)"
        }
      />
    </div>
  );
}
