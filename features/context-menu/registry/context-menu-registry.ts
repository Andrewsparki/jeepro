import {
  ContextActionResolver,
  ContextResolutionContext,
  ContextMenuItem,
  ContextDataRecord,
} from "../types/context-menu.types";
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  RotateCcw,
  Link as LinkIcon,
  ExternalLink,
  SquareArrowOutUpRight,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Generates browser-style link actions for navigable links.
 */
export function getLinkActions(linkHref: string): ContextMenuItem[] {
  const getAbsoluteUrl = (url: string) => {
    try {
      if (typeof window !== "undefined") {
        return new URL(url, window.location.origin).href;
      }
      return url;
    } catch {
      return url;
    }
  };

  const absoluteUrl = getAbsoluteUrl(linkHref);

  return [
    {
      id: "link-open-new-tab",
      label: "Open link in new tab",
      icon: ExternalLink,
      onClick: () => {
        if (typeof window !== "undefined") {
          window.open(absoluteUrl, "_blank", "noopener,noreferrer");
        }
      },
    },
    {
      id: "link-open-new-window",
      label: "Open link in new window",
      icon: SquareArrowOutUpRight,
      onClick: () => {
        if (typeof window !== "undefined") {
          window.open(absoluteUrl, "_blank", "width=1200,height=800,noopener,noreferrer");
        }
      },
    },
    {
      id: "link-copy-address",
      label: "Copy link address",
      icon: LinkIcon,
      onClick: () => {
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(absoluteUrl);
          toast.success("Link address copied to clipboard");
        }
      },
    },
  ];
}

/**
 * Generates the clean, minimal default universal JEE Pro actions.
 * - 'background': full default navigation suite for empty/canvas areas.
 * - 'target': streamlined universal actions appended beneath targeted actions.
 */
export function getUniversalActions(
  context: ContextResolutionContext,
  mode: "background" | "target"
): ContextMenuItem[] {
  const { pathname, router } = context;
  const isDashboardRoot = pathname === "/dashboard" || pathname === "/dashboard/";

  if (mode === "background") {
    const items: ContextMenuItem[] = [
      {
        id: "universal-back",
        label: "Navigate Back",
        icon: ArrowLeft,
        shortcut: "Alt+←",
        onClick: () => {
          if (typeof window !== "undefined") window.history.back();
        },
      },
      {
        id: "universal-forward",
        label: "Navigate Forward",
        icon: ArrowRight,
        shortcut: "Alt+→",
        onClick: () => {
          if (typeof window !== "undefined") window.history.forward();
        },
      },
    ];

    if (!isDashboardRoot) {
      items.push({
        id: "universal-dashboard",
        label: "Go to Dashboard",
        icon: LayoutDashboard,
        onClick: () => {
          if (router && typeof router.push === "function") {
            router.push("/dashboard");
          } else if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
          }
        },
      });
    }

    items.push({
      id: "universal-refresh",
      label: "Refresh Page",
      icon: RotateCcw,
      shortcut: "Ctrl+R",
      onClick: () => {
        if (router && typeof router.refresh === "function") {
          router.refresh();
        } else if (typeof window !== "undefined") {
          window.location.reload();
        }
        toast.success("Page refreshed");
      },
    });

    items.push({ id: "universal-sep", separator: true, label: "" });

    items.push({
      id: "universal-copy-link",
      label: "Copy Page Link",
      icon: LinkIcon,
      onClick: () => {
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Page link copied to clipboard");
        }
      },
    });

    return items;
  }

  // Target-specific context: contextual actions take priority; append clean universal actions
  return [
    {
      id: "universal-back",
      label: "Navigate Back",
      icon: ArrowLeft,
      onClick: () => {
        if (typeof window !== "undefined") window.history.back();
      },
    },
    {
      id: "universal-refresh",
      label: "Refresh Page",
      icon: RotateCcw,
      onClick: () => {
        if (router && typeof router.refresh === "function") {
          router.refresh();
        } else if (typeof window !== "undefined") {
          window.location.reload();
        }
        toast.success("Page refreshed");
      },
    },
    {
      id: "universal-copy-link",
      label: "Copy Page Link",
      icon: LinkIcon,
      onClick: () => {
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Page link copied to clipboard");
        }
      },
    },
  ];
}

/**
 * Intelligently merges link actions, contextual actions, and universal actions.
 * - Link actions (top)
 * - Contextual target actions (middle)
 * - Universal navigation actions (bottom)
 * Cleans duplicate copy actions and trailing separators.
 */
function mergeActions(
  linkActions: ContextMenuItem[],
  contextual: ContextMenuItem[],
  universal: ContextMenuItem[]
): ContextMenuItem[] {
  const hasLinkActions = linkActions.length > 0;

  // Filter contextual items to remove duplicate link copy items if linkActions present
  const cleanContextual = contextual.filter((item) => {
    if (!hasLinkActions) return true;
    const id = (item.id || "").toLowerCase();
    if (id.includes("copy") && (id.includes("link") || id.includes("url") || id.includes("address"))) {
      return false;
    }
    return true;
  });

  while (cleanContextual.length > 0 && cleanContextual[cleanContextual.length - 1].separator) {
    cleanContextual.pop();
  }

  // Filter universal items to remove duplicate "Copy Page Link" if linkActions present
  const cleanUniversal = universal.filter((item) => {
    if (hasLinkActions && item.id === "universal-copy-link") return false;
    return true;
  });

  const result: ContextMenuItem[] = [];

  if (linkActions.length > 0) {
    result.push(...linkActions);
  }

  if (cleanContextual.length > 0) {
    if (result.length > 0) {
      result.push({ id: "sep-link-contextual", separator: true, label: "" });
    }
    result.push(...cleanContextual);
  }

  if (cleanUniversal.length > 0) {
    if (result.length > 0) {
      result.push({ id: "sep-universal", separator: true, label: "" });
    }
    result.push(...cleanUniversal);
  }

  return result;
}

class ContextMenuRegistry {
  private resolvers = new Map<string, ContextActionResolver>();
  private pageBackgroundResolvers = new Map<string, ContextActionResolver>();

  /**
   * Register a context action resolver for a specific semantic target type
   * (e.g. 'study-topic', 'chat-message', 'planner-event', 'friend-card').
   */
  register<T = ContextDataRecord>(targetType: string, resolver: ContextActionResolver<T>): () => void {
    this.resolvers.set(targetType, resolver as ContextActionResolver);
    return () => {
      this.resolvers.delete(targetType);
    };
  }

  /**
   * Register a resolver for right-clicking the canvas / page background on a specific section.
   */
  registerPageBackground(section: string, resolver: ContextActionResolver): () => void {
    this.pageBackgroundResolvers.set(section, resolver);
    return () => {
      this.pageBackgroundResolvers.delete(section);
    };
  }

  getResolver(targetType: string): ContextActionResolver | undefined {
    return this.resolvers.get(targetType);
  }

  getPageBackgroundResolver(section: string): ContextActionResolver | undefined {
    return this.pageBackgroundResolvers.get(section);
  }

  /**
   * Resolves actions for a given context.
   * Prioritizes link actions at the top when right-clicking links.
   * Merges contextual target actions and universal navigation actions cleanly.
   */
  async resolve(context: ContextResolutionContext): Promise<ContextMenuItem[]> {
    const { target, section, linkHref } = context;

    const linkActions = linkHref ? getLinkActions(linkHref) : [];
    let contextualActions: ContextMenuItem[] = [];

    // 1. Explicit actions attached directly to target
    if (target.actions && target.actions.length > 0) {
      contextualActions = target.actions;
    }
    // 2. Page background resolution
    else if (target.type === "page-background") {
      const bgResolver = this.pageBackgroundResolvers.get(section);
      if (bgResolver) {
        const res = await bgResolver(context);
        if (res && res.length > 0) {
          contextualActions = res;
        }
      }
    }
    // 3. Registered semantic target resolver
    else {
      const resolver = this.resolvers.get(target.type);
      if (resolver) {
        const res = await resolver(context);
        if (res && res.length > 0) {
          contextualActions = res;
        }
      }
    }

    const universalMode = (target.type === "page-background" && !linkHref && contextualActions.length === 0)
      ? "background"
      : "target";

    const universalActions = getUniversalActions(context, universalMode);

    return mergeActions(linkActions, contextualActions, universalActions);
  }
}

export const contextMenuRegistry = new ContextMenuRegistry();

