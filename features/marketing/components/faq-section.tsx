"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How is JEE Pro different from other platforms?",
    answer: "We focus exclusively on the core essentials without the clutter. No ads, no distracting social features, just purely engineered tools to help you study, practice, and track your progress in a beautiful interface.",
  },
  {
    question: "Do you provide video lectures?",
    answer: "No. JEE Pro is a companion tool for self-study and practice. It is designed to be used alongside your primary learning materials, providing the best environment for mock tests, analytics, and revision.",
  },
  {
    question: "Are the mock tests pattern-accurate?",
    answer: "Yes, our mock test interface is built to exactly replicate the NTA exam environment. This ensures you build the right muscle memory before the actual exam day.",
  },
  {
    question: "Is there a mobile app?",
    answer: "JEE Pro is a fully responsive Progressive Web App (PWA). You can install it on your home screen directly from your browser on iOS or Android, giving you a native app experience.",
  },
];

export function FaqSection() {
  return (
    <section className="py-24 sm:py-32" id="faq">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card/30 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50">
                <AccordionTrigger className="text-left text-lg hover:no-underline hover:text-accent transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
