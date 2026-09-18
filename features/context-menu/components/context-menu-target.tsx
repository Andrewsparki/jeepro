"use client";

import React, { useEffect, useRef } from "react";
import { ContextMenuItem, ContextDataRecord } from "../types/context-menu.types";
import { registerTargetElement, unregisterTargetElement } from "../utils/target-resolver";

interface ContextMenuTargetProps {
  children: React.ReactNode;
  type: string;
  id?: string;
  title?: string;
  data?: ContextDataRecord;
  actions?: ContextMenuItem[];
  className?: string;
  asChild?: boolean;
}

/**
 * ContextMenuTarget marks a subtree as a semantic target for the global
 * context-menu system. It registers metadata with the element so the single
 * global context-menu listener can resolve appropriate actions on right-click.
 */
export function ContextMenuTarget({
  children,
  type,
  id,
  title,
  data,
  actions,
  className,
  asChild = false,
}: ContextMenuTargetProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    registerTargetElement(el, {
      type,
      id,
      title,
      data,
      actions,
    });

    return () => {
      unregisterTargetElement(el);
    };
  }, [type, id, title, data, actions]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ref: elementRef,
      "data-context-target": type,
      "data-context-id": id,
      "data-context-title": title,
    });
  }

  return (
    <div
      ref={elementRef}
      className={className}
      data-context-target={type}
      data-context-id={id}
      data-context-title={title}
    >
      {children}
    </div>
  );
}
