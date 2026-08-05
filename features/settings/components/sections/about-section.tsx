"use client";

import { useState } from "react";
import { Info, Code2, Layers, Cpu, Smartphone, Database, CheckCircle2 } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AboutSection() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleVersionClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 7) {
      setShowEasterEgg(true);
      setClickCount(0);
    }
  };

  return (
    <>
      <GlassSection id="about" title="About" icon={Info} description="System information and versions.">
        
        <SettingRow 
          title="Version" 
          description="Click multiple times for a surprise."
        >
          <button 
            onClick={handleVersionClick}
            className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer select-none px-2 py-1 rounded hover:bg-surface-hover"
          >
            v0.1.0-beta
          </button>
        </SettingRow>

        <SettingRow 
          title="Build Number" 
        >
          <span className="text-sm font-mono text-muted-foreground">9482.10a</span>
        </SettingRow>

        <SettingRow 
          title="Latest Update" 
        >
          <span className="text-sm text-muted-foreground">Just now</span>
        </SettingRow>

        <SettingRow 
          title="Frameworks Used" 
          isLast
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-surface border border-glass-border px-2 py-1 rounded">
              <Layers className="w-3 h-3" /> Next.js
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-surface border border-glass-border px-2 py-1 rounded">
              <Database className="w-3 h-3" /> Supabase
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-surface border border-glass-border px-2 py-1 rounded">
              <Code2 className="w-3 h-3" /> React
            </span>
          </div>
        </SettingRow>

      </GlassSection>

      {/* Easter Egg Modal */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
              className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl overflow-hidden"
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Logo placeholder - premium geometric shape */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/40 p-0.5 shadow-lg shadow-primary/20 mb-6">
                  <div className="w-full h-full bg-black/50 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                    <div className="w-6 h-6 border-[3px] border-white/80 rounded-full" />
                  </div>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">JEE Pro</h2>
                <div className="flex items-center gap-2 mb-8 text-xs font-mono text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <span>v0.1.0</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>Build 9482.10a</span>
                </div>

                <p className="text-sm text-white/70 leading-relaxed mb-8">
                  Thank you for being part of this journey. This platform was built with obsessive attention to detail, for students who demand the best from themselves and their tools.
                </p>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
                
                <div className="flex flex-col items-center">
                  <span className="font-serif italic text-white/40 text-sm mb-6">
                    Designed in silence.
                  </span>
                  <Button 
                    variant="outline" 
                    className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setShowEasterEgg(false)}
                  >
                    Close
                  </Button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
