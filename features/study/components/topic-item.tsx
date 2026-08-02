"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Topic } from "@/features/syllabus/services/syllabus";
import { updateTopicProgress } from "@/features/study/services/progress";
import { useStudySession } from "@/features/study/context/study-session-context";

interface TopicItemProps {
  topic: Topic;
  index: number;
}

export function TopicItem({ topic, index }: TopicItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(topic.status || "Not Started");
  const [isUpdating, setIsUpdating] = useState(false);
  const { startSession, topicId: activeTopicId, triggerRefresh } = useStudySession();

  const isCompleted = status === "Mastered";

  const handleMarkComplete = async () => {
    setIsUpdating(true);
    const newStatus = isCompleted ? "Not Started" : "Mastered";
    const res = await updateTopicProgress(topic.id, newStatus);
    if (res) {
      setStatus(res.status);
      triggerRefresh();
    }
    setIsUpdating(false);
  };

  return (
    <div className="border-b border-border/30 last:border-0">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 text-left group focus-visible:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/10 flex items-center justify-center border border-border/30 text-muted-foreground group-hover:border-border/60 transition-colors">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <span className={cn("text-lg font-medium transition-colors", isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-blue-400")}>
            {topic.title}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4" />
            45m
          </div>
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-12 pr-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-muted-foreground">
              <p className="text-sm leading-relaxed max-w-xl">
                Master the fundamental concepts of {topic.title.toLowerCase()}. Includes video lectures, interactive visualizations, and standard derivations required for JEE Advanced.
              </p>
              <div className="flex gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleMarkComplete}
                  disabled={isUpdating}
                  className={cn("gap-2", isCompleted && "text-green-500 hover:text-green-600")}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => startSession(topic.chapter_id, topic.id)}
                  className="gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400 border-none"
                >
                  <PlayCircle className="w-4 h-4" />
                  {activeTopicId === topic.id ? "Session Active" : "Start Module"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
