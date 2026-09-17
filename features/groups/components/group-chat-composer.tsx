"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupChatComposerProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function GroupChatComposer({
  onSend,
  isSending,
  disabled = false,
  placeholder = "Message the study group... (Enter to send, Shift+Enter for new line)",
}: GroupChatComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    const success = await onSend(trimmed);
    if (success) {
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 120);
    textareaRef.current.style.height = `${nextHeight}px`;
  };

  return (
    <div className="relative flex items-end gap-2 p-3 bg-card/80 backdrop-blur-md border-t border-border/50 rounded-b-xl">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          maxLength={1000}
          rows={1}
          className={cn(
            "w-full resize-none rounded-lg border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 min-h-[38px] max-h-[120px]"
          )}
        />
        {content.length > 800 && (
          <span className="absolute right-3 bottom-1.5 text-[9px] text-muted-foreground">
            {1000 - content.length}
          </span>
        )}
      </div>

      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={!content.trim() || isSending || disabled}
        className="h-[38px] w-[38px] shrink-0 rounded-lg"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizontal className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
