import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Gets an admin-authorized Supabase client for server-side operations.
 *
 * 1. In a request context (Server Action, Route Handler, Server Component),
 *    uses the authenticated server client (createClient from @/lib/supabase/server).
 *    Row-Level Security (RLS) policies defined in 008_admin_system.sql
 *    strictly enforce public.is_admin() = true for all admin table mutations.
 *
 * 2. If called outside a request context (e.g. background job), attempts to use
 *    SUPABASE_SERVICE_ROLE_KEY if present and valid.
 *
 * ⚠️ NEVER import or expose this in browser/client components.
 */
export async function getAdminClient() {
  // First attempt: authenticated server client carrying admin session cookies
  try {
    return await createServerClient();
  } catch {
    // Fallback: standalone service-role client if outside request context
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
      );
    }

    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}

/**
 * Backward-compatible helper export.
 */
export async function createAdminClient() {
  return getAdminClient();
}
