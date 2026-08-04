"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return context;
}
