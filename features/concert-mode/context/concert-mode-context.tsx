"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConcertModeContextType {
  isOpen: boolean;
  openConcert: () => void;
  closeConcert: () => void;
  toggleConcert: () => void;
}

const ConcertModeContext = createContext<ConcertModeContextType | undefined>(undefined);

export function ConcertModeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openConcert = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeConcert = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleConcert = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <ConcertModeContext.Provider
      value={{
        isOpen,
        openConcert,
        closeConcert,
        toggleConcert,
      }}
    >
      {children}
    </ConcertModeContext.Provider>
  );
}

export function useConcertMode() {
  const context = useContext(ConcertModeContext);
  if (!context) {
    throw new Error("useConcertMode must be used within a ConcertModeProvider");
  }
  return context;
}
