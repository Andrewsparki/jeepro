"use client";

import { useState, useEffect, useCallback } from "react";
import { GroupsService } from "../services/groups.service";
import { GroupMember, InvitableFriend } from "../types/groups.types";
import { toast } from "sonner";

export function useGroupMembers(groupId: string) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invitableFriends, setInvitableFriends] = useState<InvitableFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadMembers = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await GroupsService.getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      console.error("[useGroupMembers] Error loading members:", err);
      toast.error("Failed to load group members.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const loadInvitableFriends = useCallback(async () => {
    if (!groupId) return;
    setIsLoadingFriends(true);
    try {
      const data = await GroupsService.getInvitableFriends(groupId);
      setInvitableFriends(data);
    } catch (err) {
      console.error("[useGroupMembers] Error loading invitable friends:", err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [groupId]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!groupId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await GroupsService.getGroupMembers(groupId);
        if (!ignore) {
          setMembers(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("[useGroupMembers] Error loading members:", err);
          toast.error("Failed to load group members.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, [groupId]);

  const removeMember = async (targetUserId: string): Promise<boolean> => {
    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await GroupsService.removeMember(groupId, targetUserId);
      toast.success("Member removed from group.");
      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove member.";
      toast.error(msg);
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const inviteFriend = async (friendId: string): Promise<boolean> => {
    setActionLoading((prev) => ({ ...prev, [friendId]: true }));
    try {
      await GroupsService.sendInvite(groupId, friendId);
      toast.success("Invitation sent!");

      setInvitableFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, is_invited: true } : f))
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation.";
      toast.error(msg);
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  return {
    members,
    invitableFriends,
    isLoading,
    isLoadingFriends,
    actionLoading,
    refreshMembers: loadMembers,
    loadInvitableFriends,
    removeMember,
    inviteFriend,
  };
}
