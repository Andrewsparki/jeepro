import { createClient } from "@/lib/supabase/client";
import {
  StudyGroup,
  GroupMember,
  GroupMessage,
  GroupInvite,
  CreateGroupInput,
  InvitableFriend,
  GroupRole,
} from "../types/groups.types";
import { FriendsService } from "@/features/friends/services/friends.service";

interface DbGroupMemberRow {
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: unknown;
  groups?: unknown;
}

interface DbGroupInviteRow {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  groups?: unknown;
  profiles?: unknown;
}

interface DbGroupMessageRow {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profiles?: unknown;
}

export class GroupsService {
  /**
   * Helper to retrieve currently authenticated user or throw
   */
  private static async getAuthUser() {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("You must be signed in to perform this action.");
    }
    return user;
  }

  /**
   * Fetch all study groups the current user is a member of
   */
  static async getMyGroups(): Promise<StudyGroup[]> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("role, joined_at, groups (*)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false });

    if (memberError) {
      console.error("[GroupsService] Error fetching my groups:", memberError.message);
      throw memberError;
    }

    if (!memberRows) return [];

    return memberRows
      .filter((row: { groups: unknown; role: string }) => row.groups !== null)
      .map((row: { groups: unknown; role: string }) => {
        const g = row.groups as unknown as StudyGroup;
        return {
          ...g,
          is_member: true,
          user_role: row.role as GroupRole,
        };
      });
  }

  /**
   * Discover public groups (bounded, with optional search filter)
   */
  static async getDiscoverGroups(search?: string, limit = 30): Promise<StudyGroup[]> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    let query = supabase
      .from("groups")
      .select("*")
      .eq("is_private", false)
      .order("member_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search && search.trim().length > 0) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: groups, error } = await query;
    if (error) {
      console.error("[GroupsService] Error discovering groups:", error.message);
      throw error;
    }

    if (!groups || groups.length === 0) return [];

    // Check caller's membership status across these groups
    const groupIds = groups.map((g: { id: string }) => g.id);
    const { data: myMemberships } = await supabase
      .from("group_members")
      .select("group_id, role")
      .eq("user_id", user.id)
      .in("group_id", groupIds);

    const membershipMap = new Map<string, GroupRole>();
    (myMemberships || []).forEach((m: { group_id: string; role: string }) => {
      membershipMap.set(m.group_id, m.role as GroupRole);
    });

    return (groups as StudyGroup[]).map((g: StudyGroup) => ({
      ...g,
      is_member: membershipMap.has(g.id),
      user_role: membershipMap.get(g.id) || null,
    }));
  }

  /**
   * Fetch details for a specific group including current user's membership and role
   */
  static async getGroupDetails(groupId: string): Promise<StudyGroup> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { data: group, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error || !group) {
      console.error("[GroupsService] Error fetching group details:", error?.message);
      throw new Error("Group not found or you do not have permission to view it.");
    }

    // Check membership
    const { data: memberRow } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    return {
      ...group,
      is_member: !!memberRow,
      user_role: (memberRow?.role as GroupRole) || null,
    };
  }

  /**
   * Create a new study group via atomic RPC
   */
  static async createGroup(input: CreateGroupInput): Promise<StudyGroup> {
    await this.getAuthUser();
    const supabase = createClient();

    const { data, error } = await supabase.rpc("create_study_group", {
      p_name: input.name.trim(),
      p_description: input.description?.trim() || null,
      p_avatar_icon: input.avatar_icon || "book",
      p_avatar_color: input.avatar_color || "blue",
      p_is_private: input.is_private || false,
    });

    if (error || !data) {
      console.error("[GroupsService] Error creating group:", error?.message);
      throw new Error(error?.message || "Failed to create study group.");
    }

    return {
      ...data,
      is_member: true,
      user_role: "owner",
    };
  }

  /**
   * Join a public study group
   */
  static async joinGroup(groupId: string): Promise<boolean> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    // Check study_groups moderation status
    const { data: modScope } = await supabase
      .from("user_moderation_scopes")
      .select("status, reason, expires_at")
      .eq("user_id", user.id)
      .eq("scope", "study_groups")
      .maybeSingle();

    if (modScope && modScope.status !== "active") {
      const isExpired = modScope.expires_at && new Date(modScope.expires_at) <= new Date();
      if (!isExpired) {
        throw new Error(
          modScope.reason
            ? `Study Groups Restricted: ${modScope.reason}`
            : "Your access to Study Groups has been restricted by an administrator."
        );
      }
    }

    const { error } = await supabase.rpc("join_public_group", {
      p_group_id: groupId,
    });

    if (error) {
      console.error("[GroupsService] Error joining group:", error.message);
      throw new Error(error.message || "Failed to join group.");
    }

    return true;
  }

  /**
   * Leave a study group
   */
  static async leaveGroup(groupId: string): Promise<boolean> {
    await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase.rpc("leave_study_group", {
      p_group_id: groupId,
    });

    if (error) {
      console.error("[GroupsService] Error leaving group:", error.message);
      throw new Error(error.message || "Failed to leave group.");
    }

    return true;
  }

  /**
   * Fetch all members of a study group
   */
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    await this.getAuthUser();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, user_id, role, joined_at, profiles (id, full_name, avatar_url, target_exam, target_year)")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("[GroupsService] Error fetching members:", error.message);
      throw error;
    }

    return (data || []).map((row: DbGroupMemberRow) => ({
      group_id: row.group_id,
      user_id: row.user_id,
      role: row.role as GroupRole,
      joined_at: row.joined_at,
      profile: row.profiles as unknown as GroupMember["profile"],
    }));
  }

  /**
   * Remove a member from the group (Owner/Admin only)
   */
  static async removeMember(groupId: string, targetUserId: string): Promise<boolean> {
    await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase.rpc("remove_group_member", {
      p_group_id: groupId,
      p_target_user_id: targetUserId,
    });

    if (error) {
      console.error("[GroupsService] Error removing member:", error.message);
      throw new Error(error.message || "Failed to remove member.");
    }

    return true;
  }

  /**
   * Fetch accepted friends who are not currently members and have not been invited
   */
  static async getInvitableFriends(groupId: string): Promise<InvitableFriend[]> {
    const friends = await FriendsService.getFriends();
    if (friends.length === 0) return [];

    const supabase = createClient();

    // 1. Fetch current group members
    const { data: memberRows } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    const memberUserIds = new Set((memberRows || []).map((m: { user_id: string }) => m.user_id));

    // 2. Fetch pending invites
    const { data: inviteRows } = await supabase
      .from("group_invites")
      .select("invitee_id")
      .eq("group_id", groupId)
      .eq("status", "pending");

    const invitedUserIds = new Set((inviteRows || []).map((i: { invitee_id: string }) => i.invitee_id));

    return friends
      .filter((f) => !memberUserIds.has(f.id))
      .map((f) => ({
        id: f.id,
        full_name: f.full_name,
        avatar_url: f.avatar_url,
        target_exam: f.target_exam,
        is_invited: invitedUserIds.has(f.id),
      }));
  }

  /**
   * Send an invitation to an accepted friend
   */
  static async sendInvite(groupId: string, inviteeId: string): Promise<GroupInvite> {
    await this.getAuthUser();
    const supabase = createClient();

    const { data, error } = await supabase.rpc("send_group_invite", {
      p_group_id: groupId,
      p_invitee_id: inviteeId,
    });

    if (error || !data) {
      console.error("[GroupsService] Error sending invite:", error?.message);
      throw new Error(error?.message || "Failed to send invitation.");
    }

    return data as GroupInvite;
  }

  /**
   * Fetch pending group invites for current user
   */
  static async getMyPendingInvites(): Promise<GroupInvite[]> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("group_invites")
      .select(
        "id, group_id, inviter_id, invitee_id, status, created_at, updated_at, groups (id, name, description, avatar_icon, avatar_color, member_count, is_private), profiles!group_invites_inviter_id_fkey (id, full_name, avatar_url)"
      )
      .eq("invitee_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GroupsService] Error fetching invites:", error.message);
      throw error;
    }

    return (data || []).map((row: DbGroupInviteRow) => ({
      id: row.id,
      group_id: row.group_id,
      inviter_id: row.inviter_id,
      invitee_id: row.invitee_id,
      status: row.status as GroupInvite["status"],
      created_at: row.created_at,
      updated_at: row.updated_at,
      group: row.groups as unknown as GroupInvite["group"],
      inviter: row.profiles as unknown as GroupInvite["inviter"],
    }));
  }

  /**
   * Accept or decline a group invite
   */
  static async respondToInvite(inviteId: string, accept: boolean): Promise<boolean> {
    await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase.rpc("respond_group_invite", {
      p_invite_id: inviteId,
      p_accept: accept,
    });

    if (error) {
      console.error("[GroupsService] Error responding to invite:", error.message);
      throw new Error(error.message || "Failed to respond to invitation.");
    }

    return true;
  }

  /**
   * Cursor-paginated message retrieval (bounded, default 30)
   */
  static async getMessages(
    groupId: string,
    limit = 30,
    beforeCreatedAt?: string
  ): Promise<{ messages: GroupMessage[]; hasMore: boolean }> {
    await this.getAuthUser();
    const supabase = createClient();

    let query = supabase
      .from("group_messages")
      .select("id, group_id, sender_id, content, created_at, updated_at, deleted_at, profiles (id, full_name, avatar_url)")
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      query = query.lt("created_at", beforeCreatedAt);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GroupsService] Error fetching messages:", error.message);
      throw error;
    }

    const rows = data || [];
    const hasMore = rows.length > limit;
    const paged = hasMore ? rows.slice(0, limit) : rows;

    // Convert and reverse to chronological order (oldest -> newest) for chat rendering
    const formatted: GroupMessage[] = paged
      .map((row: DbGroupMessageRow) => ({
        id: row.id,
        group_id: row.group_id,
        sender_id: row.sender_id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        sender: row.profiles as unknown as GroupMessage["sender"],
      }))
      .reverse();

    return { messages: formatted, hasMore };
  }

  /**
   * Send a new message to the group chat
   */
  static async sendMessage(groupId: string, content: string): Promise<GroupMessage> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const cleanContent = content.trim();
    if (!cleanContent) {
      throw new Error("Message content cannot be empty.");
    }
    if (cleanContent.length > 1000) {
      throw new Error("Message exceeds maximum length of 1000 characters.");
    }

    // Check study_groups moderation status
    const { data: modScope } = await supabase
      .from("user_moderation_scopes")
      .select("status, reason, expires_at")
      .eq("user_id", user.id)
      .eq("scope", "study_groups")
      .maybeSingle();

    if (modScope && modScope.status !== "active") {
      const isExpired = modScope.expires_at && new Date(modScope.expires_at) <= new Date();
      if (!isExpired) {
        throw new Error(
          modScope.reason
            ? `Study Groups Restricted: ${modScope.reason}`
            : "Your access to Study Groups has been restricted by an administrator."
        );
      }
    }

    const { data, error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        sender_id: user.id,
        content: cleanContent,
      })
      .select("id, group_id, sender_id, content, created_at, updated_at, deleted_at, profiles (id, full_name, avatar_url)")
      .single();

    if (error || !data) {
      console.error("[GroupsService] Error sending message:", error?.message);
      throw new Error(error?.message || "Failed to send message.");
    }

    return {
      id: data.id,
      group_id: data.group_id,
      sender_id: data.sender_id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      sender: data.profiles as unknown as GroupMessage["sender"],
    };
  }

  /**
   * Soft-delete a message (sender or owner/admin)
   */
  static async deleteMessage(messageId: string): Promise<boolean> {
    await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase
      .from("group_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) {
      console.error("[GroupsService] Error deleting message:", error.message);
      throw new Error(error.message || "Failed to delete message.");
    }

    return true;
  }
}
