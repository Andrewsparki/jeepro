"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScopedUserModerationModal } from "./scoped-user-moderation-modal";
import { playHapticSound } from "@/lib/sound-effects";

interface AdminUserModerationTriggerProps {
  user: {
    id: string;
    full_name: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };
}

export function AdminUserModerationTrigger({ user }: AdminUserModerationTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          playHapticSound("click");
          setIsOpen(true);
        }}
        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-semibold gap-2 rounded-xl"
      >
        <ShieldAlert className="w-4 h-4" />
        User Moderation
      </Button>

      <ScopedUserModerationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetUser={user}
      />
    </>
  );
}
