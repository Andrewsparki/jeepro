"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { Modal } from "@/components/ui/modal";

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
    }, 200);
  }, [dialogState]);

  useEffect(() => {
    if (!dialogState?.isOpen) return;
    setTimeout(() => confirmRef.current?.focus(), 50);
  }, [dialogState?.isOpen]);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Modal
        isOpen={Boolean(dialogState?.isOpen)}
        onClose={() => handleClose(false)}
        closeOnOutsideClick={dialogState?.variant !== "destructive"}
        className="max-w-[400px] p-6 sm:p-8"
      >
        {dialogState && (
          <>
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
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95 cursor-pointer"
                >
                  {dialogState.cancelLabel || "Cancel"}
                </button>
              )}
              <button
                ref={confirmRef}
                type="button"
                onClick={() => handleClose(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 active:scale-95 cursor-pointer ${
                  dialogState.variant === "destructive"
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 focus:ring-red-500/50"
                    : "bg-primary text-primary-foreground hover:brightness-110 focus:ring-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                }`}
              >
                {dialogState.confirmLabel || (dialogState.type === "alert" ? "OK" : "Confirm")}
              </button>
            </div>
          </>
        )}
      </Modal>
    </DialogContext.Provider>
  );
}
