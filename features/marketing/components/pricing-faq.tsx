"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const faqs = [
  {
    q: "Is JEE PRO free?",
    a: "Yes! The core Free plan provides 100% unrestricted access to the complete 90-chapter syllabus across Physics, Chemistry, and Mathematics, complete chapter status tracking, basic study dashboards, and formula summaries with zero ads or paywalls.",
  },
  {
    q: "What does the Pro plan include?",
    a: "The Pro tier expands your toolkit with unlimited adaptive practice sets, full-length 3-hour NTA mock test simulators, 10+ years of categorized JEE Main & Advanced PYQs with verified solutions, spaced-repetition revision cycles, and detailed accuracy/speed analytics.",
  },
  {
    q: "When will paid plans launch?",
    a: "Paid Pro and Pro Max plans will roll out progressively. Currently, all early registered aspirants have free access to essential learning modules, syllabus roadmaps, and practice tools.",
  },
  {
    q: "Can I use JEE PRO for JEE Main and Advanced?",
    a: "Absolutely. The platform is designed from the ground up to cover both JEE Main concept fundamentals and JEE Advanced high-difficulty multi-correct, comprehension, and numerical problem patterns.",
  },
  {
    q: "Will my progress be saved?",
    a: "Yes, all your chapter completion milestones, practice test scores, study streaks, and customized formula flags are automatically synced in real-time to your secure personal account.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. You can start completely free today. When Pro tiers become available, you can upgrade instantly with a single click—all your historical study progress, analytics, and bookmarks will seamlessly transfer over.",
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-[#070E1E]/50 text-xs font-semibold text-[#38bdf8] mb-3 backdrop-blur-xl">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Questions, answered.
          </h2>
          <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed">
            Everything you need to know about plans, syllabus coverage, and future releases.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="relative rounded-2xl bg-[#070E1E]/65 backdrop-blur-2xl border border-white/[0.1] hover:border-white/[0.2] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-300 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-cyan-400 bg-cyan-500/10 border-cyan-400/30" : ""
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.28, ease: "easeOut" }
                      }}
                    >
                      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 text-xs sm:text-sm text-[#98A0B3] font-normal leading-relaxed border-t border-white/[0.06]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
