"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FriendUser } from "../types/friends.types";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  UserMinus,
  ExternalLink,
  MessageSquare,
  Copy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextMenuTrigger } from "@/features/context-menu";
import { toast } from "sonner";

interface FriendCardProps {
  user: FriendUser;
  type: "friend" | "received_request" | "sent_request" | "search_result";
  onAccept?: (friendshipId: string, userId: string) => void;
  onDecline?: (friendshipId: string, userId: string) => void;
  onCancel?: (friendshipId: string, userId: string) => void;
  onRemove?: (friendshipId: string, userId: string) => void;
  onSendRequest?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function FriendCard({
  user,
  type,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
  onSendRequest,
  onViewProfile,
}: FriendCardProps) {
  const router = useRouter();
  const initial = (user.full_name || "A").charAt(0).toUpperCase();

  const friendMenuItems = [
    {
      id: "view-profile",
      label: "View Profile",
      icon: User,
      onClick: () => onViewProfile && onViewProfile(user.id),
    },
    {
      id: "send-dm",
      label: "Send Message",
      icon: MessageSquare,
      onClick: () => router.push(`/dashboard/chat/${user.id}`),
    },
    ...(type === "received_request" && user.friendshipId
      ? [
          {
            id: "accept-request",
            label: "Accept Friend Request",
            icon: Check,
            onClick: () => onAccept && onAccept(user.friendshipId!, user.id),
          },
        ]
      : []),
    ...(type === "sent_request" && user.friendshipId
      ? [
          {
            id: "cancel-request",
            label: "Cancel Friend Request",
            icon: X,
            danger: true,
            onClick: () => onCancel && onCancel(user.friendshipId!, user.id),
          },
        ]
      : []),
    ...(type === "friend" && user.friendshipId
      ? [
          {
            id: "remove-friend",
            label: "Remove Friend",
            icon: UserMinus,
            danger: true,
            onClick: () => onRemove && onRemove(user.friendshipId!, user.id),
          },
        ]
      : []),
    { id: "sep-1", separator: true, label: "" },
    {
      id: "copy-name",
      label: "Copy Name",
      icon: Copy,
      onClick: () => {
        navigator.clipboard.writeText(user.full_name);
        toast.success("Name copied");
      },
    },
  ];

  return (
    <ContextMenuTrigger items={friendMenuItems} title={user.full_name}>
      <div className="group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-border/40 bg-surface/60 hover:bg-surface-hover hover:border-border/60 transition-all shadow-sm">
      {/* Avatar & User Info */}
      <div
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        onClick={() => onViewProfile && onViewProfile(user.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onViewProfile) onViewProfile(user.id);
          }
        }}
        aria-label={`View public profile of ${user.full_name}`}
      >
        {/* Avatar with live online badge */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center overflow-hidden shadow-sm">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          {user.isOnline && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background"
              title="Currently Online"
            />
          )}
        </div>

        {/* Text details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
              {user.full_name}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.target_exam || "JEE Aspirant"}
            {user.target_year && ` • '` + String(user.target_year).slice(-2)}
          </p>
        </div>
      </div>

      {/* Contextual Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* TYPE 1: ACCEPTED FRIEND */}
        {type === "friend" && (
          <>
            <Link href={`/chat/${user.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs text-accent hover:text-accent-foreground hover:bg-accent/90 border-accent/30 rounded-lg gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile && onViewProfile(user.id)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user.friendshipId && onRemove && onRemove(user.friendshipId, user.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
              title="Remove friend"
              aria-label={`Remove ${user.full_name} from friends`}
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* TYPE 2: RECEIVED REQUEST */}
        {type === "received_request" && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => user.friendshipId && onAccept && onAccept(user.friendshipId, user.id)}
              className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user.friendshipId && onDecline && onDecline(user.friendshipId, user.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
              title="Decline request"
              aria-label="Decline friend request"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* TYPE 3: SENT REQUEST */}
        {type === "sent_request" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => user.friendshipId && onCancel && onCancel(user.friendshipId, user.id)}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive border-border/40 hover:border-destructive/30 rounded-lg"
          >
            Cancel
          </Button>
        )}

        {/* TYPE 4: SEARCH RESULT */}
        {type === "search_result" && (
          <>
            {user.friendshipStatus === "accepted" ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <UserCheck className="w-3.5 h-3.5" />
                Friends
              </span>
            ) : user.friendshipStatus === "pending" ? (
              user.isRequester ? (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  Sent
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => user.friendshipId && onAccept && onAccept(user.friendshipId, user.id)}
                  className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold"
                >
                  Accept
                </Button>
              )
            ) : (
              <Button
                size="sm"
                onClick={() => onSendRequest && onSendRequest(user.id)}
                className={cn(
                  "h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold gap-1.5"
                )}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  </ContextMenuTrigger>
);
}
