import { Chapter } from "@/features/syllabus/services/syllabus";
import { ChapterRow } from "./chapter-row";

interface ChapterListProps {
  chapters: Chapter[];
  subjectSlug: string;
  onUpdate?: () => void;
}

export function ChapterList({ chapters, subjectSlug, onUpdate }: ChapterListProps) {
  if (!chapters.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {chapters.map((chapter) => (
        <ChapterRow key={chapter.id} chapter={chapter} subjectSlug={subjectSlug} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
