import { getUserProgress, ProgressStatus } from "@/features/study/services/progress";
import { prefetchMapping, getTopicUuidSync } from "@/features/syllabus/services/mapping.service";

import physicsData from "../data/jee-main/physics.json";
import chemistryData from "../data/jee-main/chemistry.json";
import mathData from "../data/jee-main/mathematics.json";

export interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  order_index: number;
  status?: ProgressStatus;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimated_study_time: string;
  weightage?: string;
  order_index: number;
  topics: Topic[];
  completionPercentage: number;
  status: ProgressStatus;
  revisionStatus: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  nextChapter?: string | null;
  previousChapter?: string | null;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  chapters: Chapter[];
}

interface JsonTopic {
  id: string;
  name: string;
  order: number;
  completed: boolean;
}

interface JsonChapter {
  id: string;
  slug: string;
  name: string;
  description?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  estimatedHours: number;
  weightage?: string;
  order: number;
  learningObjectives?: string[];
  prerequisites?: string[];
  nextChapter?: string | null;
  previousChapter?: string | null;
  topics: JsonTopic[];
}

interface JsonSubject {
  subject: string;
  chapters: JsonChapter[];
}

function transformSubjectData(data: JsonSubject): Subject {
  return {
    id: data.subject.toLowerCase(),
    slug: data.subject.toLowerCase(),
    name: data.subject,
    chapters: data.chapters.map((ch: JsonChapter) => ({
      id: ch.id,
      slug: ch.slug,
      title: ch.name,
      description: ch.description || "",
      difficulty: ch.difficulty || "Medium",
      estimated_study_time: `${ch.estimatedHours}h`,
      weightage: ch.weightage,
      order_index: ch.order,
      learningObjectives: ch.learningObjectives || [],
      prerequisites: ch.prerequisites || [],
      nextChapter: ch.nextChapter,
      previousChapter: ch.previousChapter,
      completionPercentage: 0,
      status: "Not Started" as ProgressStatus,
      revisionStatus: "Up to date",
      topics: (ch.topics || []).map((t: JsonTopic) => ({
        id: t.id,
        chapter_id: ch.id,
        title: t.name,
        order_index: t.order,
        status: "Not Started" as ProgressStatus
      }))
    }))
  };
}

const ALL_SUBJECTS = [
  transformSubjectData(physicsData as unknown as JsonSubject),
  transformSubjectData(chemistryData as unknown as JsonSubject),
  transformSubjectData(mathData as unknown as JsonSubject)
];

export async function getSyllabus(): Promise<Subject[]> {
  try {
    // Ensure UUID mapping cache is warm before resolving topic IDs
    await prefetchMapping();

    const progress = await getUserProgress();
    // progress records are keyed by DB UUID (user_topic_progress.topic_id)
    const progressMap = new Map(progress.map(p => [p.topic_id, p.status]));
    
    // Build a JSON-topic-ID → status map by resolving each JSON ID to its DB UUID
    const resolvedStatusMap = new Map<string, ProgressStatus>();
    for (const subject of ALL_SUBJECTS) {
      for (const chapter of subject.chapters) {
        for (const topic of chapter.topics) {
          const uuid = getTopicUuidSync(topic.id);
          if (uuid && progressMap.has(uuid)) {
            resolvedStatusMap.set(topic.id, progressMap.get(uuid)!);
          }
        }
      }
    }

    return ALL_SUBJECTS.map(subject => {
      const chapters = subject.chapters.map(chapter => {
        const topics = chapter.topics.map(t => ({
          ...t,
          status: resolvedStatusMap.get(t.id) || "Not Started"
        }));
        
        const totalTopics = topics.length;
        const masteredTopics = topics.filter(t => t.status === "Mastered").length;
        const startedTopics = topics.filter(t => t.status !== "Not Started").length;
        
        const completionPercentage = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
        
        let status: ProgressStatus = "Not Started";
        if (completionPercentage === 100 && totalTopics > 0) status = "Mastered";
        else if (startedTopics > 0) status = "In Progress";
        
        return {
          ...chapter,
          topics,
          completionPercentage,
          status
        };
      });
      
      return {
        ...subject,
        chapters
      };
    });
  } catch (err) {
    console.error("getSyllabus error:", err);
    return ALL_SUBJECTS;
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const syllabus = await getSyllabus();
  if (!slug) return null;
  const normalized = decodeURIComponent(slug).toLowerCase().trim();
  return syllabus.find(s => 
    s.slug.toLowerCase() === normalized || 
    s.id.toLowerCase() === normalized ||
    s.name.toLowerCase() === normalized ||
    (normalized === "math" && (s.slug === "mathematics" || s.slug === "math")) ||
    (normalized === "mathematics" && (s.slug === "mathematics" || s.slug === "math"))
  ) || null;
}

export async function getChapterBySlug(subjectSlug: string, chapterSlug: string): Promise<Chapter | null> {
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject || !chapterSlug) return null;
  const rawSlug = decodeURIComponent(chapterSlug).toLowerCase().trim();
  const cleanSlug = rawSlug.replace(/[^a-z0-9]/g, '-');
  return subject.chapters.find(ch => {
    const chSlug = ch.slug.toLowerCase();
    const chId = ch.id.toLowerCase();
    const chClean = chSlug.replace(/[^a-z0-9]/g, '-');
    const chIdClean = chId.replace(/[^a-z0-9]/g, '-');
    return chSlug === rawSlug ||
           chId === rawSlug ||
           chClean === cleanSlug ||
           chIdClean === cleanSlug ||
           chIdClean === `${subject.slug}-${cleanSlug}` ||
           chSlug.includes(cleanSlug) ||
           cleanSlug.includes(chSlug);
  }) || null;
}
