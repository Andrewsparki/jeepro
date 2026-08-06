"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const quotes = [
  { text: "Discipline is doing what you hate to do, but doing it like you love it.", author: "Mike Tyson" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "It’s not that I’m so smart, it’s just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "The pain of regret is far heavier than the pain of discipline.", author: "Jim Rohn" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Don't wish it were easier. Wish you were better.", author: "Jim Rohn" },
  { text: "I have no special talent. I am only passionately curious.", author: "Albert Einstein" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { text: "The price of excellence is discipline. The cost of mediocrity is disappointment.", author: "William Arthur Ward" },
  { text: "Study while others are sleeping; work while others are loafing; prepare while others are playing.", author: "William Arthur Ward" },
  { text: "Do not wait; the time will never be 'just right.' Start where you stand.", author: "George Herbert" },
  { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", author: "Pelé" },
  { text: "You don't have to be extreme, just consistent.", author: "Anonymous" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "There is no substitute for hard work.", author: "Thomas Edison" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "If you want to master something, teach it.", author: "Richard Feynman" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "To acquire knowledge, one must study; but to acquire wisdom, one must observe.", author: "Marilyn vos Savant" },
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Things may come to those who wait, but only the things left by those who hustle.", author: "Abraham Lincoln" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas Edison" },
  { text: "The future belongs to those who prepare for it today.", author: "Malcolm X" }
];

export function MotivationalQuotes() {
  const [history, setHistory] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initial random quote on mount
    const startIdx = Math.floor(Math.random() * quotes.length);
    setHistory([startIdx]);
    setIsMounted(true);
  }, []);

  const handleNext = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const recent = history.slice(-10);
      let nextIdx = Math.floor(Math.random() * quotes.length);
      while (recent.includes(nextIdx)) {
        nextIdx = Math.floor(Math.random() * quotes.length);
      }
      setHistory((prev) => [...prev, nextIdx]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!isMounted || history.length === 0) {
    return (
      <div className="premium-card flex flex-col justify-center items-center p-8 min-h-[140px] opacity-0">
        <div className="w-full max-w-2xl animate-pulse bg-muted/20 h-8 rounded-lg mb-4" />
        <div className="w-32 animate-pulse bg-muted/20 h-4 rounded-lg" />
      </div>
    );
  }

  const currentQuote = quotes[history[currentIndex]];
  const canGoBack = currentIndex > 0;

  return (
    <div className="relative premium-card overflow-hidden group min-h-[140px] flex items-center p-8 sm:px-12 bg-gradient-to-br from-glass/30 to-transparent">
      
      {/* Decorative Quote Icon */}
      <Quote className="absolute top-4 left-4 w-6 h-6 text-white/5 opacity-50 rotate-180 pointer-events-none" />
      
      {/* Tiny Progress Indicator */}
      <div className="absolute top-4 right-5 text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/40 pointer-events-none">
        Quote {(history[currentIndex] + 1).toString().padStart(2, '0')} / {quotes.length}
      </div>

      <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-6 relative z-10">
        
        {/* Previous Button */}
        <button 
          onClick={handlePrevious}
          disabled={!canGoBack}
          className={cn(
            "p-2 rounded-full transition-all duration-300 outline-none shrink-0",
            canGoBack 
              ? "text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95" 
              : "text-muted-foreground/20 cursor-not-allowed opacity-50"
          )}
          aria-label="Previous quote"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Quote Content container */}
        <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: "blur(4px)", y: 2 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(4px)", y: -2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h4 className="text-lg sm:text-xl md:text-2xl font-serif tracking-tight text-foreground/90 leading-relaxed max-w-[90%]">
                "{currentQuote.text}"
              </h4>
              <p className="mt-4 text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/70">
                — {currentQuote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="p-2 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 outline-none active:scale-95"
          aria-label="Next quote"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}
