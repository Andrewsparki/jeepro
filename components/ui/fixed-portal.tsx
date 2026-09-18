"use client";

import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

/**
 * FixedPortal renders children into document.body on client mount to ensure
 * fixed-position overlays break out of any ancestor transforms, layout filters, or scroll containers.
 */
export function FixedPortal({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || typeof document === "undefined") {
    return <>{children}</>;
  }

  return createPortal(children, document.body);
}
