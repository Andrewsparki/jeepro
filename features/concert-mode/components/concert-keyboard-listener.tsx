"use client";

import { useEffect, useRef } from "react";
import { useConcertMode } from "../context/concert-mode-context";

/**
 * Checks if the event target is an editable input, textarea, contenteditable,
 * chat composer, or if a composite IME session is underway.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  // Check closest editable container
  if (target.closest("input, textarea, [contenteditable='true'], [role='textbox']")) {
    return true;
  }

  return false;
}

// The exact standalone word trigger for Concert Mode
const TRIGGER_WORDS = ["concert"];
const MAX_WORD_LENGTH = Math.max(...TRIGGER_WORDS.map((w) => w.length));

export function ConcertKeyboardListener() {
  const { openConcert, isOpen } = useConcertMode();
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do nothing if already open or IME composing
      if (isOpen || e.isComposing) {
        return;
      }

      // Ignore modifier combinations (Ctrl+C, Cmd+K, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        bufferRef.current = [];
        return;
      }

      // Exclude text fields, inputs, contentEditable, search, chat
      if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) {
        bufferRef.current = [];
        return;
      }

      // Check for single alpha characters
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        bufferRef.current.push(e.key.toLowerCase());

        if (bufferRef.current.length > MAX_WORD_LENGTH + 2) {
          bufferRef.current.shift();
        }

        const bufferStr = bufferRef.current.join("");
        for (const trigger of TRIGGER_WORDS) {
          if (bufferStr.endsWith(trigger)) {
            bufferRef.current = [];
            openConcert();
            return;
          }
        }
      } else {
        // Any non-letter clears the buffer
        bufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openConcert, isOpen]);

  return null;
}
