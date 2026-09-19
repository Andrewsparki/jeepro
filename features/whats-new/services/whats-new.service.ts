import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppUpdate, AppUpdateCreateInput, AppUpdateUpdateInput } from "../types/whats-new.types";

export async function getPublishedUpdates(userId?: string): Promise<AppUpdate[]> {
  const supabase = await createClient();

  const { data: updates, error } = await supabase
    .from("app_updates")
    .select("*")
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching published app updates:", error);
    return [];
  }

  if (!userId || !updates || updates.length === 0) {
    return (updates || []).map((u) => ({ ...u, is_read: false }));
  }

  // Fetch read states for user
  const { data: reads, error: readsError } = await supabase
    .from("user_app_update_reads")
    .select("update_id")
    .eq("user_id", userId);

  if (readsError) {
    console.error("Error fetching user update reads:", readsError);
    return updates.map((u) => ({ ...u, is_read: false }));
  }

  const readSet = new Set(reads.map((r) => r.update_id));
  return updates.map((u) => ({
    ...u,
    is_read: readSet.has(u.id),
  }));
}

export async function markUpdateAsRead(userId: string, updateId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("user_app_update_reads").upsert(
    {
      user_id: userId,
      update_id: updateId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,update_id" }
  );

  if (error) {
    console.error("Error marking update as read:", error);
    return false;
  }
  return true;
}

export async function markAllUpdatesAsRead(userId: string, updateIds: string[]): Promise<boolean> {
  if (updateIds.length === 0) return true;
  const supabase = await createClient();

  const records = updateIds.map((id) => ({
    user_id: userId,
    update_id: id,
    read_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("user_app_update_reads").upsert(records, {
    onConflict: "user_id,update_id",
  });

  if (error) {
    console.error("Error marking all updates as read:", error);
    return false;
  }
  return true;
}

// ADMIN SERVICE METHODS
export async function getAllUpdatesAdmin(): Promise<AppUpdate[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("app_updates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin updates:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function createUpdateAdmin(input: AppUpdateCreateInput): Promise<AppUpdate> {
  const supabase = await createAdminClient();

  const payload = {
    title: input.title,
    description: input.description,
    category: input.category,
    status: input.status,
    icon_name: input.icon_name || "Sparkles",
    image_url: input.image_url || null,
    link_url: input.link_url || null,
    link_label: input.link_label || null,
    is_published: input.is_published ?? true,
    is_archived: input.is_archived ?? false,
    published_at: input.published_at || new Date().toISOString(),
  };

  const { data, error } = await supabase.from("app_updates").insert(payload).select().single();

  if (error) {
    console.error("Error creating app update:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateUpdateAdmin(input: AppUpdateUpdateInput): Promise<AppUpdate> {
  const supabase = await createAdminClient();

  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from("app_updates")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating app update:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteUpdateAdmin(id: string): Promise<boolean> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("app_updates").delete().eq("id", id);

  if (error) {
    console.error("Error deleting app update:", error);
    throw new Error(error.message);
  }

  return true;
}
