import physicsData from './jee-main/physics.json';
import chemistryData from './jee-main/chemistry.json';
import mathData from './jee-main/mathematics.json';

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Not Started" | "In Progress" | "Mastered" | "Needs Revision";

export interface Resources {
  notes: unknown[];
  formulas: unknown[];
  flashcards: unknown[];
  pyqs: unknown[];
  practice: unknown[];
  ai: Record<string, unknown>;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  completionPercentage: number;
  status: Status;
  difficulty: Difficulty;
  weightage: string;
  estimatedStudyTime: string;
  revisionStatus: string;
  description: string;
  topics: string[];
  resources: Resources;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  chapters: Chapter[];
}

export interface JsonTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface JsonChapter {
  id: string;
  order: number;
  name: string;
  slug: string;
  class: number;
  subject: string;
  estimatedHours: number;
  weightage: string;
  status: string;
  topics?: JsonTopic[];
  resources?: Resources;
}

export interface JsonSubject {
  exam: string;
  version: string;
  subject: string;
  chapters: JsonChapter[];
}

function mapToMockSubject(jsonData: JsonSubject): Subject {
  return {
    id: `sub_${jsonData.subject.toLowerCase()}`,
    slug: jsonData.subject.toLowerCase(),
    name: jsonData.subject,
    chapters: jsonData.chapters.map((ch: JsonChapter) => ({
      id: ch.id,
      slug: ch.slug,
      title: ch.name,
      completionPercentage: 0,
      status: "Not Started" as Status,
      difficulty: ch.weightage === "High" ? "Hard" : ch.weightage === "Low" ? "Easy" : "Medium",
      weightage: ch.weightage,
      estimatedStudyTime: `${ch.estimatedHours}h`,
      revisionStatus: "Not started",
      description: `Official JEE Main 2027 Syllabus for ${ch.name}`,
      topics: ch.topics ? ch.topics.map((t: JsonTopic) => t.name) : [],
      resources: ch.resources || {
        notes: [],
        formulas: [],
        flashcards: [],
        pyqs: [],
        practice: [],
        ai: {}
      }
    }))
  };
}

export const mockSyllabus: Record<string, Subject> = {
  physics: mapToMockSubject(physicsData as JsonSubject),
  chemistry: mapToMockSubject(chemistryData as JsonSubject),
  mathematics: mapToMockSubject(mathData as JsonSubject)
};
