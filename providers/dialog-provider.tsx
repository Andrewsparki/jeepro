"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DialogVariant = "default" | "destructive";

interface DialogOptions {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextValue {
  alert: (options: Omit<DialogOptions, "variant" | "cancelLabel">) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  type: "alert" | "confirm";
  resolve: (value: unknown) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const alert = (options: Omit<DialogOptions, "variant" | "cancelLabel">) => {
    return new Promise<void>((resolve) => {
      setDialogState({
        ...options,
        isOpen: true,
        type: "alert",
        variant: "default",
        resolve: () => resolve(),
      });
    });
  };

  const confirm = (options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        ...options,
        isOpen: true,
        type: "confirm",
        resolve: (val) => resolve(Boolean(val)),
      });
    });
  };

  const handleClose = useCallback((value: boolean) => {
    if (!dialogState) return;
    setDialogState({ ...dialogState, isOpen: false });
    setTimeout(() => {
      if (dialogState.type === "confirm") {
        (dialogState.resolve as (v: boolean) => void)(value);
      } else {
        (dialogState.resolve as (v: void) => void)();
      }
      setDialogState(null);
    }, 200); // Wait for exit animation
  }, [dialogState]);

  useEffect(() => {
    if (!dialogState?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(false);
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => confirmRef.current?.focus(), 50);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogState?.isOpen, handleClose]);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <AnimatePresence>
        {dialogState?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-md"
              onClick={() => {
                if (dialogState.variant !== "destructive") {
                  handleClose(false);
                }
              }}
              aria-hidden="true"
            />
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              role="dialog"
              aria-modal="true"
              className="relative z-[101] w-full max-w-[400px] rounded-2xl border border-white/10 bg-background/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {dialogState.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {dialogState.message}
              </p>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {dialogState.type === "confirm" && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
                  >
                    {dialogState.cancelLabel || "Cancel"}
                  </button>
                )}
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={() => handleClose(true)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 active:scale-95 ${
                    dialogState.variant === "destructive"
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 focus:ring-red-500/50"
                      : "bg-primary text-primary-foreground hover:brightness-110 focus:ring-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                  }`}
                >
                  {dialogState.confirmLabel || (dialogState.type === "alert" ? "OK" : "Confirm")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}
