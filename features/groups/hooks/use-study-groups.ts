"use client";

import { useState, useEffect, useCallback } from "react";
import { GroupsService } from "../services/groups.service";
import { StudyGroup, GroupInvite, CreateGroupInput } from "../types/groups.types";
import { toast } from "sonner";

export function useStudyGroups() {
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [activeTab, setActiveTab] = useState<"my-groups" | "discover" | "invites">("my-groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [mine, discovered, myInvites] = await Promise.all([
        GroupsService.getMyGroups(),
        GroupsService.getDiscoverGroups(),
        GroupsService.getMyPendingInvites(),
      ]);

      setMyGroups(mine);
      setDiscoverGroups(discovered);
      setInvites(myInvites);
    } catch (err: unknown) {
      console.error("[useStudyGroups] Load error:", err);
      toast.error("Failed to load study groups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [mine, discovered, myInvites] = await Promise.all([
          GroupsService.getMyGroups(),
          GroupsService.getDiscoverGroups(),
          GroupsService.getMyPendingInvites(),
        ]);
        if (!ignore) {
          setMyGroups(mine);
          setDiscoverGroups(discovered);
          setInvites(myInvites);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("[useStudyGroups] Load error:", err);
          toast.error("Failed to load study groups.");
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
  }, []);

  // Debounced search for Discover Groups
  useEffect(() => {
    if (activeTab !== "discover") return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await GroupsService.getDiscoverGroups(searchQuery);
        setDiscoverGroups(results);
      } catch (err) {
        console.error("[useStudyGroups] Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const createGroup = async (input: CreateGroupInput): Promise<StudyGroup | null> => {
    try {
      const newGroup = await GroupsService.createGroup(input);
      setMyGroups((prev) => [newGroup, ...prev]);
      toast.success(`Group "${newGroup.name}" created!`);
      return newGroup;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create group.";
      toast.error(msg);
      return null;
    }
  };

  const joinGroup = async (groupId: string): Promise<boolean> => {
    setActionLoading((prev) => ({ ...prev, [groupId]: true }));
    try {
      await GroupsService.joinGroup(groupId);
      toast.success("Joined group successfully!");

      // Update state
      setDiscoverGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, is_member: true, user_role: "member", member_count: g.member_count + 1 }
            : g
        )
      );

      // Refresh My Groups
      const mine = await GroupsService.getMyGroups();
      setMyGroups(mine);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to join group.";
      toast.error(msg);
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const leaveGroup = async (groupId: string): Promise<boolean> => {
    setActionLoading((prev) => ({ ...prev, [groupId]: true }));
    try {
      await GroupsService.leaveGroup(groupId);
      toast.success("Left group successfully.");

      setMyGroups((prev) => prev.filter((g) => g.id !== groupId));
      setDiscoverGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, is_member: false, user_role: null, member_count: Math.max(0, g.member_count - 1) }
            : g
        )
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to leave group.";
      toast.error(msg);
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const respondToInvite = async (inviteId: string, accept: boolean): Promise<boolean> => {
    setActionLoading((prev) => ({ ...prev, [inviteId]: true }));
    try {
      await GroupsService.respondToInvite(inviteId, accept);
      toast.success(accept ? "Invitation accepted!" : "Invitation declined.");

      setInvites((prev) => prev.filter((i) => i.id !== inviteId));

      if (accept) {
        const mine = await GroupsService.getMyGroups();
        setMyGroups(mine);
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to respond to invitation.";
      toast.error(msg);
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, [inviteId]: false }));
    }
  };

  return {
    myGroups,
    discoverGroups,
    invites,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSearching,
    actionLoading,
    refresh: loadData,
    createGroup,
    joinGroup,
    leaveGroup,
    respondToInvite,
  };
}
