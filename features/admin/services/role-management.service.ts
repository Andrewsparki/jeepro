"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "./admin-auth.service";
import { logAuditEvent } from "./audit-log.service";
import type { UserRole } from "../types/roles.types";
import { revalidatePath } from "next/cache";

export interface UserRoleItem {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
}

export interface PaginatedUserRoles {
  users: UserRoleItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  roleCounts: Record<UserRole, number>;
}

export interface RoleChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserRoleItem;
}

interface RawProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  is_admin?: boolean | null;
  created_at?: string;
}

/**
 * Normalizes a raw DB profile row into a UserRoleItem with valid canonical role.
 */
function normalizeProfile(p: RawProfileRow): UserRoleItem {
  let role: UserRole = "user";
  if (p.role === "superadmin" || p.role === "admin" || p.role === "moderator" || p.role === "user") {
    role = p.role;
  } else if (p.is_admin) {
    role = "admin";
  }

  return {
    id: p.id,
    email: p.email || "",
    full_name: p.full_name || null,
    avatar_url: p.avatar_url || null,
    role,
    is_admin: p.is_admin === true || role === "admin" || role === "superadmin",
    created_at: p.created_at || new Date().toISOString(),
  };
}

/**
 * Fetches users with their role assignments for the Superadmin Role Management directory.
 */
export async function getUsersWithRoles(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  roleFilter?: string
): Promise<PaginatedUserRoles> {
  // Enforce server-side Superadmin authorization
  await verifySuperAdmin();

  const supabase = await createAdminClient();
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, is_admin, created_at", {
      count: "exact",
    });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`email.ilike.${term},full_name.ilike.${term}`);
  }

  if (roleFilter && roleFilter !== "all") {
    if (roleFilter === "admin") {
      query = query.or("role.eq.admin,is_admin.eq.true");
    } else {
      query = query.eq("role", roleFilter);
    }
  }

  let { data: profiles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error && (error.code === "42703" || error.message?.includes("role"))) {
    let fallbackQuery = supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, is_admin, created_at", {
        count: "exact",
      });
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      fallbackQuery = fallbackQuery.or(`email.ilike.${term},full_name.ilike.${term}`);
    }
    const fallbackRes = await fallbackQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    profiles = fallbackRes.data ? fallbackRes.data.map((p) => ({ ...p, role: p.is_admin ? "admin" : "user" })) : null;
    count = fallbackRes.count;
    error = fallbackRes.error;
  }

  if (error) {
    console.error("Error fetching user roles:", error);
    return {
      users: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
      roleCounts: { user: 0, moderator: 0, admin: 0, superadmin: 0 },
    };
  }

  // Fetch quick role counts
  let allRoles: { role?: string | null; is_admin?: boolean | null }[] | null = null;
  const rolesRes = await supabase.from("profiles").select("role, is_admin");
  if (!rolesRes.error) {
    allRoles = rolesRes.data;
  } else {
    const fallbackRoles = await supabase.from("profiles").select("is_admin");
    allRoles = fallbackRoles.data ? fallbackRoles.data.map((p) => ({ is_admin: p.is_admin, role: p.is_admin ? "admin" : "user" })) : [];
  }
  const roleCounts: Record<UserRole, number> = {
    superadmin: 0,
    admin: 0,
    moderator: 0,
    user: 0,
  };

  (allRoles || []).forEach((row: { role?: string | null; is_admin?: boolean | null }) => {
    let r: UserRole = "user";
    if (row.role === "superadmin" || row.role === "admin" || row.role === "moderator") {
      r = row.role;
    } else if (row.is_admin) {
      r = "admin";
    }
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });

  const users = (profiles || []).map(normalizeProfile);
  const total = count || 0;

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    roleCounts,
  };
}

/**
 * Updates a user's role.
 * Strictly enforced: Only an authenticated Superadmin / Owner can assign or revoke roles.
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole,
  reason?: string
): Promise<RoleChangeResult> {
  // 1. Strict Server-Side Superadmin Verification
  const { user: currentAdmin, profile: adminProfile } = await verifySuperAdmin();

  if (!targetUserId) {
    return { success: false, error: "Target user ID is required." };
  }

  const validRoles: UserRole[] = ["user", "moderator", "admin", "superadmin"];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: `Invalid role '${newRole}'.` };
  }

  const supabase = await createAdminClient();

  // 2. Fetch target profile
  let { data: targetProfile, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_admin")
    .eq("id", targetUserId)
    .single();

  if (fetchErr && (fetchErr.code === "42703" || fetchErr.message?.includes("role"))) {
    const fallback = await supabase
      .from("profiles")
      .select("id, email, full_name, is_admin")
      .eq("id", targetUserId)
      .single();
    targetProfile = fallback.data ? { ...fallback.data, role: fallback.data.is_admin ? "admin" : "user" } : null;
    fetchErr = fallback.error;
  }

  if (fetchErr || !targetProfile) {
    return { success: false, error: "Target user not found." };
  }

  const oldRole = normalizeProfile(targetProfile).role;

  // 3. Safety checks
  // Prevent superadmin from revoking their own superadmin status if they are the only superadmin
  if (currentAdmin.id === targetUserId && newRole !== "superadmin") {
    const { count: initialCount, error: countErr } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "superadmin");

    let count = initialCount;

    if (countErr && (countErr.code === "42703" || countErr.message?.includes("role"))) {
      const fallbackCount = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", true);
      count = fallbackCount.count;
    }

    if (!count || count <= 1) {
      return {
        success: false,
        error: "Cannot demote yourself: You are currently the sole Superadmin / Owner.",
      };
    }
  }

  // 4. Update role & is_admin in database
  const isAdmin = newRole === "admin" || newRole === "superadmin";

  let { error: updateErr } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (updateErr && (updateErr.code === "42703" || updateErr.message?.includes("role"))) {
    const fallback = await supabase
      .from("profiles")
      .update({
        is_admin: isAdmin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);
    updateErr = fallback.error;
  }

  if (updateErr) {
    console.error("Failed to update user role:", updateErr);
    return { success: false, error: updateErr.message || "Failed to update user role." };
  }

  // 5. Record Security Audit Log
  const actionName =
    newRole === "user"
      ? "role.revoked"
      : oldRole === "user"
      ? "role.assigned"
      : "role.changed";

  await logAuditEvent(currentAdmin.id, actionName, "user", targetUserId, {
    target_email: targetProfile.email,
    target_name: targetProfile.full_name,
    previous_role: oldRole,
    new_role: newRole,
    reason: reason || "Administrative role reassignment by Superadmin",
    changed_by_email: adminProfile.email,
  });

  revalidatePath("/admin/roles");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return {
    success: true,
    message: `Successfully updated ${targetProfile.full_name || targetProfile.email}'s role to ${newRole.toUpperCase()}.`,
  };
}
