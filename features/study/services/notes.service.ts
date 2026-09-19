import { createClient } from "@/lib/supabase/client";

export interface UserNote {
  id: string;
  user_id: string;
  subject_id: string;
  chapter_id: string;
  topic_id?: string | null;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const LOCAL_NOTES_PREFIX = "jee_user_notes_v2_";

function getLocalNotes(chapterId: string): UserNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTES_PREFIX}${chapterId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalNotes(chapterId: string, notes: UserNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_NOTES_PREFIX}${chapterId}`, JSON.stringify(notes));
  } catch (err) {
    console.error("setLocalNotes error:", err);
  }
}

export async function getUserNotes(
  subjectId: string,
  chapterId: string,
  topicId?: string
): Promise<UserNote[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let query = supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("chapter_id", chapterId)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (topicId) {
        query = query.eq("topic_id", topicId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLocalNotes(chapterId, data as UserNote[]);
        return data as UserNote[];
      }
    }
  } catch (err) {
    console.warn("[getUserNotes] Falling back to local storage:", err);
  }

  const local = getLocalNotes(chapterId);
  if (topicId) {
    return local.filter((n) => n.topic_id === topicId);
  }
  return local;
}

export async function createNote(
  noteData: Partial<UserNote> & { subject_id: string; chapter_id: string }
): Promise<UserNote> {
  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`;
  const now = new Date().toISOString();

  const noteToCreate: UserNote = {
    id: newId,
    user_id: "guest",
    subject_id: noteData.subject_id,
    chapter_id: noteData.chapter_id,
    topic_id: noteData.topic_id || null,
    title: noteData.title || "Untitled Note",
    content: noteData.content || "",
    tags: noteData.tags || [],
    is_pinned: noteData.is_pinned || false,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      noteToCreate.user_id = user.id;
      const { data, error } = await supabase
        .from("user_notes")
        .insert({
          subject_id: noteToCreate.subject_id,
          chapter_id: noteToCreate.chapter_id,
          topic_id: noteToCreate.topic_id,
          title: noteToCreate.title,
          content: noteToCreate.content,
          tags: noteToCreate.tags,
          is_pinned: noteToCreate.is_pinned,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        const created = data as UserNote;
        const currentLocal = getLocalNotes(noteData.chapter_id);
        setLocalNotes(noteData.chapter_id, [created, ...currentLocal]);
        return created;
      }
    }
  } catch (err) {
    console.warn("[createNote] Failed to create in DB, using local fallback:", err);
  }

  const currentLocal = getLocalNotes(noteData.chapter_id);
  const updatedLocal = [noteToCreate, ...currentLocal];
  setLocalNotes(noteData.chapter_id, updatedLocal);
  return noteToCreate;
}

export async function updateNote(
  id: string,
  chapterId: string,
  updates: Partial<UserNote>
): Promise<UserNote | null> {
  const now = new Date().toISOString();

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !id.startsWith("note-") && !id.startsWith("local-")) {
      const { data, error } = await supabase
        .from("user_notes")
        .update({
          ...updates,
          updated_at: now,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        const updated = data as UserNote;
        const local = getLocalNotes(chapterId);
        setLocalNotes(
          chapterId,
          local.map((n) => (n.id === id ? updated : n))
        );
        return updated;
      }
    }
  } catch (err) {
    console.warn("[updateNote] Failed to update DB note:", err);
  }

  // Update in local cache
  const local = getLocalNotes(chapterId);
  let updatedNote: UserNote | null = null;
  const nextLocal = local.map((n) => {
    if (n.id === id) {
      updatedNote = { ...n, ...updates, updated_at: now };
      return updatedNote;
    }
    return n;
  });

  setLocalNotes(chapterId, nextLocal);
  return updatedNote;
}

export async function deleteNote(id: string, chapterId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !id.startsWith("note-") && !id.startsWith("local-")) {
      await supabase.from("user_notes").delete().eq("id", id).eq("user_id", user.id);
    }
  } catch (err) {
    console.warn("[deleteNote] Error deleting from DB:", err);
  }

  const local = getLocalNotes(chapterId);
  setLocalNotes(
    chapterId,
    local.filter((n) => n.id !== id)
  );
  return true;
}

export async function togglePinNote(
  id: string,
  chapterId: string,
  isPinned: boolean
): Promise<UserNote | null> {
  return updateNote(id, chapterId, { is_pinned: isPinned });
}

export async function searchNotes(query: string, chapterId: string): Promise<UserNote[]> {
  const notes = await getUserNotes("", chapterId);
  const q = query.toLowerCase().trim();
  if (!q) return notes;

  return notes.filter((n) => {
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
