import { createClient } from "@/lib/supabase/client";
import physicsData from "../data/jee-main/physics.json";
import chemistryData from "../data/jee-main/chemistry.json";
import mathData from "../data/jee-main/mathematics.json";

let cachedTopicMap: Record<string, string> | null = null;
let cachedChapterMap: Record<string, string> | null = null;
let cachedSubjectMap: Record<string, string> | null = null;
let prefetchPromise: Promise<void> | null = null;

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Raw JSON syllabus structure for mapping only
interface RawTopic {
  id: string;
  name: string;
}
interface RawChapter {
  id: string;
  slug: string;
  topics: RawTopic[];
}
interface RawSubject {
  subject: string;
  chapters: RawChapter[];
}

const RAW_SUBJECTS: RawSubject[] = [
  physicsData as unknown as RawSubject,
  chemistryData as unknown as RawSubject,
  mathData as unknown as RawSubject,
];

/**
 * Pre-fetches mapping data from Supabase and in-memory caches it using O(1) indexed HashMaps.
 * Uses a singleton promise to deduplicate concurrent requests.
 */
export async function prefetchMapping(): Promise<void> {
  if (cachedTopicMap && cachedChapterMap && cachedSubjectMap) return;

  if (!prefetchPromise) {
    prefetchPromise = (async () => {
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
        const chaptersBySlug = new Map<string, string>();
        chaptersRes.data.forEach((c: { id: string; slug: string }) => {
          cachedChapterMap![c.slug] = c.id;
          chaptersBySlug.set(c.slug, c.id);
        });

        // Map by JSON chapter ID in O(1) time
        RAW_SUBJECTS.forEach((sub) =>
          sub.chapters.forEach((ch) => {
            const dbChapId = chaptersBySlug.get(ch.slug);
            if (dbChapId) {
              cachedChapterMap![ch.id] = dbChapId;
            }
          })
        );
      }

      cachedTopicMap = {};
      if (topicsRes.data) {
        // Construct composite index map: "chapterId::title" -> topicId for O(1) lookup
        const topicsByChapterAndTitle = new Map<string, string>();
        topicsRes.data.forEach(
          (t: { id: string; chapter_id: string; title: string }) => {
            topicsByChapterAndTitle.set(`${t.chapter_id}::${t.title}`, t.id);
          }
        );

        // Map all topics in O(1) without repeated nested array searches
        RAW_SUBJECTS.forEach((sub) =>
          sub.chapters.forEach((ch) => {
            const dbChapId = cachedChapterMap![ch.slug];
            if (dbChapId) {
              ch.topics.forEach((t) => {
                const dbTopicId = topicsByChapterAndTitle.get(
                  `${dbChapId}::${t.name}`
                );
                if (dbTopicId) {
                  cachedTopicMap![t.id] = dbTopicId;
                }
              });
            }
          })
        );
      }
    })().finally(() => {
      prefetchPromise = null;
    });
  }

  return prefetchPromise;
}

/**
 * Given a subject slug (or UUID), returns the UUID.
 */
export async function getSubjectUuid(
  slugOrId: string | null | undefined
): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) {
    return slugOrId;
  }
  await prefetchMapping();
  return cachedSubjectMap?.[slugOrId] || null;
}

/**
 * Given a chapter slug or JSON ID (or UUID), returns the UUID or string identifier.
 */
export async function getChapterUuid(
  slugOrId: string | null | undefined
): Promise<string | null> {
  if (!slugOrId) return null;
  if (isUuid(slugOrId)) {
    return slugOrId;
  }
  await prefetchMapping();
  return cachedChapterMap?.[slugOrId] || null;
}

/**
 * Given a JSON topic ID (or UUID), returns the UUID or string identifier.
 */
export async function getTopicUuid(
  jsonId: string | null | undefined
): Promise<string | null> {
  if (!jsonId) return null;
  if (isUuid(jsonId)) {
    return jsonId;
  }
  await prefetchMapping();
  return cachedTopicMap?.[jsonId] || null;
}
