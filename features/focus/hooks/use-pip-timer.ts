"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";

/**
 * Hook that manages the Document Picture-in-Picture window lifecycle.
 *
 * - Detects API support
 * - Opens / closes the PiP window
 * - Provides a container element for React createPortal
 * - Cleans up on unmount or when the PiP window is closed by the user
 */
export function usePipTimer() {
  const isPipSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && "documentPictureInPicture" in window,
    () => false
  );
  const [isPipOpen, setIsPipOpen] = useState(false);
  const [pipContainer, setPipContainer] = useState<HTMLDivElement | null>(null);

  /** The PiP Window reference */
  const pipWindowRef = useRef<Window | null>(null);

  const openPip = useCallback(async (): Promise<HTMLDivElement | null> => {
    if (!window.documentPictureInPicture) return null;

    // If already open, just return the existing container
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.focus();
      return pipContainer;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 340,
        height: 220,
      });

      pipWindowRef.current = pipWindow;

      // Inject minimal reset styles directly into the PiP document
      const style = pipWindow.document.createElement("style");
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0a0a0f;
          color: #e4e4e7;
          font-family: 'Google Sans', 'fontSans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          user-select: none;
        }

        #pip-root {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `;
      pipWindow.document.head.appendChild(style);

      // Create the portal container
      const container = pipWindow.document.createElement("div");
      container.id = "pip-root";
      pipWindow.document.body.appendChild(container);

      setPipContainer(container);
      setIsPipOpen(true);

      // When the user closes the PiP window (X button), we just update state — don't stop the timer
      pipWindow.addEventListener("pagehide", () => {
        setPipContainer(null);
        pipWindowRef.current = null;
        setIsPipOpen(false);
      });

      return container;
    } catch (err) {
      console.error("Failed to open Document PiP window:", err);
      return null;
    }
  }, []);

  const closePip = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
    }
    setPipContainer(null);
    pipWindowRef.current = null;
    setIsPipOpen(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  return {
    isPipSupported,
    isPipOpen,
    pipContainer,
    openPip,
    closePip,
  };
}
