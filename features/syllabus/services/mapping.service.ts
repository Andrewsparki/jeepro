import { createClient } from "@/lib/supabase/client";
import physicsData from "../data/jee-main/physics.json";
import chemistryData from "../data/jee-main/chemistry.json";
import mathData from "../data/jee-main/mathematics.json";

let cachedTopicMap: Record<string, string> | null = null;
let cachedChapterMap: Record<string, string> | null = null;
let cachedSubjectMap: Record<string, string> | null = null;

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Raw JSON syllabus structure for mapping only (avoids circular dep with syllabus.ts)
interface RawTopic { id: string; name: string; }
interface RawChapter { id: string; slug: string; topics: RawTopic[]; }
interface RawSubject { subject: string; chapters: RawChapter[]; }

const RAW_SUBJECTS: RawSubject[] = [
  physicsData as unknown as RawSubject,
  chemistryData as unknown as RawSubject,
  mathData as unknown as RawSubject,
];

/**
 * Pre-fetches mapping data from Supabase and in-memory caches it.
 */
export async function prefetchMapping() {
  if (cachedTopicMap && cachedChapterMap && cachedSubjectMap) return;
  const supabase = createClient();

  const [subjectsRes, chaptersRes, topicsRes] = await Promise.all([
    supabase.from("subjects").select("id, slug"),
    supabase.from("chapters").select("id, slug, subject_id"),
    supabase.from("topics").select("id, title, chapter_id"),
  ]);

  cachedSubjectMap = {};
  if (subjectsRes.data) {
    subjectsRes.data.forEach((s: { id: string; slug: string }) => {
      cachedSubjectMap![s.slug] = s.id;
    });
  }

  cachedChapterMap = {};
  if (chaptersRes.data) {
    chaptersRes.data.forEach((c: { id: string; slug: string }) => {
      cachedChapterMap![c.slug] = c.id;
    });
    // Also map by JSON chapter ID:
    RAW_SUBJECTS.forEach((sub) =>
      sub.chapters.forEach((ch) => {
        const dbChapId = chaptersRes.data?.find((c: { slug: string }) => c.slug === ch.slug)?.id;
        if (dbChapId) {
          cachedChapterMap![ch.id] = dbChapId;
        }
      })
    );
  }

  cachedTopicMap = {};
  if (topicsRes.data) {
    RAW_SUBJECTS.forEach((sub) =>
      sub.chapters.forEach((ch) => {
        const dbChapId = cachedChapterMap![ch.slug];
        ch.topics.forEach((t) => {
          const dbTopic = topicsRes.data?.find(
            (dt: { chapter_id: string; title: string }) => dt.chapter_id === dbChapId && dt.title === t.name
          );
          if (dbTopic) {
            cachedTopicMap![t.id] = dbTopic.id;
          }
        });
      })
    );
  }
}

/**
 * Given a subject slug (or UUID), returns the UUID.
 */
export async function getSubjectUuid(slugOrId: string | null | undefined): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) {
    return slugOrId;
  }
  await prefetchMapping();
  const resolved = cachedSubjectMap?.[slugOrId];
  if (!resolved) {
    console.warn(`[mapping] getSubjectUuid: No UUID found for subject "${slugOrId}". WHY: The slug "${slugOrId}" is not present as a key in the cachedSubjectMap. (Reference tables might be empty, or the slug in the frontend JSON doesn't exactly match the slug in the database).`);
    return null;
  } else {
    console.log(`[mapping] getSubjectUuid: Found UUID "${resolved}" for subject "${slugOrId}"`);
  }
  return resolved;
}

/**
 * Given a chapter slug or JSON ID (or UUID), returns the UUID or string identifier.
 */
export async function getChapterUuid(slugOrId: string | null | undefined): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) {
    return slugOrId;
  }
  await prefetchMapping();
  const resolved = cachedChapterMap?.[slugOrId];
  if (!resolved) {
    console.warn(`[mapping] getChapterUuid: No UUID found for chapter "${slugOrId}". WHY: The string "${slugOrId}" (which could be a slug or a JSON ID) is not present as a key in cachedChapterMap. (Either missing in DB, or string mismatch between JSON and DB).`);
    return null;
  } else {
    console.log(`[mapping] getChapterUuid: Found UUID "${resolved}" for chapter "${slugOrId}"`);
  }
  return resolved;
}

/**
 * Given a JSON topic ID (or UUID), returns the UUID or string identifier.
 */
export async function getTopicUuid(jsonId: string | null | undefined): Promise<string | null> {
  if (!jsonId) return null;
  if (isUuid(jsonId)) {
    return jsonId;
  }
  await prefetchMapping();
  const resolved = cachedTopicMap?.[jsonId];
  if (!resolved) {
    console.warn(`[mapping] getTopicUuid: No UUID found for topic "${jsonId}". WHY: The JSON ID "${jsonId}" could not be mapped to a DB topic UUID during prefetch (either the parent chapter was missing, or the topic title didn't match exactly).`);
    return null;
  } else {
    console.log(`[mapping] getTopicUuid: Found UUID "${resolved}" for topic "${jsonId}"`);
  }
  return resolved;
}
