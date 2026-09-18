"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalChat } from "../hooks/use-global-chat";
import { useDirectConversations } from "../hooks/use-direct-conversations";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatComposer } from "./chat-composer";
import { ChatReportModal } from "./chat-report-modal";
import { AdminUserModerationModal } from "./admin-user-moderation-modal";
import { AdminChatControlsModal } from "./admin-chat-controls-modal";
import { DirectConversationsList } from "./direct-conversations-list";
import { ChatMessage, ChatSender } from "../types/chat.types";
import { Globe, MessageSquare } from "lucide-react";

export function GlobalChatView() {
  const [activeTab, setActiveTab] = useState<"global" | "direct">("global");
  const {
    conversations,
    totalUnreadCount,
    isLoading: isDirectLoading,
    error: directError,
  } = useDirectConversations();

  const {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    error,
    chatStatus,
    onlineUsers,
    onlineCount,
    unreadCountBelow,
    sendMessage,
    deleteMessage,
    reportMessage,
    loadOlderMessages,
    refreshMessages,
    setNearBottom,
    currentUserId,
    isAdmin,
    isMuted,
    isBanned,
    muteReason,
    banReason,
  } = useGlobalChat();

  const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);
  const [moderatingUser, setModeratingUser] = useState<ChatSender | null>(null);
  const [isAdminControlsOpen, setIsAdminControlsOpen] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] w-full max-w-5xl mx-auto rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-soft overflow-hidden relative">
      {/* Animated Tab Switcher: Global Chat vs Direct Messages */}
      <div className="flex items-center gap-1.5 p-2 px-3 sm:px-4 bg-surface/50 border-b border-border/40 shrink-0 relative">
        {(["global", "direct"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const Icon = tab === "global" ? Globe : MessageSquare;
          const label = tab === "global" ? "Global Chat" : "Direct Messages";

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 z-10 select-none ${
                isActive
                  ? "text-accent font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeChatTabIndicator"
                  className="absolute inset-0 bg-accent/15 border border-accent/25 rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {tab === "direct" && totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-accent text-accent-foreground shadow-sm">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "global" ? (
          <motion.div
            key="global"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* 1. Header */}
            <ChatHeader
              onlineUsers={onlineUsers}
              onlineCount={onlineCount}
              chatStatus={chatStatus}
              isAdmin={isAdmin}
              onRefresh={refreshMessages}
              onOpenAdminControls={() => setIsAdminControlsOpen(true)}
              isLoading={isLoading}
            />

            {/* 2. Scrollable Messages Stream */}
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              isLoadingOlder={isLoadingOlder}
              hasMore={hasMore}
              error={error}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              unreadCountBelow={unreadCountBelow}
              onLoadOlder={loadOlderMessages}
              onDeleteMessage={deleteMessage}
              onReportMessage={(msg) => setReportingMessage(msg)}
              onAdminModerateUser={(sender) => setModeratingUser(sender)}
              onRefresh={refreshMessages}
              setNearBottom={setNearBottom}
            />

            {/* 3. Banned Access Restriction Banner or Composer */}
            {isBanned ? (
              <div className="border-t border-destructive/30 bg-destructive/10 p-4 text-center shrink-0 z-20">
                <p className="text-xs font-semibold text-destructive">
                  Your access to Global Chat has been restricted by an administrator.
                </p>
                {banReason && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Reason: {banReason}
                  </p>
                )}
              </div>
            ) : (
              <ChatComposer
                onSendMessage={sendMessage}
                disabled={!chatStatus.enabled || isMuted}
                disabledReason={
                  isMuted
                    ? `You are currently muted. ${muteReason ? `Reason: ${muteReason}` : ""}`
                    : chatStatus.disabled_reason
                }
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="direct"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 overflow-y-auto"
          >
            <DirectConversationsList
              conversations={conversations}
              isLoading={isDirectLoading}
              error={directError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Moderation Report Dialog for Normal Users */}
      <ChatReportModal
        isOpen={!!reportingMessage}
        onClose={() => setReportingMessage(null)}
        message={reportingMessage}
        onReportSubmit={reportMessage}
      />

      {/* 5. Admin User Moderation Dialog */}
      {isAdmin && (
        <AdminUserModerationModal
          isOpen={!!moderatingUser}
          onClose={() => setModeratingUser(null)}
          targetUser={moderatingUser}
          onUserStatusChanged={refreshMessages}
        />
      )}

      {/* 6. Admin System Chat Controls Dialog */}
      {isAdmin && (
        <AdminChatControlsModal
          isOpen={isAdminControlsOpen}
          onClose={() => setIsAdminControlsOpen(false)}
          chatStatus={chatStatus}
          onChatStatusChanged={refreshMessages}
        />
      )}
    </div>
  );
}
