"use client";

import { useEffect, useRef } from "react";
import { useBreakRoom } from "../context/break-room-context";

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

const TRIGGER_WORD = "bored";
const SEQUENCE_LENGTH = TRIGGER_WORD.length;

export function BreakRoomKeyboardListener() {
  const { openBreakRoom, isOpen } = useBreakRoom();
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do nothing if Break Room is already open or during composition
      if (isOpen || e.isComposing) {
        return;
      }

      // Exclude modifier keys or non-character keys
      if (e.ctrlKey || e.metaKey || e.altKey) {
        bufferRef.current = [];
        return;
      }

      // Exclude text fields, inputs, contentEditable, modals with form controls
      if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) {
        bufferRef.current = [];
        return;
      }

      // Check if it's a standard single letter
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        bufferRef.current.push(e.key.toLowerCase());

        if (bufferRef.current.length > SEQUENCE_LENGTH) {
          bufferRef.current.shift();
        }

        if (bufferRef.current.length === SEQUENCE_LENGTH) {
          const currentWord = bufferRef.current.join("");
          if (currentWord === TRIGGER_WORD) {
            bufferRef.current = [];
            openBreakRoom();
          }
        }
      } else {
        // Any non-alpha key clears the sequence buffer
        bufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openBreakRoom, isOpen]);

  return null;
}
