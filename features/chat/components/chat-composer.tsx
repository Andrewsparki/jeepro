"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSendMessage: (content: string) => Promise<boolean>;
  disabled: boolean;
  disabledReason?: string | null;
  placeholder?: string;
}

const MAX_CHAR_COUNT = 1000;

export function ChatComposer({
  onSendMessage,
  disabled,
  disabledReason,
  placeholder,
}: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to accommodate multiline text up to ~140px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [content]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      const success = await onSendMessage(trimmed);
      if (success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          // Maintain focus on desktop for fast successive typing
          if (window.innerWidth > 768) {
            textareaRef.current.focus();
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = content.length;
  const isNearLimit = charCount > MAX_CHAR_COUNT * 0.9;
  const isAtLimit = charCount >= MAX_CHAR_COUNT;

  return (
    <div className="border-t border-border/40 bg-card/70 backdrop-blur-xl p-3 sm:p-4 shrink-0 z-20">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative flex items-end gap-2 bg-surface rounded-2xl border border-border/50 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/40 transition-all p-1.5 shadow-sm"
        >
          {/* Multiline Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHAR_COUNT) {
                setContent(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? disabledReason || "Chat is currently unavailable..."
                : placeholder || "Message Global Chat... (Enter to send, Shift+Enter for new line)"
            }
            disabled={disabled || isSubmitting}
            className={cn(
              "flex-1 bg-transparent border-none text-foreground text-sm resize-none px-3 py-2 outline-none max-h-[140px] leading-relaxed placeholder:text-muted-foreground/60 overflow-y-auto",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label="Chat message input"
          />

          {/* Char Counter (shown when user is typing) */}
          {charCount > 0 && (
            <span
              className={cn(
                "text-[10px] font-mono select-none px-1 py-1 shrink-0 transition-colors",
                isAtLimit
                  ? "text-destructive font-bold"
                  : isNearLimit
                  ? "text-warning"
                  : "text-muted-foreground/50"
              )}
            >
              {charCount}/{MAX_CHAR_COUNT}
            </span>
          )}

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={disabled || isSubmitting || !content.trim()}
            className={cn(
              "h-9 w-9 rounded-xl shrink-0 transition-all text-accent-foreground",
              content.trim()
                ? "bg-accent hover:bg-accent/90 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-current" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Small accessibility tip for desktop */}
        <p className="hidden sm:flex items-center justify-between text-[11px] text-muted-foreground/50 mt-1 px-2">
          <span>Be respectful and follow the community honor code</span>
          <span>Shift + Enter for new line</span>
        </p>
      </div>
    </div>
  );
}
