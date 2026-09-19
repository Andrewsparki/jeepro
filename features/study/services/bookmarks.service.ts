import { createClient } from "@/lib/supabase/client";

export type BookmarkItemType = "note" | "formula" | "chapter" | "topic";

export interface UserBookmark {
  id: string;
  user_id: string;
  item_type: BookmarkItemType;
  item_id: string;
  chapter_id?: string;
  notes?: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = "jee_user_bookmarks_v1";

function getLocalBookmarks(): UserBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalBookmarks(bookmarks: UserBookmark[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error("setLocalBookmarks error:", err);
  }
}

export async function getUserBookmarks(chapterId?: string): Promise<UserBookmark[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let query = supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (chapterId) {
        query = query.eq("chapter_id", chapterId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLocalBookmarks(data);
        return data as UserBookmark[];
      }
    }
  } catch (err) {
    console.warn("[getUserBookmarks] Falling back to local storage:", err);
  }

  const local = getLocalBookmarks();
  if (chapterId) {
    return local.filter((b) => !b.chapter_id || b.chapter_id === chapterId);
  }
  return local;
}

export async function checkIsBookmarked(itemType: BookmarkItemType, itemId: string): Promise<boolean> {
  const bookmarks = await getUserBookmarks();
  return bookmarks.some((b) => b.item_type === itemType && b.item_id === itemId);
}

export async function toggleBookmark(
  itemType: BookmarkItemType,
  itemId: string,
  chapterId?: string,
  notes?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isCurrentlyBookmarked = await checkIsBookmarked(itemType, itemId);

    if (user) {
      if (isCurrentlyBookmarked) {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId);
      } else {
        await supabase
          .from("user_bookmarks")
          .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            chapter_id: chapterId,
            notes: notes || "",
          });
      }
    }

    // Always update local cache
    const currentLocal = getLocalBookmarks();
    let nextLocal: UserBookmark[];

    if (isCurrentlyBookmarked) {
      nextLocal = currentLocal.filter((b) => !(b.item_type === itemType && b.item_id === itemId));
    } else {
      const newBm: UserBookmark = {
        id: `local-${Date.now()}`,
        user_id: user?.id || "guest",
        item_type: itemType,
        item_id: itemId,
        chapter_id: chapterId,
        notes,
        created_at: new Date().toISOString(),
      };
      nextLocal = [newBm, ...currentLocal];
    }

    setLocalBookmarks(nextLocal);
    return !isCurrentlyBookmarked;
  } catch (err) {
    console.error("[toggleBookmark] Error:", err);
    return false;
  }
}
