"use client";

import React from "react";

/**
 * FixedPortal pass-through container.
 * With native compositor scrolling, fixed-position elements (Navbars, Sidebars, Modals)
 * render naturally in-tree with zero portaling overhead or hydration cascading.
 */
export function FixedPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
