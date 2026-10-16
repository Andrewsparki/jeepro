"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { dispatchInteractionSound } from "@/lib/sound-engine";

interface BreakRoomContextType {
  isOpen: boolean;
  openBreakRoom: () => void;
  closeBreakRoom: () => void;
  toggleBreakRoom: () => void;
}

const BreakRoomContext = createContext<BreakRoomContextType | undefined>(undefined);

export function BreakRoomProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openBreakRoom = useCallback(() => {
    dispatchInteractionSound("ui.open");
    setIsOpen(true);
  }, []);

  const closeBreakRoom = useCallback(() => {
    dispatchInteractionSound("ui.close");
    setIsOpen(false);
  }, []);

  const toggleBreakRoom = useCallback(() => {
    setIsOpen((prev) => {
      dispatchInteractionSound(!prev ? "ui.open" : "ui.close");
      return !prev;
    });
  }, []);

  return (
    <BreakRoomContext.Provider
      value={{
        isOpen,
        openBreakRoom,
        closeBreakRoom,
        toggleBreakRoom,
      }}
    >
      {children}
    </BreakRoomContext.Provider>
  );
}

export function useBreakRoom() {
  const context = useContext(BreakRoomContext);
  if (!context) {
    throw new Error("useBreakRoom must be used within a BreakRoomProvider");
  }
  return context;
}
