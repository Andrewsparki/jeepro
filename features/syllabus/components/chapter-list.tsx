import { Chapter } from "@/features/syllabus/services/syllabus";
import { ChapterRow } from "./chapter-row";

interface ChapterListProps {
  chapters: Chapter[];
  subjectSlug: string;
}

export function ChapterList({ chapters, subjectSlug }: ChapterListProps) {
  if (!chapters.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {chapters.map((chapter) => (
        <ChapterRow key={chapter.id} chapter={chapter} subjectSlug={subjectSlug} />
      ))}
    </div>
  );
}
