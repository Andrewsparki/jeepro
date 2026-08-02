"use client";

import { motion } from "framer-motion";

export function WhySection() {
  return (
    <section className="py-24 sm:py-32 bg-card/20" id="about">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col gap-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Why JEE Pro?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted leading-relaxed"
            >
              Traditional platforms are cluttered with ads, slow loading times, and generic content. We built JEE Pro from the ground up for the modern student.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted leading-relaxed"
            >
              No distractions. No unnecessary noise. Just a meticulously crafted environment that respects your time and maximizes your focus.
            </motion.p>
          </div>

          {/* Abstract Image / Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative aspect-square lg:aspect-auto lg:h-[600px] w-full rounded-3xl overflow-hidden bg-gradient-to-tr from-accent/20 to-transparent border border-border/50"
          >
            {/* Abstract elements to simulate a beautiful graphic without needing an external image */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/30 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen" />
            
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl p-6 flex flex-col gap-4 transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
                 <div className="w-1/3 h-4 bg-muted/20 rounded-full" />
                 <div className="w-full h-24 bg-muted/10 rounded-xl" />
                 <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-accent/20" />
                   <div className="flex-1 h-8 bg-muted/10 rounded-lg" />
                 </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
