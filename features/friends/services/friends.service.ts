import { createClient } from "@/lib/supabase/client";
import { FriendUser, FriendshipStatus, PublicProfile } from "../types/friends.types";
import { NotificationService } from "@/features/notifications/services/notification.service";

interface RawFriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

interface RawProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string | null;
  target_year: number | null;
  created_at: string;
}

export class FriendsService {
  /**
   * Helper to get currently authenticated user ID or throw error
   */
  private static async getAuthUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("You must be signed in to perform this action.");
    }
    return user;
  }

  /**
   * Fetch all accepted friends for the current user
   */
  static async getFriends(): Promise<FriendUser[]> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { data: rawFriendships, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, created_at, updated_at")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      console.error("[FriendsService] Error fetching friends:", error.message);
      throw error;
    }

    const rows = (rawFriendships || []) as RawFriendshipRow[];
    if (rows.length === 0) return [];

    // Extract friend IDs
    const friendIdMap = new Map<string, string>(); // friendId -> friendshipId
    rows.forEach((r) => {
      const friendId = r.requester_id === user.id ? r.addressee_id : r.requester_id;
      friendIdMap.set(friendId, r.id);
    });

    const friendIds = Array.from(friendIdMap.keys());
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, target_exam, target_year, created_at")
      .in("id", friendIds);

    if (pError) throw pError;

    return ((profiles as RawProfileRow[]) || []).map((p: RawProfileRow) => ({
      id: p.id,
      full_name: p.full_name || "JEE Aspirant",
      avatar_url: p.avatar_url || null,
      target_exam: p.target_exam || null,
      target_year: p.target_year || null,
      created_at: p.created_at,
      friendshipId: friendIdMap.get(p.id),
      friendshipStatus: "accepted",
      isRequester: false,
    }));
  }

  /**
   * Fetch pending friend requests (received and sent)
   */
  static async getPendingRequests(): Promise<{ received: FriendUser[]; sent: FriendUser[] }> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { data: rawFriendships, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, created_at, updated_at")
      .eq("status", "pending")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      console.error("[FriendsService] Error fetching pending requests:", error.message);
      throw error;
    }

    const rows = (rawFriendships || []) as RawFriendshipRow[];
    if (rows.length === 0) return { received: [], sent: [] };

    // Group into received vs sent
    const receivedRows = rows.filter((r) => r.addressee_id === user.id);
    const sentRows = rows.filter((r) => r.requester_id === user.id);

    const neededUserIds = Array.from(
      new Set([
        ...receivedRows.map((r) => r.requester_id),
        ...sentRows.map((r) => r.addressee_id),
      ])
    );

    let profileMap = new Map<string, RawProfileRow>();

    if (neededUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, target_exam, target_year, created_at")
        .in("id", neededUserIds);

      if (profiles) {
        profileMap = new Map((profiles as RawProfileRow[]).map((p: RawProfileRow) => [p.id, p]));
      }
    }

    const received: FriendUser[] = receivedRows.map((r) => {
      const p = profileMap.get(r.requester_id);
      return {
        id: r.requester_id,
        full_name: p?.full_name || "JEE Aspirant",
        avatar_url: p?.avatar_url || null,
        target_exam: p?.target_exam || null,
        target_year: p?.target_year || null,
        created_at: r.created_at,
        friendshipId: r.id,
        friendshipStatus: "pending",
        isRequester: false,
      };
    });

    const sent: FriendUser[] = sentRows.map((r) => {
      const p = profileMap.get(r.addressee_id);
      return {
        id: r.addressee_id,
        full_name: p?.full_name || "JEE Aspirant",
        avatar_url: p?.avatar_url || null,
        target_exam: p?.target_exam || null,
        target_year: p?.target_year || null,
        created_at: r.created_at,
        friendshipId: r.id,
        friendshipStatus: "pending",
        isRequester: true,
      };
    });

    return { received, sent };
  }

  /**
   * Send a friend request to another user
   */
  static async sendFriendRequest(addresseeId: string): Promise<FriendUser> {
    const user = await this.getAuthUser();
    if (user.id === addresseeId) {
      throw new Error("You cannot send a friend request to yourself.");
    }

    const supabase = createClient();

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.status === "accepted") {
        throw new Error("You are already friends with this aspirant.");
      }
      if (existing.status === "pending") {
        if (existing.requester_id === user.id) {
          throw new Error("Friend request is already pending.");
        } else {
          // If the other person already sent a request, automatically accept it!
          await this.acceptFriendRequest(existing.id);
          return {
            id: addresseeId,
            full_name: "JEE Aspirant",
            avatar_url: null,
            target_exam: null,
            target_year: null,
            created_at: new Date().toISOString(),
            friendshipId: existing.id,
            friendshipStatus: "accepted",
            isRequester: false,
          };
        }
      }
      if (existing.status === "blocked") {
        throw new Error("Unable to send request to this user.");
      }
    }

    // Insert new pending request
    const { data: inserted, error: insertError } = await supabase
      .from("friendships")
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("A request between these accounts already exists.");
      }
      throw insertError;
    }

    // Get current user's display name for notification
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const requesterName = myProfile?.full_name || user.user_metadata?.full_name || "An aspirant";

    // Send persistent notification to addressee (with built-in 15-second deduplication)
    await NotificationService.createNotification({
      userId: addresseeId,
      type: "info",
      title: "👥 New Friend Request",
      message: `${requesterName} wants to add you as a friend on JEE Pro.`,
      metadata: {
        type: "friend_request",
        requesterId: user.id,
        friendshipId: inserted.id,
      },
    });

    return {
      id: addresseeId,
      full_name: "JEE Aspirant",
      avatar_url: null,
      target_exam: null,
      target_year: null,
      created_at: inserted.created_at,
      friendshipId: inserted.id,
      friendshipStatus: "pending",
      isRequester: true,
    };
  }

  /**
   * Accept an incoming friend request
   */
  static async acceptFriendRequest(friendshipId: string): Promise<void> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    // Verify friendship exists and current user is the addressee
    const { data: friendship, error: fetchErr } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .eq("id", friendshipId)
      .single();

    if (fetchErr || !friendship) {
      throw new Error("Friend request not found.");
    }

    if (friendship.addressee_id !== user.id) {
      throw new Error("You can only accept requests sent to you.");
    }

    // Idempotency check: If already accepted, return cleanly without duplicating notifications
    if (friendship.status === "accepted") {
      return;
    }

    if (friendship.status !== "pending") {
      throw new Error("This friend request is no longer active.");
    }

    // Atomically transition from pending to accepted
    const { data: updatedRows, error: updateErr } = await supabase
      .from("friendships")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", friendshipId)
      .eq("status", "pending")
      .select("id");

    if (updateErr) throw updateErr;

    // If 0 rows updated (e.g. concurrent execution), return idempotently
    if (!updatedRows || updatedRows.length === 0) {
      return;
    }

    // Notify requester (User B) that their request was accepted by accepter (User A)
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const accepterName = myProfile?.full_name || "Your friend";

    await NotificationService.createNotification({
      userId: friendship.requester_id,
      type: "success",
      title: "🎉 Friend Request Accepted",
      message: `${accepterName} accepted your friend request! You can now study together.`,
      metadata: {
        type: "friend_accepted",
        friendId: user.id,
        friendshipId: friendship.id,
      },
    });
  }

  /**
   * Decline an incoming friend request (removes the pending request row)
   */
  static async declineFriendRequest(friendshipId: string): Promise<void> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .eq("addressee_id", user.id);

    if (error) throw error;
  }

  /**
   * Cancel an outgoing pending request
   */
  static async cancelFriendRequest(friendshipId: string): Promise<void> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .eq("requester_id", user.id);

    if (error) throw error;
  }

  /**
   * Remove an existing friend
   */
  static async removeFriend(friendshipId: string): Promise<void> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) throw error;
  }

  /**
   * Search public profiles by name (strictly excluding private details like email or phone)
   */
  static async searchUsers(query: string, limit = 20): Promise<FriendUser[]> {
    const user = await this.getAuthUser();
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const supabase = createClient();

    // 1. Fetch matching profiles (excluding current user)
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, target_exam, target_year, created_at")
      .neq("id", user.id)
      .ilike("full_name", `%${cleanQuery}%`)
      .limit(limit);

    if (pError) throw pError;
    if (!profiles || profiles.length === 0) return [];

    const targetUserIds = ((profiles as RawProfileRow[]) || []).map((p: RawProfileRow) => p.id);

    // 2. Fetch existing friendships with these users to annotate relation status
    const { data: friendships } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(
        targetUserIds
          .map((tid: string) => `and(requester_id.eq.${user.id},addressee_id.eq.${tid}),and(requester_id.eq.${tid},addressee_id.eq.${user.id})`)
          .join(",")
      );

    const relationshipMap = new Map<string, { id: string; status: FriendshipStatus; isRequester: boolean }>();
    ((friendships as RawFriendshipRow[]) || []).forEach((f: RawFriendshipRow) => {
      const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      relationshipMap.set(otherId, {
        id: f.id,
        status: f.status as FriendshipStatus,
        isRequester: f.requester_id === user.id,
      });
    });

    return ((profiles as RawProfileRow[]) || []).map((p: RawProfileRow) => {
      const rel = relationshipMap.get(p.id);
      return {
        id: p.id,
        full_name: p.full_name || "JEE Aspirant",
        avatar_url: p.avatar_url || null,
        target_exam: p.target_exam || null,
        target_year: p.target_year || null,
        created_at: p.created_at,
        friendshipId: rel?.id,
        friendshipStatus: rel?.status || "none",
        isRequester: rel?.isRequester,
      };
    });
  }

  /**
   * Fetch sanitized public profile details for modal view
   */
  static async getPublicProfile(targetUserId: string): Promise<PublicProfile | null> {
    const user = await this.getAuthUser();
    const supabase = createClient();

    // 1. Fetch public profile fields
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, target_exam, target_year, created_at")
      .eq("id", targetUserId)
      .single();

    if (error || !profile) return null;

    // 2. Check relationship with current user
    let friendshipStatus: FriendshipStatus = "none";
    let friendshipId: string | undefined;
    let isRequester: boolean | undefined;

    if (targetUserId !== user.id) {
      const { data: rel } = await supabase
        .from("friendships")
        .select("id, requester_id, addressee_id, status")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
        )
        .maybeSingle();

      if (rel) {
        friendshipStatus = rel.status as FriendshipStatus;
        friendshipId = rel.id;
        isRequester = rel.requester_id === user.id;
      }
    }

    // 3. Aggregate public study statistics (sessions & mastered topics count)
    let studySessionsCount = 0;
    let masteredTopicsCount = 0;

    try {
      const [sessionsRes, progressRes] = await Promise.all([
        supabase
          .from("study_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetUserId),
        supabase
          .from("user_topic_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetUserId)
          .eq("status", "Mastered"),
      ]);

      studySessionsCount = sessionsRes.count || 0;
      masteredTopicsCount = progressRes.count || 0;
    } catch {
      // Gracefully fall back if counts unavailable
    }

    const estimatedXP = studySessionsCount * 25 + masteredTopicsCount * 50;
    const level = Math.max(1, Math.floor(estimatedXP / 100) + 1);

    return {
      id: profile.id,
      full_name: profile.full_name || "JEE Aspirant",
      avatar_url: profile.avatar_url || null,
      target_exam: profile.target_exam || null,
      target_year: profile.target_year || null,
      created_at: profile.created_at,
      friendshipStatus,
      friendshipId,
      isRequester,
      stats: {
        level,
        totalXP: estimatedXP,
        masteredTopicsCount,
        studySessionsCount,
      },
    };
  }
}
