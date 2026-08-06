"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, PenTool, RotateCw, CheckCircle2 } from "lucide-react";

export function QuickActions() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <motion.div variants={item}>
        <Button className="w-full h-14 rounded-xl gap-2 font-medium text-base bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm hover:shadow-md">
          <Play className="w-5 h-5 fill-current" />
          Start Study
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button variant="outline" className="w-full h-14 rounded-xl gap-2 font-medium text-base bg-card/30 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-all hover:border-blue-500/30 hover:text-blue-500">
          <PenTool className="w-5 h-5" />
          Practice PYQs
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button variant="outline" className="w-full h-14 rounded-xl gap-2 font-medium text-base bg-card/30 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-all hover:border-orange-500/30 hover:text-orange-500">
          <RotateCw className="w-5 h-5" />
          Revise
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Button variant="outline" className="w-full h-14 rounded-xl gap-2 font-medium text-base bg-card/30 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-all hover:border-green-500/30 hover:text-green-500">
          <CheckCircle2 className="w-5 h-5" />
          Mark Complete
        </Button>
      </motion.div>
    </motion.div>
  );
}
