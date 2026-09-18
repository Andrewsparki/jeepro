"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { useContextMenu } from "../context/context-menu-context";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";

export function ContextMenuModal() {
  const { state, closeContextMenu } = useContextMenu();
  const { isOpen, x, y, title, items } = state;
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset focus on open (Render phase state update)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setFocusedIndex(-1);
  }

  // Calculate adjusted coords during render phase with viewport collision handling
  const getAdjustedCoords = () => {
    if (!isOpen || typeof window === "undefined") return { x: 0, y: 0 };
    const menuWidth = 220;
    const itemHeight = 36;
    const headerHeight = title ? 36 : 0;
    const estimatedHeight = (items.length * itemHeight) + headerHeight + 16;
    const padding = 12;

    let adjustedX = x;
    let adjustedY = y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (adjustedX + menuWidth > viewportWidth - padding) {
      adjustedX = Math.max(padding, viewportWidth - menuWidth - padding);
    }

    if (adjustedY + estimatedHeight > viewportHeight - padding) {
      adjustedY = Math.max(padding, viewportHeight - estimatedHeight - padding);
    }

    return { x: adjustedX, y: adjustedY };
  };

  const coords = getAdjustedCoords();

  // Click outside and keydown handlers
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeContextMenu();
        return;
      }

      const selectableItems = items.filter(item => !item.separator && !item.disabled);
      if (selectableItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1;
          return next >= items.length ? 0 : next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? items.length - 1 : next;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const selected = items[focusedIndex];
          if (selected && !selected.disabled && !selected.separator && selected.onClick) {
            selected.onClick();
            closeContextMenu();
          }
        }
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, items, focusedIndex, closeContextMenu]);

  return (
    <FixedPortal>
      <AnimatePresence>
        {isOpen && items.length > 0 && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            style={{
              position: "fixed",
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              zIndex: 1000,
            }}
            className="w-56 bg-background/95 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl p-1.5 text-xs font-medium focus:outline-none select-none"
            role="menu"
            aria-orientation="vertical"
            tabIndex={-1}
          >
            {title && (
              <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border/40 truncate mb-1">
                {title}
              </div>
            )}

            <div className="space-y-0.5">
              {items.map((item, idx) => {
                if (item.separator) {
                  return (
                    <div
                      key={item.id || `sep-${idx}`}
                      className="h-px bg-border/40 my-1 mx-1"
                      role="separator"
                    />
                  );
                }

                const Icon = item.icon;
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={item.id}
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.disabled) return;
                      dispatchInteractionSound(item.danger ? "feedback.warning" : "ui.select");
                      if (item.onClick) item.onClick();
                      closeContextMenu();
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left gap-3 group outline-none",
                      item.disabled && "opacity-40 cursor-not-allowed",
                      !item.disabled && item.danger && (isFocused ? "bg-rose-500/15 text-rose-400 font-semibold" : "text-rose-400 hover:bg-rose-500/10"),
                      !item.disabled && !item.danger && (isFocused ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-surface-hover hover:text-foreground")
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {Icon && (
                        <Icon className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          item.danger ? "text-rose-400" : isFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.shortcut && (
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground/70 tracking-wider uppercase">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FixedPortal>
  );
}
