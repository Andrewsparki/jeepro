"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ContextMenuItem, ContextMenuState } from "../types/context-menu.types";
import { ContextMenuModal } from "../components/context-menu-modal";
import { findContextTarget, isEditableElement, findLinkHref } from "../utils/target-resolver";
import { getSectionFromPathname, isAuthenticatedRoute, getSectionTitle } from "../utils/route-helper";
import { contextMenuRegistry } from "../registry/context-menu-registry";
import { initDefaultResolvers } from "../registry/default-resolvers";
import { dispatchInteractionSound } from "@/lib/sound-engine";

// Initialize standard resolvers once
initDefaultResolvers();

interface ContextMenuContextType {
  openContextMenu: (
    coords: { clientX: number; clientY: number },
    items: ContextMenuItem[],
    title?: string,
    targetType?: string
  ) => void;
  closeContextMenu: () => void;
  state: ContextMenuState;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    title: undefined,
    items: [],
    targetType: undefined,
  });

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closeContextMenu = useCallback(() => {
    setState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  }, []);

  const openContextMenu = useCallback(
    (
      coords: { clientX: number; clientY: number },
      items: ContextMenuItem[],
      title?: string,
      targetType?: string
    ) => {
      dispatchInteractionSound("ui.contextMenu");
      setState({
        isOpen: true,
        x: coords.clientX,
        y: coords.clientY,
        title,
        items,
        targetType,
      });
    },
    []
  );

  // ── SINGLE GLOBAL CONTEXTMENU LISTENER ──
  useEffect(() => {
    const handleGlobalContextMenu = async (e: MouseEvent) => {
      // 0. Only intercept on authenticated JEE Pro routes; preserve native context menu on public/marketing pages
      if (!isAuthenticatedRoute(pathname)) return;

      // 1. Preserve browser context menu if Shift key is pressed
      if (e.shiftKey) return;

      // 2. Preserve native browser context menu for inputs, textareas, contenteditable, text selection
      if (isEditableElement(e.target)) return;

      // 3. Identify semantic target & link target
      const resolved = findContextTarget(e.target as HTMLElement, pathname);
      if (!resolved) return;

      const { target, element } = resolved;
      const section = getSectionFromPathname(pathname);
      const linkHref = findLinkHref(e.target as HTMLElement) || (target.data?.href as string | undefined) || (target.data?.url as string | undefined) || null;

      // 4. Resolve registered actions
      const items = await contextMenuRegistry.resolve({
        target,
        pathname,
        section,
        event: e,
        targetElement: element,
        router,
        linkHref,
      });

      // 5. Render custom JEE Pro context menu
      if (items && items.length > 0) {
        e.preventDefault();
        const displayTitle = target.title || (linkHref ? undefined : (target.type === "page-background" ? getSectionTitle(pathname) : undefined));
        openContextMenu({ clientX: e.clientX, clientY: e.clientY }, items, displayTitle, target.type);
      } else {
        closeContextMenu();
      }
    };

    // ── MOBILE TOUCH LONG-PRESS SUPPORT ──
    const handleTouchStart = (e: TouchEvent) => {
      if (!isAuthenticatedRoute(pathname) || e.touches.length > 1 || isEditableElement(e.target)) return;
      const touch = e.touches[0];
      const coords = { clientX: touch.clientX, clientY: touch.clientY };

      touchTimerRef.current = setTimeout(async () => {
        const resolved = findContextTarget(e.target as HTMLElement, pathname);
        if (!resolved) return;

        const { target, element } = resolved;
        const section = getSectionFromPathname(pathname);
        const linkHref = findLinkHref(e.target as HTMLElement) || (target.data?.href as string | undefined) || (target.data?.url as string | undefined) || null;

        const items = await contextMenuRegistry.resolve({
          target,
          pathname,
          section,
          event: e,
          targetElement: element,
          router,
          linkHref,
        });

        if (items && items.length > 0) {
          const displayTitle = target.title || (linkHref ? undefined : (target.type === "page-background" ? getSectionTitle(pathname) : undefined));
          openContextMenu(coords, items, displayTitle, target.type);
        }
      }, 550);
    };

    const clearTouch = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    window.addEventListener("contextmenu", handleGlobalContextMenu);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", clearTouch, { passive: true });
    window.addEventListener("touchend", clearTouch, { passive: true });

    return () => {
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", clearTouch);
      window.removeEventListener("touchend", clearTouch);
      clearTouch();
    };
  }, [pathname, router, openContextMenu, closeContextMenu]);

  // Close context menu on window scroll or resize
  useEffect(() => {
    if (!state.isOpen) return;

    const handleScrollOrResize = () => closeContextMenu();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [state.isOpen, closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu, state }}>
      {children}
      <ContextMenuModal />
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider");
  }
  return context;
}
