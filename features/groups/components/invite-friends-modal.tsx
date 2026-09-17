"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Check, Loader2, Users } from "lucide-react";
import { InvitableFriend } from "../types/groups.types";

interface InviteFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: InvitableFriend[];
  isLoading: boolean;
  onInvite: (friendId: string) => Promise<boolean>;
  actionLoading: Record<string, boolean>;
}

export function InviteFriendsModal({
  open,
  onOpenChange,
  friends,
  isLoading,
  onInvite,
  actionLoading,
}: InviteFriendsModalProps) {
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((f) =>
    f.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Friends
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invite accepted study partners to collaborate in this group.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[320px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading your friends list...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">
                {friends.length === 0
                  ? "No invitable friends available."
                  : "No matching friends found."}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[260px]">
                {friends.length === 0
                  ? "All your friends are already in this group, or you have not added any friends yet."
                  : "Try searching with a different name."}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const initials = (friend.full_name || "A").charAt(0).toUpperCase();
              const isInviting = actionLoading[friend.id] || false;

              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-border/60 shrink-0 bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {friend.full_name}
                      </p>
                      {friend.target_exam && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {friend.target_exam}
                        </p>
                      )}
                    </div>
                  </div>

                  {friend.is_invited ? (
                    <Button size="sm" variant="ghost" disabled className="h-7 px-2.5 text-[11px] gap-1 text-emerald-500">
                      <Check className="h-3.5 w-3.5" />
                      Invited
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onInvite(friend.id)}
                      disabled={isInviting}
                      className="h-7 px-3 text-[11px] font-medium gap-1"
                    >
                      {isInviting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Invite"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
