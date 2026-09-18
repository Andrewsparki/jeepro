"use client";

import React from "react";
import { ContextMenuItem } from "../types/context-menu.types";
import { ContextMenuTarget } from "./context-menu-target";

interface ContextMenuTriggerProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  title?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * ContextMenuTrigger provides an easy declarative wrapper to associate explicit
 * contextual actions with a DOM subtree. It delegates to ContextMenuTarget,
 * ensuring all right-click events are processed by the single global listener
 * and automatically merged with JEE Pro universal actions.
 */
export function ContextMenuTrigger({
  children,
  items,
  title,
  className,
  disabled = false,
}: ContextMenuTriggerProps) {
  if (disabled || !items || items.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <ContextMenuTarget
      type="component-trigger"
      title={title}
      actions={items}
      className={className}
    >
      {children}
    </ContextMenuTarget>
  );
}

