import { getUserProgress, ProgressStatus } from "@/features/study/services/progress";

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
  const progress = await getUserProgress();
  const progressMap = new Map(progress.map(p => [p.topic_id, p.status]));
  
  return ALL_SUBJECTS.map(subject => {
    const chapters = subject.chapters.map(chapter => {
      const topics = chapter.topics.map(t => ({
        ...t,
        status: progressMap.get(t.id) || "Not Started"
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
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const syllabus = await getSyllabus();
  return syllabus.find(s => s.slug === slug) || null;
}

export async function getChapterBySlug(subjectSlug: string, chapterSlug: string): Promise<Chapter | null> {
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) return null;
  return subject.chapters.find(c => c.slug === chapterSlug) || null;
}
