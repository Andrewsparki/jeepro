import { createClient } from "@/lib/supabase/server";

/**
 * Server-side UUID resolution for slugs.
 * Mirrors mapping.service.ts but uses the server Supabase client
 * (required for "use server" modules like planner.service.ts).
 *
 * No caching — each call is short-lived (server action lifetime).
 */

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function getSubjectUuidServer(slugOrId: string | null | undefined): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) return slugOrId;

  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", slugOrId)
    .single();

  if (data?.id) return data.id;

  console.warn(`[mapping-server] No UUID found for subject slug "${slugOrId}" — falling back to raw value`);
  return slugOrId;
}

export async function getChapterUuidServer(slugOrId: string | null | undefined): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) return slugOrId;

  const supabase = await createClient();

  // Try matching by slug first
  const { data: bySlug } = await supabase
    .from("chapters")
    .select("id")
    .eq("slug", slugOrId)
    .single();

  if (bySlug?.id) return bySlug.id;

  console.warn(`[mapping-server] No UUID found for chapter slug "${slugOrId}" — falling back to raw value`);
  return slugOrId;
}
