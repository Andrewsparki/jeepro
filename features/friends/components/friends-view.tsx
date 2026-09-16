"use client";

import React, { useState, useMemo } from "react";
import { useFriends } from "../hooks/use-friends";
import { FriendCard } from "./friend-card";
import { EmptyState } from "./empty-state";
import { PublicProfileModal } from "./public-profile-modal";
import {
  Users,
  UserPlus,
  Clock,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveTab = "friends" | "pending" | "find";

export function FriendsView() {
  const {
    friends,
    pendingReceived,
    pendingSent,
    pendingCount,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    refreshFriends,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [friendsFilter, setFriendsFilter] = useState("");

  // Filter accepted friends by local search query
  const filteredFriends = useMemo(() => {
    if (!friendsFilter.trim()) return friends;
    const q = friendsFilter.toLowerCase();
    return friends.filter(
      (f) =>
        f.full_name.toLowerCase().includes(q) ||
        (f.target_exam && f.target_exam.toLowerCase().includes(q))
    );
  }, [friends, friendsFilter]);

  const onlineCount = useMemo(() => {
    return friends.filter((f) => f.isOnline).length;
  }, [friends]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-soft">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Friends & Community
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5" />
                Network
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect with fellow JEE aspirants, track study partners, and motivate each other.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border/40 text-xs">
            <span className="text-muted-foreground">Friends: </span>
            <span className="font-bold text-foreground">{friends.length}</span>
          </div>
          {onlineCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCount} Online</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshFriends}
            disabled={isLoading}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            title="Refresh friends"
            aria-label="Refresh friends"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-accent")} />
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/40 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("friends")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none",
            activeTab === "friends"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Friends</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-bold">
            {friends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none relative",
            activeTab === "pending"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
          {pendingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-extrabold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("find")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none",
            activeTab === "find"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Find People</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-between text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={refreshFriends} className="h-7 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-xs text-muted-foreground animate-pulse">Loading friends...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: FRIENDS */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {friends.length > 0 && (
                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={friendsFilter}
                    onChange={(e) => setFriendsFilter(e.target.value)}
                    placeholder="Filter friends..."
                    className="w-full text-xs rounded-xl bg-surface border border-border/40 pl-9 pr-8 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {friendsFilter && (
                    <button
                      type="button"
                      onClick={() => setFriendsFilter("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {friends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Friends Yet"
                  description="Connect with fellow aspirants to share study streaks, collaborate, and prepare together."
                  actionLabel="Find Aspirants"
                  onAction={() => setActiveTab("find")}
                />
              ) : filteredFriends.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No friends matching &ldquo;{friendsFilter}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredFriends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      user={friend}
                      type="friend"
                      onRemove={(fid, uid) => removeFriend(fid, uid)}
                      onViewProfile={(uid) => setSelectedUserId(uid)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING REQUESTS */}
          {activeTab === "pending" && (
            <div className="space-y-6">
              {/* Received Requests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>Received Requests</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-bold">
                      {pendingReceived.length}
                    </span>
                  </h3>
                </div>

                {pendingReceived.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 px-2 italic">
                    No incoming requests at the moment.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pendingReceived.map((req) => (
                      <FriendCard
                        key={req.id}
                        user={req}
                        type="received_request"
                        onAccept={(fid, uid) => acceptFriendRequest(fid, uid)}
                        onDecline={(fid, uid) => declineFriendRequest(fid, uid)}
                        onViewProfile={(uid) => setSelectedUserId(uid)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-3 pt-2 border-t border-border/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>Sent Requests</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/40 text-muted-foreground font-bold">
                    {pendingSent.length}
                  </span>
                </h3>

                {pendingSent.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 px-2 italic">
                    No pending sent requests.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pendingSent.map((req) => (
                      <FriendCard
                        key={req.id}
                        user={req}
                        type="sent_request"
                        onCancel={(fid, uid) => cancelFriendRequest(fid, uid)}
                        onViewProfile={(uid) => setSelectedUserId(uid)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FIND PEOPLE */}
          {activeTab === "find" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-lg">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search aspirants by name (e.g. Rahul, Priya)..."
                  className="w-full text-sm rounded-xl bg-surface border border-border/40 pl-10 pr-10 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Area */}
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <p className="text-xs text-muted-foreground">Searching aspirants...</p>
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Aspirants Found"
                  description={`No public profiles matched "${searchQuery}". Check the spelling and try again.`}
                />
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-1">
                    Found {searchResults.length} {searchResults.length === 1 ? "aspirant" : "aspirants"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map((user) => (
                      <FriendCard
                        key={user.id}
                        user={user}
                        type="search_result"
                        onSendRequest={(uid) => sendFriendRequest(uid)}
                        onAccept={(fid, uid) => acceptFriendRequest(fid, uid)}
                        onViewProfile={(uid) => setSelectedUserId(uid)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/40 rounded-2xl">
                  <UserPlus className="w-8 h-8 text-muted-foreground/40 mb-1" />
                  <h4 className="text-sm font-semibold text-foreground">Find Study Partners</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Search for classmates or study group peers across India by name to connect and study together.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Public Profile Modal */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onActionComplete={refreshFriends}
      />
    </div>
  );
}
