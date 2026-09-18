"use client";

import { useEffect } from "react";
import { ContextActionResolver, ContextDataRecord } from "../types/context-menu.types";
import { contextMenuRegistry } from "../registry/context-menu-registry";

/**
 * Hook for pages and components to register custom contextual action resolvers
 * for a specific semantic target type.
 */
export function useRegisterContextMenu<T = ContextDataRecord>(
  targetType: string,
  resolver: ContextActionResolver<T>,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    return contextMenuRegistry.register(targetType, resolver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, ...deps]);
}

/**
 * Hook for pages to register custom background context actions for their specific section.
 */
export function useRegisterPageBackground(
  section: string,
  resolver: ContextActionResolver,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    return contextMenuRegistry.registerPageBackground(section, resolver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, ...deps]);
}
