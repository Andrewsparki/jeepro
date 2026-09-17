"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GroupsService } from "../services/groups.service";
import { StudyGroup } from "../types/groups.types";
import { useGroupChat } from "../hooks/use-group-chat";
import { useGroupMembers } from "../hooks/use-group-members";
import { GroupChatMessageList } from "./group-chat-message-list";
import { GroupChatComposer } from "./group-chat-composer";
import { GroupMembersList } from "./group-members-list";
import { InviteFriendsModal } from "./invite-friends-modal";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Rocket,
  Target,
  Brain,
  Trophy,
  ArrowLeft,
  Users,
  UserPlus,
  LogOut,
  Lock,
  Globe,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  atom: Atom,
  flask: FlaskConical,
  calculator: Calculator,
  rocket: Rocket,
  target: Target,
  brain: Brain,
  trophy: Trophy,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
};

export function GroupDetailView({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Modals & Panels
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [membersSheetOpen, setMembersSheetOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Group Chat hook
  const {
    messages,
    isLoading: isChatLoading,
    isLoadingOlder,
    hasMore,
    isSending,
    sendMessage,
    deleteMessage,
    loadOlderMessages,
  } = useGroupChat(groupId);

  // Group Members hook
  const {
    members,
    invitableFriends,
    isLoading: isMembersLoading,
    isLoadingFriends,
    actionLoading,
    loadInvitableFriends,
    removeMember,
    inviteFriend,
  } = useGroupMembers(groupId);

  useEffect(() => {
    let ignore = false;
    async function fetchGroup() {
      try {
        const data = await GroupsService.getGroupDetails(groupId);
        if (!ignore) {
          setGroup(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load study group.";
          setGroupError(msg);
          toast.error(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoadingGroup(false);
        }
      }
    }
    void fetchGroup();
    return () => {
      ignore = true;
    };
  }, [groupId]);

  const handleOpenInvite = () => {
    loadInvitableFriends();
    setInviteModalOpen(true);
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await GroupsService.leaveGroup(groupId);
      toast.success("You left the study group.");
      router.push("/groups");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to leave group.";
      toast.error(msg);
    } finally {
      setIsLeaving(false);
      setLeaveDialogOpen(false);
    }
  };

  if (isLoadingGroup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs">Loading study group details...</p>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-sm mx-auto p-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">Access Restricted</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {groupError || "You must be a member of this study group to view its chat and participants."}
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link href="/groups">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Study Groups
          </Link>
        </Button>
      </div>
    );
  }

  const IconComponent = ICON_MAP[group.avatar_icon] || BookOpen;
  const colorTheme = COLOR_MAP[group.avatar_color] || COLOR_MAP.blue;
  const currentUserId = user?.id || "";
  const isOwner = group.user_role === "owner";

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-7xl mx-auto rounded-xl border border-border/50 bg-background/60 backdrop-blur-md overflow-hidden shadow-xs">
      {/* ─── GROUP TOP HEADER ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 bg-card/70 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
            <Link href="/groups" title="Back to Study Groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0",
              colorTheme.bg,
              colorTheme.text,
              colorTheme.border
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground truncate tracking-tight">
                {group.name}
              </h2>
              {group.is_private ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.2 text-[10px] font-medium text-amber-500 shrink-0">
                  <Lock className="h-2.5 w-2.5" />
                  Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.2 text-[10px] font-medium text-emerald-500 shrink-0">
                  <Globe className="h-2.5 w-2.5" />
                  Public
                </span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground truncate">
              {group.member_count} {group.member_count === 1 ? "member" : "members"}
              {group.description ? ` • ${group.description}` : ""}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenInvite}
            className="h-8 px-2.5 text-xs font-medium gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite Friends</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setMembersSheetOpen(true)}
            className="h-8 px-2.5 text-xs font-medium gap-1.5 lg:hidden"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Members</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLeaveDialogOpen(true)}
            className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-destructive gap-1"
            title="Leave group"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>

      {/* ─── MAIN CONTENT: CHAT & MEMBER SIDEBAR ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Stream & Composer */}
        <div className="flex flex-col flex-1 min-w-0 bg-background/40">
          <GroupChatMessageList
            messages={messages}
            currentUserId={currentUserId}
            currentUserRole={group.user_role || null}
            isLoading={isChatLoading}
            isLoadingOlder={isLoadingOlder}
            hasMore={hasMore}
            onLoadOlder={loadOlderMessages}
            onDeleteMessage={deleteMessage}
          />

          <GroupChatComposer
            onSend={sendMessage}
            isSending={isSending}
            disabled={!group.is_member}
          />
        </div>

        {/* Desktop Right Column: Group Members Roster */}
        <div className="hidden lg:flex flex-col w-72 border-l border-border/40 bg-card/40 p-4 shrink-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Members ({members.length})
            </h3>
            {isOwner && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <Shield className="h-3 w-3 text-amber-500" />
                Moderator
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {isMembersLoading ? (
              <div className="flex justify-center p-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <GroupMembersList
                members={members}
                currentUserRole={group.user_role || null}
                currentUserId={currentUserId}
                onRemoveMember={removeMember}
                actionLoading={actionLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Members Sheet */}
      <Sheet open={membersSheetOpen} onOpenChange={setMembersSheetOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 p-5 flex flex-col">
          <SheetHeader className="text-left pb-4 border-b border-border/40">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Group Members ({members.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-3">
            <GroupMembersList
              members={members}
              currentUserRole={group.user_role || null}
              currentUserId={currentUserId}
              onRemoveMember={removeMember}
              actionLoading={actionLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        friends={invitableFriends}
        isLoading={isLoadingFriends}
        onInvite={inviteFriend}
        actionLoading={actionLoading}
      />

      {/* Leave Group Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Leave Study Group?</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {isOwner && members.length > 1
                ? "As the owner, you cannot leave while other members remain. Please promote another member to owner first."
                : isOwner && members.length <= 1
                ? "You are the only member. Leaving will permanently delete this study group and its chat history."
                : "Are you sure you want to leave this study group? You will lose access to its messages."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLeaveGroup}
              disabled={isLeaving || (isOwner && members.length > 1)}
            >
              {isLeaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Leave Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
