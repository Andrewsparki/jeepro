"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Moon, Zap, Sparkles } from "lucide-react";

export function FocusSection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full pointer-events-none -z-10 transform-gpu" 
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.15) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl">
        
        {/* Minimalist Serene Smoked Glass Focus Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl sm:rounded-[40px] p-8 sm:p-14 lg:p-16 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/80 backdrop-blur-xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] text-center overflow-hidden"
        >
          {/* Top Specular Glare Line */}
          <div className="absolute top-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calm Architecture</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Less distraction. <br />
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                More progress.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              No ads, no algorithmic social feeds, no sensory overload. Just pure conceptual clarity, precision problem solving, and a focused environment engineered for top ranks.
            </p>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Zero Clutter</h4>
                <p className="text-[11px] text-slate-400">Only the syllabus and active problem sets.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 transition-colors"
              >
                <Zap className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Ultra-Fast</h4>
                <p className="text-[11px] text-slate-400">Instant load times with offline sync capability.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Deep State</h4>
                <p className="text-[11px] text-slate-400">Enter flow state within seconds of opening.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
