"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyGroups } from "../hooks/use-study-groups";
import { GroupCard } from "./group-card";
import { CreateGroupModal } from "./create-group-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  Compass,
  Mail,
  Loader2,
  Check,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchInteractionSound } from "@/lib/sound-engine";

export function GroupsView() {
  const {
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
    createGroup,
    joinGroup,
    respondToInvite,
  } = useStudyGroups();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="h-5 w-5" />
            </div>
            Study Groups
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Collaborative study pods for JEE problem solving, doubt clearing, and mutual accountability.
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="gap-1.5 text-xs font-semibold h-9 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs with Animated Sliding Pill */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/40 w-fit relative">
          {(["my-groups", "discover", "invites"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === "my-groups"
                ? "My Groups"
                : tab === "discover"
                ? "Discover"
                : "Invites";
            const Icon =
              tab === "my-groups"
                ? Users
                : tab === "discover"
                ? Compass
                : Mail;
            const badgeCount =
              tab === "my-groups"
                ? myGroups.length
                : tab === "invites"
                ? invites.length
                : 0;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  dispatchInteractionSound("ui.tab");
                  setActiveTab(tab);
                }}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 z-10 select-none",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>

                {badgeCount > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full text-[10px] px-1.5 py-0.2 leading-none font-bold",
                      tab === "invites"
                        ? "bg-rose-500 text-white"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input (visible in Discover tab) */}
        <AnimatePresence mode="wait">
          {activeTab === "discover" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full sm:w-64"
            >
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search public groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Tab Content with Smooth Transitions */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground"
          >
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs">Loading study groups...</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "my-groups" ? (
              myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    No Study Groups Yet
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">
                    Join an existing public study group from the Discover tab or
                    create your own study circle with friends.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("discover")}
                      className="text-xs"
                    >
                      Browse Groups
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCreateModalOpen(true)}
                      className="text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Group
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )
            ) : activeTab === "discover" ? (
              discoverGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
                  <Compass className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {searchQuery
                      ? "No matching study groups found"
                      : "No public study groups yet"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mb-4">
                    {searchQuery
                      ? "Try searching for another topic or exam target."
                      : "Be the first to create an open study pod for JEE aspirants!"}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Study Group
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoverGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onJoin={joinGroup}
                      isLoading={actionLoading[group.id]}
                    />
                  ))}
                </div>
              )
            ) : invites.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
                <Mail className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No Pending Invitations
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  When friends invite you to join their study groups, they will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invites.map((invite) => {
                  const group = invite.group;
                  const inviter = invite.inviter;
                  const isResponding = actionLoading[invite.id] || false;

                  return (
                    <div
                      key={invite.id}
                      className="flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {group?.name || "Study Group"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            Invited by{" "}
                            <span className="text-foreground font-medium">
                              {inviter?.full_name || "A friend"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {group?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 bg-muted/20 p-2 rounded-md">
                          {group.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 opacity-60" />
                          <span>
                            {new Date(invite.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToInvite(invite.id, false)}
                            disabled={isResponding}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => respondToInvite(invite.id, true)}
                            disabled={isResponding}
                            className="h-8 px-3 text-xs gap-1 font-medium"
                          >
                            {isResponding ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Accept
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={createGroup}
      />
    </div>
  );
}
