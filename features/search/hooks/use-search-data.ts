import { useMemo } from "react";
import physicsData from "@/features/syllabus/data/jee-main/physics.json";
import chemistryData from "@/features/syllabus/data/jee-main/chemistry.json";
import mathData from "@/features/syllabus/data/jee-main/mathematics.json";

export interface SearchItem {
  id: string;
  title: string;
  type: "subject" | "chapter" | "action" | "tool" | "navigation";
  href?: string;
  action?: () => void;
  keywords?: string[];
  icon?: string;
}

interface JsonTopic {
  id: string;
  name: string;
}

interface JsonChapter {
  id: string;
  slug: string;
  name: string;
  topics?: JsonTopic[];
}

interface JsonSubject {
  subject: string;
  chapters: JsonChapter[];
}

export function useSearchData() {
  const items = useMemo(() => {
    const data: SearchItem[] = [];

    // 1. Navigation
    data.push(
      { id: "nav-dashboard", title: "Dashboard", type: "navigation", href: "/dashboard" },
      { id: "nav-planner", title: "Planner", type: "navigation", href: "/dashboard/planner" },
      { id: "nav-analytics", title: "Analytics", type: "navigation", href: "/dashboard/analytics" },
      { id: "nav-settings", title: "Settings", type: "navigation", href: "/dashboard/settings" }
    );

    // 2. Tools
    data.push(
      { id: "tool-notes", title: "Notes", type: "tool", keywords: ["notebook", "write"] },
      { id: "tool-formula", title: "Formula Sheet", type: "tool", keywords: ["math", "physics", "reference"] },
      { id: "tool-flashcards", title: "Flashcards", type: "tool", keywords: ["memorize", "deck"] },
      { id: "tool-pyqs", title: "PYQs (Previous Year Questions)", type: "tool", keywords: ["exam", "test"] },
      { id: "tool-tutor", title: "AI Tutor", type: "tool", keywords: ["help", "explain", "ai"] },
      { id: "tool-bookmarks", title: "Bookmarks", type: "tool", keywords: ["saved", "favorites"] }
    );

    // 3. Syllabus
    const subjects = [physicsData, chemistryData, mathData] as unknown as JsonSubject[];
    subjects.forEach((subj) => {
      // Add Subject
      data.push({
        id: `subject-${subj.subject.toLowerCase()}`,
        title: subj.subject,
        type: "subject",
        href: `/dashboard/study/${subj.subject.toLowerCase()}`,
      });

      // Add Chapters
      subj.chapters.forEach((chap) => {
        data.push({
          id: `chapter-${chap.id}`,
          title: `${chap.name} (${subj.subject})`,
          type: "chapter",
          href: `/dashboard/study/${subj.subject.toLowerCase()}/${chap.slug}`,
          keywords: chap.topics?.map((t) => t.name) || [],
        });
      });
    });

    return data;
  }, []);

  return { items };
}
