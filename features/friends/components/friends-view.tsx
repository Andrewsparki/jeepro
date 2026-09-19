"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dispatchInteractionSound } from "@/lib/sound-engine";

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
              <Users className="w-5 h-5" />
            </div>
            Friends & Community
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Connect with fellow JEE aspirants, track study partners, and motivate each other.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-xl bg-surface/60 border border-border/40 font-medium">
            <span className="text-muted-foreground">Friends: </span>
            <span className="text-accent font-bold">{friends.length}</span>
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-500 font-bold">
                ({pendingCount} pending)
              </span>
            )}
          </div>

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

      {/* Animated Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border/40 max-w-md relative">
        {(["friends", "pending", "find"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "friends"
              ? "Friends"
              : tab === "pending"
              ? "Pending"
              : "Find People";
          const Icon =
            tab === "friends"
              ? Users
              : tab === "pending"
              ? Clock
              : UserPlus;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                setActiveTab(tab);
              }}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer outline-none z-10 select-none",
                isActive ? "text-accent-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFriendsTabIndicator"
                  className="absolute inset-0 bg-accent rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {tab === "friends" && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  isActive ? "bg-black/20 text-white" : "bg-white/10"
                )}>
                  {friends.length}
                </span>
              )}
              {tab === "pending" && pendingCount > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse",
                  isActive ? "bg-black text-amber-300" : "bg-amber-500 text-black"
                )}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
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
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center justify-center space-y-3"
          >
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading friends...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
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
                      {pendingReceived.map((user) => (
                        <FriendCard
                          key={user.id}
                          user={user}
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
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span>Sent Requests</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
                        {pendingSent.length}
                      </span>
                    </h3>
                  </div>

                  {pendingSent.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 px-2 italic">
                      No outgoing requests.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pendingSent.map((user) => (
                        <FriendCard
                          key={user.id}
                          user={user}
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
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search aspirants by name..."
                    className="w-full text-xs rounded-xl bg-surface border border-border/40 pl-9 pr-24 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search Results Area */}
                {isSearching ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <p className="text-xs text-muted-foreground">
                      Searching aspirants...
                    </p>
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
                      Found {searchResults.length}{" "}
                      {searchResults.length === 1 ? "aspirant" : "aspirants"}
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
                    <h4 className="text-sm font-semibold text-foreground">
                      Find Study Partners
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Search for classmates or study group peers across India by
                      name to connect and study together.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
