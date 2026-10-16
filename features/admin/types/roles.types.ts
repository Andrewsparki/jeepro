export type UserRole = "user" | "moderator" | "admin" | "superadmin";

/**
 * Normalizes a role string to the canonical UserRole type.
 */
export function normalizeUserRole(rawRole?: string | null, isAdmin?: boolean): UserRole {
  if (rawRole === "superadmin") return "superadmin";
  if (rawRole === "admin") return "admin";
  if (rawRole === "moderator") return "moderator";
  if (isAdmin) return "admin";
  return "user";
}
