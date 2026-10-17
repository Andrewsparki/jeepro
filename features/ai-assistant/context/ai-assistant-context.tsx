"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AiAssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openWithPrompt: (prompt: string, context?: { subject?: string; chapter?: string }) => void;
  contextData?: { subject?: string; chapter?: string };
}

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(undefined);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<{ subject?: string; chapter?: string } | undefined>(undefined);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  const openWithPrompt = (prompt: string, ctx?: { subject?: string; chapter?: string }) => {
    setContextData(ctx);
    setInitialPrompt(prompt);
    setIsOpen(true);
  };

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openWithPrompt,
        contextData,
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error("useAiAssistant must be used within an AiAssistantProvider");
  }
  return context;
}
