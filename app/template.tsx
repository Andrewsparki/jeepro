"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1] // Matches --ease-fluid
      }}
      className="flex min-h-[inherit] flex-col w-full h-full"
    >
      {children}
    </motion.div>
  );
}
