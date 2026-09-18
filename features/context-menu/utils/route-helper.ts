export function getSectionFromPathname(pathname: string): string {
  if (!pathname) return "general";
  
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "dashboard";
  }
  
  const parts = pathname.split("/").filter(Boolean);
  
  if (parts[0] === "dashboard") {
    if (parts.length === 1) return "dashboard";
    const sub = parts[1];
    
    if (sub === "study") {
      if (parts.length >= 4) return "workspace"; // /dashboard/study/:subject/:chapter
      if (parts.length === 3) return "chapter-list"; // /dashboard/study/:subject
      return "study";
    }
    
    return sub; // chat, friends, leaderboard, focus, analytics, history, settings, planner, etc.
  }
  
  return parts[0] || "general";
}

/**
 * Determines whether the current route belongs to the authenticated JEE Pro application.
 * Marketing, unauthenticated auth routes, and landing pages return false to preserve
 * native browser context menu behavior.
 */
export function isAuthenticatedRoute(pathname: string): boolean {
  if (!pathname) return false;

  const publicExact = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/maintenance",
  ];
  if (publicExact.includes(pathname)) return false;

  const publicPrefixes = [
    "/login/",
    "/signup/",
    "/forgot-password/",
    "/reset-password/",
    "/maintenance/",
    "/about",
    "/pricing",
  ];
  if (publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return false;
  }

  const authenticatedPrefixes = [
    "/dashboard",
    "/admin",
    "/chat",
    "/friends",
    "/groups",
    "/leaderboard",
    "/achievements",
  ];

  return authenticatedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

/**
 * Returns a human-friendly title for the context menu header based on current route/section.
 */
export function getSectionTitle(pathname: string): string {
  const section = getSectionFromPathname(pathname);
  switch (section) {
    case "dashboard":
      return "JEE Pro Dashboard";
    case "study":
    case "workspace":
    case "chapter-list":
      return "Study Workspace";
    case "planner":
      return "Study Planner";
    case "focus":
      return "Focus Mode";
    case "analytics":
      return "Study Analytics";
    case "history":
      return "Study History";
    case "chat":
      return "Global Chat";
    case "friends":
      return "Friends & Network";
    case "leaderboard":
      return "JEE Pro Leaderboard";
    case "achievements":
      return "Achievements";
    case "groups":
      return "Study Groups";
    case "support":
      return "Help & Support";
    case "settings":
      return "Settings";
    case "syllabus":
      return "Syllabus";
    case "admin":
      return "Admin Centre";
    default:
      return "JEE Pro";
  }
}

