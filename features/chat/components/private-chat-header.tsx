"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectUser } from "../types/private-chat.types";

interface PrivateChatHeaderProps {
  otherUser: DirectUser | null;
  isOnline: boolean;
  friendshipStatus: "accepted" | "pending" | "none" | "blocked";
  onBack?: () => void;
}

export function PrivateChatHeader({
  otherUser,
  isOnline,
  friendshipStatus,
  onBack,
}: PrivateChatHeaderProps) {
  const initial = (otherUser?.full_name || "S").charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl shrink-0 z-10">
      {/* Left: Back Navigation + User Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        ) : (
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Back to chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        )}

        {/* Avatar with live online state */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center overflow-hidden shadow-sm">
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
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
              isOnline ? "bg-emerald-500" : "bg-zinc-500"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>

        {/* Display Name & Target Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {otherUser?.full_name || "Study Partner"}
            </h3>
            {friendshipStatus === "accepted" && (
              <span className="hidden xs:inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded bg-accent/10 text-accent border border-accent/20">
                Friend
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate mt-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                }`}
              />
              <span className={isOnline ? "text-emerald-400 font-medium" : ""}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </span>
            {otherUser?.target_exam && (
              <>
                <span>•</span>
                <span className="truncate">
                  {otherUser.target_exam}
                  {otherUser.target_year &&
                    ` '` + String(otherUser.target_year).slice(-2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Future-Ready Call Buttons (Visually reserved placeholders - NOT functional) */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed rounded-lg"
          title="Audio calling coming in a future update"
          aria-label="Audio call (coming soon)"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed rounded-lg"
          title="Video calling coming in a future update"
          aria-label="Video call (coming soon)"
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
