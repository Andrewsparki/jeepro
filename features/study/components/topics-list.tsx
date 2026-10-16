"use client";

import { WorkspaceCard } from "./workspace-card";
import { TopicItem } from "./topic-item";
import { BookOpen } from "lucide-react";
import { Topic } from "@/features/syllabus/services/syllabus";

interface TopicsListProps {
  topics: Topic[];
}

export function TopicsList({ topics }: TopicsListProps) {
  return (
    <WorkspaceCard delay={0.3}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Learn</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Master the theory before diving into problems.</p>
        </div>
      </div>

      <div className="flex flex-col">
        {topics.map((topic, index) => (
          <TopicItem 
            key={topic.id} 
            topic={topic} 
            index={index} 
          />
        ))}
      </div>
    </WorkspaceCard>
  );
}
