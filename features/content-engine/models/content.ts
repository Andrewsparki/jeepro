export type ContentType = 'Note' | 'Formula' | 'Flashcard' | 'PYQ' | 'Summary';

export interface StudyContent {
  id: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string;
  type: ContentType;
  title: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentBlock {
  id: string;
  contentId: string;
  type: 'markdown' | 'latex' | 'code' | 'image';
  content: string;
  order: number;
}

export interface Flashcard extends StudyContent {
  frontContent: string;
  backContent: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  notes?: string;
  createdAt: Date;
}
