"use client";

import { useState } from "react";
import { GroupMember, GroupRole } from "../types/groups.types";
import { Button } from "@/components/ui/button";
import { Crown, ShieldCheck, UserMinus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GroupMembersListProps {
  members: GroupMember[];
  currentUserRole: GroupRole | null;
  currentUserId: string;
  onRemoveMember: (userId: string) => Promise<boolean>;
  actionLoading: Record<string, boolean>;
}

export function GroupMembersList({
  members,
  currentUserRole,
  currentUserId,
  onRemoveMember,
  actionLoading,
}: GroupMembersListProps) {
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await onRemoveMember(memberToRemove.user_id);
    setMemberToRemove(null);
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const profile = member.profile;
          const displayName = profile?.full_name || "Aspirant";
          const initials = displayName.charAt(0).toUpperCase();
          const isSelf = member.user_id === currentUserId;
          const isOwner = member.role === "owner";
          const isAdmin = member.role === "admin";
          const isRemoving = actionLoading[member.user_id] || false;

          // Admin cannot remove owner; admin cannot remove other admins
          const canRemoveThisMember =
            canManage &&
            !isSelf &&
            !isOwner &&
            !(currentUserRole === "admin" && isAdmin);

          return (
            <div
              key={member.user_id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-border/60 shrink-0 bg-muted flex items-center justify-center text-[11px] font-bold text-foreground">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {displayName}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        (You)
                      </span>
                    )}
                  </div>

                  {profile?.target_exam && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {profile.target_exam}
                    </p>
                  )}
                </div>
              </div>

              {/* Role badge or Remove Action */}
              <div className="flex items-center gap-2 shrink-0">
                {isOwner && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Crown className="h-3 w-3" />
                    Owner
                  </span>
                )}

                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                )}

                {canRemoveThisMember && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMemberToRemove(member)}
                    disabled={isRemoving}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Remove member"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={(open: boolean) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Remove from Study Group?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {memberToRemove?.profile?.full_name || "this user"}
              </span>{" "}
              from the study group? They will lose access to the group chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmRemove}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
