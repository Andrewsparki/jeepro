import { useEffect } from "react";
import { useFocusStore } from "../store/focus-store";

interface FocusShortcutsProps {
  onTogglePlayPause: () => void;
  onRestart: () => void;
  onStartBreak: () => void;
  onOpenNote: () => void;
}

export function useKeyboardShortcuts({
  onTogglePlayPause,
  onRestart,
  onStartBreak,
  onOpenNote
}: FocusShortcutsProps) {
  const { isImmersive, toggleImmersive, setIsImmersive } = useFocusStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault(); // Prevent page scroll
          onTogglePlayPause();
          break;
        case "f":
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
          } else {
            document.exitFullscreen().catch(console.error);
          }
          break;
        case "m":
          e.preventDefault();
          toggleImmersive();
          break;
        case "escape":
          // The browser handles exiting fullscreen natively via ESC,
          // but we also want to exit immersive mode if it's active.
          if (isImmersive) {
            setIsImmersive(false);
          }
          break;
        case "r":
          e.preventDefault();
          onRestart();
          break;
        case "b":
          e.preventDefault();
          onStartBreak();
          break;
        case "n":
          e.preventDefault();
          onOpenNote();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isImmersive,
    setIsImmersive,
    toggleImmersive,
    onTogglePlayPause,
    onRestart,
    onStartBreak,
    onOpenNote,
  ]);
}
