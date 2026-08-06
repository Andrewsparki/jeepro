"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Activity, Flame, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusCompletionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  durationSeconds: number;
  xpEarned: number;
}

export function FocusCompletionModal({
  isOpen,
  onOpenChange,
  durationSeconds,
  xpEarned,
}: FocusCompletionModalProps) {
  
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-black/60 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl" hideCloseButton>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative p-8 flex flex-col items-center justify-center text-center"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

              <motion.button 
                variants={itemVariants}
                className="absolute top-4 right-4 rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              <motion.div variants={itemVariants} className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 ring-1 ring-accent/20 shadow-[0_0_30px_rgba(var(--accent),0.2)]">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
                Session Complete
              </motion.h2>
              <motion.p variants={itemVariants} className="text-muted-foreground mb-8 text-sm max-w-[280px]">
                You successfully completed your focus session. Excellent work.
              </motion.p>

              <div className="grid grid-cols-2 gap-3 w-full mb-8">
                <motion.div variants={itemVariants} className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground w-full">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Duration</span>
                  </div>
                  <span className="text-3xl font-light tabular-nums tracking-tighter text-foreground">
                    {formatTime(durationSeconds)}
                  </span>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground w-full">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Score</span>
                  </div>
                  <span className="text-3xl font-light tabular-nums tracking-tighter text-emerald-400">
                    94<span className="text-xl text-emerald-400/50">%</span>
                  </span>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground w-full">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">XP Earned</span>
                  </div>
                  <span className="text-3xl font-light tabular-nums tracking-tighter text-amber-400">
                    +{xpEarned}
                  </span>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground w-full">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Streak</span>
                  </div>
                  <span className="text-3xl font-light tabular-nums tracking-tighter text-foreground">
                    3<span className="text-xl text-muted-foreground ml-1">Days</span>
                  </span>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-2xl h-14 bg-white text-black hover:bg-white/90 font-medium text-base shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
