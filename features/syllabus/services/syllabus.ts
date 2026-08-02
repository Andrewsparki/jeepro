import { createClient } from "@/lib/supabase/client";
import { getUserProgress, ProgressStatus } from "@/features/study/services/progress";

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
  order_index: number;
  topics: Topic[];
  completionPercentage: number;
  status: ProgressStatus;
  revisionStatus: string;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  chapters: Chapter[];
}

type RawTopic = Omit<Topic, "status">;
type RawChapter = Omit<Chapter, "topics" | "completionPercentage" | "status" | "revisionStatus"> & { topics: RawTopic[] };
type RawSubject = Omit<Subject, "chapters"> & { chapters: RawChapter[] };

export async function getSyllabus(): Promise<Subject[]> {
  const supabase = createClient();
  
  const [ { data: subjects, error: subjectsError }, progress ] = await Promise.all([
    supabase
      .from("subjects")
      .select(`
        *,
        chapters (
          *,
          topics (*)
        )
      `)
      .order('name'),
    getUserProgress()
  ]);
    
  if (subjectsError) {
    console.error("Error fetching syllabus:", subjectsError);
    return [];
  }
  
  const progressMap = new Map(progress.map(p => [p.topic_id, p.status]));
  
  return subjects.map((subject: RawSubject) => {
    const sortedChapters = (subject.chapters || []).sort((a: RawChapter, b: RawChapter) => a.order_index - b.order_index).map((chapter: RawChapter) => {
      const sortedTopics = (chapter.topics || []).sort((a: RawTopic, b: RawTopic) => a.order_index - b.order_index).map((t: RawTopic) => ({
        ...t,
        status: progressMap.get(t.id) || "Not Started"
      }));
      
      const totalTopics = sortedTopics.length;
      const masteredTopics = sortedTopics.filter((t: Topic) => t.status === "Mastered").length;
      const startedTopics = sortedTopics.filter((t: Topic) => t.status !== "Not Started").length;
      
      const completionPercentage = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
      
      let status: ProgressStatus = "Not Started";
      if (completionPercentage === 100) status = "Mastered";
      else if (startedTopics > 0) status = "In Progress";
      
      return {
        ...chapter,
        topics: sortedTopics,
        completionPercentage,
        status,
        revisionStatus: "Up to date", // Mocked for now
        estimated_study_time: chapter.estimated_study_time
      };
    });
    
    return {
      ...subject,
      chapters: sortedChapters
    };
  }) as Subject[];
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
