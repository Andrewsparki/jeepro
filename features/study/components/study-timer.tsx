"use client";

import { useStudySession } from "@/features/study/context/study-session-context";
import { motion, AnimatePresence } from "framer-motion";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudyTimer() {
  const { isActive, elapsedSeconds, endSession } = useStudySession();

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div 
              className="flex items-center gap-4 bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] rounded-full pl-5 pr-2 py-2"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59,130,246,0.15)",
                  "0 0 35px rgba(59,130,246,0.3)",
                  "0 0 20px rgba(59,130,246,0.15)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-red-500" 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="font-mono text-lg font-medium tracking-wider w-[70px] text-center">
                  {formatTime(elapsedSeconds)}
                </div>
              </div>

            <div className="w-px h-6 bg-border/50" />

            <Button
              variant="ghost"
              size="sm"
              onClick={endSession}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground group"
            >
              <Square className="w-4 h-4 mr-2 fill-current opacity-70 group-hover:opacity-100" />
              End
            </Button>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
