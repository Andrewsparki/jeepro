"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function useAiAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (textToSend?: string, context?: { subject?: string; chapter?: string }) => {
      const prompt = (textToSend || input).trim();
      if (!prompt || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      };

      const assistantMessageId = `assistant-${Date.now()}`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      // Keep recent completed messages within sensible token limit (exclude empty or placeholder messages)
      const previousTurns = messages
        .filter((m) => m.content && m.content.trim().length > 0)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      // Abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            history: previousTurns,
            context,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.error || errorData?.hint || `Error ${response.status}: Failed to get response`;
          
          if (response.status === 429) {
            toast.error("Rate limit reached. Please wait a moment before trying again.");
          } else if (response.status === 503) {
            toast.error("Gemini API key is not configured.", {
              description: errorData?.hint || "Please configure GEMINI_API_KEY in server environment variables.",
            });
          } else {
            toast.error(errorMessage);
          }

          setError(errorMessage);
          // Remove the empty placeholder assistant message
          setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
          setIsLoading(false);
          return;
        }

        // Stream reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream received from server.");
        }

        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg
            )
          );
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        const msg = err?.message || "Failed to stream AI response";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, messages]
  );

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGenerating,
  };
}
