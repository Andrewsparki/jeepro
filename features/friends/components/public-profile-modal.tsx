"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FriendsService } from "../services/friends.service";
import { PublicProfile } from "../types/friends.types";
import {
  UserPlus,
  UserCheck,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Loader2,
  Calendar,
  MessageSquare,
  X,
} from "lucide-react";

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export function PublicProfileModal({
  userId,
  isOpen,
  onClose,
  onActionComplete,
}: PublicProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isLoading = isOpen && !!userId && (!profile || profile.id !== userId);

  useEffect(() => {
    if (!userId || !isOpen) return;

    let isMounted = true;
    FriendsService.getPublicProfile(userId)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching public profile:", err);
      });

    return () => {
      isMounted = false;
      setProfile(null);
    };
  }, [userId, isOpen]);

  const handleSendRequest = async () => {
    if (!profile || isProcessing) return;
    setIsProcessing(true);
    try {
      await FriendsService.sendFriendRequest(profile.id);
      setProfile((prev) => prev ? { ...prev, friendshipStatus: "pending", isRequester: true } : null);
      if (onActionComplete) onActionComplete();
    } catch {
      // Toast is handled in caller or service
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!profile?.friendshipId || isProcessing) return;
    setIsProcessing(true);
    try {
      await FriendsService.acceptFriendRequest(profile.friendshipId);
      setProfile((prev) => prev ? { ...prev, friendshipStatus: "accepted" } : null);
      if (onActionComplete) onActionComplete();
    } catch {
      // Handled
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile?.friendshipId || isProcessing) return;
    setIsProcessing(true);
    try {
      await FriendsService.removeFriend(profile.friendshipId);
      setProfile((prev) => prev ? { ...prev, friendshipStatus: "none" } : null);
      if (onActionComplete) onActionComplete();
    } catch {
      // Handled
    } finally {
      setIsProcessing(false);
    }
  };

  const initial = (profile?.full_name || "A").charAt(0).toUpperCase();
  const memberYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md p-6 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs text-muted-foreground animate-pulse">Loading aspirant profile...</p>
          </div>
        ) : !profile ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Aspirant profile could not be found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: Avatar, Name, Target */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-2xl text-accent shadow-md overflow-hidden">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-background px-2 py-0.5 rounded-full border border-border/60 text-[10px] font-bold text-accent shadow-sm">
                  Lvl {profile.stats?.level || 1}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">{profile.full_name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                  <span>{profile.target_exam || "JEE Aspirant"}</span>
                  {profile.target_year && (
                    <>
                      <span>•</span>
                      <span>Target {profile.target_year}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Public Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-surface border border-border/40">
              <div className="flex flex-col items-center text-center p-2">
                <Award className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-sm font-bold text-foreground">
                  {profile.stats?.totalXP || 0}
                </span>
                <span className="text-[10px] text-muted-foreground">Total XP</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 border-x border-border/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-sm font-bold text-foreground">
                  {profile.stats?.masteredTopicsCount || 0}
                </span>
                <span className="text-[10px] text-muted-foreground">Mastered</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <BookOpen className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-sm font-bold text-foreground">
                  {profile.stats?.studySessionsCount || 0}
                </span>
                <span className="text-[10px] text-muted-foreground">Sessions</span>
              </div>
            </div>

            {/* Member Since Footnote */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>Aspirant on JEE Pro since {memberYear}</span>
            </div>

            {/* Friendship Action Button */}
            <div className="pt-2">
              {profile.friendshipStatus === "accepted" ? (
                <div className="flex items-center gap-2">
                  <Link href={`/chat/${profile.id}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold gap-1.5 rounded-xl"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFriend}
                    disabled={isProcessing}
                    className="h-10 text-xs text-muted-foreground hover:text-destructive border-border/40 hover:border-destructive/30 rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              ) : profile.friendshipStatus === "pending" ? (
                profile.isRequester ? (
                  <div className="flex items-center justify-center gap-2 h-10 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground text-xs font-medium">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Friend Request Sent</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleAcceptRequest}
                      disabled={isProcessing}
                      className="flex-1 h-10 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      Accept Request
                    </Button>
                  </div>
                )
              ) : (
                <Button
                  onClick={handleSendRequest}
                  disabled={isProcessing}
                  className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold gap-2 rounded-xl"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </Button>
              )}
            </div>
          </div>
        )}
    </Modal>
  );
}
