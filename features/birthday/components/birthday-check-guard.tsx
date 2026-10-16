"use client";

import React from "react";
import { useBirthdayMode } from "@/features/birthday/context/birthday-mode-context";
import { BirthdayCelebrationModal } from "@/features/birthday/components/birthday-celebration-modal";

export function BirthdayCheckGuard() {
  const { isModalOpen, closeRecapModal, recapData } = useBirthdayMode();

  if (!isModalOpen) return null;

  return (
    <BirthdayCelebrationModal
      isOpen={isModalOpen}
      onClose={closeRecapModal}
      initialRecapData={recapData}
    />
  );
}
