"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Square, 
  Trash2, 
  X, 
  Bot, 
  User, 
  BookOpen, 
  Atom, 
  Calculator, 
  Flame, 
  Lightbulb,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useAiAssistant } from "../context/ai-assistant-context";
import { useAiAssistantChat } from "../hooks/use-ai-assistant-chat";
import { AssistantMessageRenderer } from "./assistant-message-renderer";
import { Button } from "@/components/ui/button";
import { FixedPortal } from "@/components/ui/fixed-portal";
import { useSubSmoothScroll } from "@/components/ui/sub-smooth-scroll";

const SUGGESTED_PROMPTS = [
  {
    icon: Atom,
    label: "Physics",
    prompt: "Explain Lenz's Law and how it relates to conservation of energy in electromagnetic induction.",
  },
  {
    icon: Calculator,
    label: "Maths",
    prompt: "How do I find the shortest distance between two skew lines using vector triple product?",
  },
  {
    icon: Flame,
    label: "Chemistry",
    prompt: "Explain the mechanism of nucleophilic aromatic substitution (SNAr) with electron-withdrawing groups.",
  },
];

const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (custom: { shouldReduceMotion: boolean }) => ({
    opacity: 0,
    transition: {
      duration: custom.shouldReduceMotion ? 0.15 : 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const modalShellVariants: Variants = {
  initial: (custom: { isFullscreen: boolean; shouldReduceMotion: boolean }) => {
    if (custom.shouldReduceMotion) {
      return { opacity: 0 };
    }
    return custom.isFullscreen
      ? { opacity: 0, scale: 0.985, y: 0 }
      : { opacity: 0, scale: 0.96, y: 10 };
  },
  animate: (custom: { isFullscreen: boolean; shouldReduceMotion: boolean }) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: custom.shouldReduceMotion ? 0.15 : 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: (custom: { isFullscreen: boolean; shouldReduceMotion: boolean }) => {
    if (custom.shouldReduceMotion) {
      return {
        opacity: 0,
        transition: { duration: 0.15, ease: "linear" },
      };
    }
    return custom.isFullscreen
      ? {
          opacity: 0,
          scale: 0.985,
          y: 0,
          transition: {
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          },
        }
      : {
          opacity: 0,
          scale: 0.96,
          y: -10, // subtle upward movement on normal modal exit
          transition: {
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          },
        };
  },
};

export function AiStudyAssistantModal() {
  const { isOpen, setIsOpen, contextData } = useAiAssistant();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGenerating,
  } = useAiAssistantChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  // Dedicated Locomotive / Lenis momentum inertia scroll engine for conversation area
  const {
    containerRef: scrollContainerRef,
    contentRef: scrollContentRef,
    resize: resizeScroll,
    scrollTo: scrollToBottom,
  } = useSubSmoothScroll<HTMLDivElement>({
    enabled: isOpen,
    overscroll: true,
    lerp: 0.1,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  // Monitor user scrolling to detect if user has scrolled away from bottom
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 120; // px threshold from bottom
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= threshold;
  };

  // Re-measure dimensions as new tokens stream in
  useEffect(() => {
    resizeScroll();
    if (isNearBottomRef.current) {
      const el = scrollContainerRef.current;
      if (el) {
        scrollToBottom(el.scrollHeight, { immediate: false });
      }
    }
  }, [messages, isLoading, resizeScroll, scrollToBottom]);

  // Isolate wheel & trackpad events from global scroll interrupters
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isExiting, setIsExiting] = useState(false);
  const [openingCount, setOpeningCount] = useState(0);
  const wasOpenRef = useRef(false);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus input, increment opening count for keyframes, and remember trigger element when opened
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setIsExiting(false);
      setOpeningCount((prev) => prev + 1);
      previousActiveElementRef.current = (document.activeElement as HTMLElement) || null;
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else if (wasOpenRef.current) {
      setIsExiting(true);
    }
  }, [isOpen]);

  const handleExitComplete = useCallback(() => {
    wasOpenRef.current = false;
    setIsExiting(false);
    if (previousActiveElementRef.current) {
      const el = previousActiveElementRef.current;
      previousActiveElementRef.current = null;
      requestAnimationFrame(() => {
        el.focus?.();
      });
    }
  }, []);

  const isScrollLocked = isOpen || isExiting;

  // Lock background document scrolling while the assistant is open or animating out
  useEffect(() => {
    if (!isScrollLocked) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isScrollLocked]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          e.preventDefault();
          e.stopPropagation();
          setIsFullscreen(false);
        } else {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, setIsOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, contextData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <FixedPortal>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen && (
          <motion.div 
            key="ai-assistant-wrapper"
            className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
              isFullscreen ? "p-0" : "p-3 sm:p-5 md:p-6"
            }`}
          >
            {/* Backdrop: translucent dark frost with backdrop blur */}
            <motion.div
              key="ai-assistant-backdrop"
              variants={backdropVariants}
              custom={{ shouldReduceMotion }}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal / Fullscreen Container: Glassmorphic translucent shell */}
            <motion.div
              key="ai-assistant-shell"
              variants={modalShellVariants}
              custom={{ isFullscreen, shouldReduceMotion }}
              initial="initial"
              animate="animate"
              exit="exit"
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              style={{
                height: isFullscreen ? "100dvh" : "min(88dvh, 800px)",
                maxHeight: isFullscreen ? "100dvh" : "800px",
                width: isFullscreen ? "100vw" : "min(94vw, 896px)",
              }}
              className={`relative flex flex-col min-h-0 min-w-0 bg-card/90 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_var(--accent-glow)] backdrop-blur-3xl ring-1 ring-accent/20 overflow-hidden ${
                isFullscreen
                  ? "rounded-none border-none"
                  : "rounded-2xl border border-border/70"
              }`}
            >
            {/* Cinematic Opening Border Light Sweep (plays on each opening) */}
            {!shouldReduceMotion && (
              <div 
                key={`ai-border-trace-${openingCount}`}
                className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-20"
              >
                <div 
                  className="absolute -inset-[150%] animate-ai-border-trace opacity-0 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, transparent 50deg, var(--accent) 75deg, rgba(255, 255, 255, 0.95) 88deg, var(--accent) 100deg, transparent 130deg, transparent 360deg)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    padding: "1.5px",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            )}

            {/* Header (Fixed shrink-0): Frosted glass */}
            <div className="relative flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-surface/50 backdrop-blur-md shrink-0 select-none overflow-hidden">
              {/* Cinematic Header Light Scan (150-500ms reveal) */}
              {!shouldReduceMotion && (
                <div
                  key={`ai-header-scan-${openingCount}`}
                  className="absolute inset-0 pointer-events-none animate-ai-header-scan opacity-0 z-10"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(var(--accent-rgb), 0.15) 35%, rgba(255, 255, 255, 0.6) 50%, rgba(var(--accent-rgb), 0.15) 65%, transparent 100%)`,
                  }}
                />
              )}

              <div className="flex items-center gap-3 min-w-0 z-10">
                <div 
                  key={`ai-icon-${openingCount}`}
                  className={`h-9 w-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] shrink-0 ${
                    !shouldReduceMotion ? "animate-ai-icon-ping" : ""
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight truncate">
                      JEE Pro AI Assistant
                    </h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-accent/10 text-accent border border-accent/20 shrink-0">
                      Gemini 3.6 Flash
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    Physics • Chemistry • Mathematics Solver & Conceptual Tutor
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear Conversation"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-accent" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Context Sub-bar (if active) */}
            {(contextData?.subject || contextData?.chapter) && (
              <div className="px-5 py-2 bg-surface/90 border-b border-border/50 flex items-center gap-2 text-xs text-muted-foreground shrink-0 min-w-0">
                <BookOpen className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="shrink-0">Context:</span>
                {contextData.subject && (
                  <span className="font-medium text-accent truncate">{contextData.subject}</span>
                )}
                {contextData.chapter && (
                  <span className="text-foreground truncate">› {contextData.chapter}</span>
                )}
              </div>
            )}

            {/* Message List (Strictly flexible, min-height: 0, internal scrolling only) */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              tabIndex={0}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              style={{
                overscrollBehavior: "contain",
                outline: "none",
                flex: "1 1 0%",
                minHeight: 0,
                overflowY: "auto",
              }}
              className="w-full min-w-0 overflow-x-hidden p-4 sm:p-6 space-y-5 custom-scrollbar touch-pan-y focus-visible:outline-none"
            >
              <div ref={scrollContentRef} className={`mx-auto w-full space-y-5 ${isFullscreen ? "max-w-5xl px-2 sm:px-6" : ""}`}>
                {messages.length === 0 ? (
                  <div className="py-12 flex flex-col justify-center items-center text-center px-4 max-w-lg mx-auto">
                    <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 shadow-inner">
                      <Lightbulb className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">
                      How can I help with your JEE prep?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Ask me to break down tricky derivations, solve numericals step-by-step, or clarify mechanisms with LaTeX formulas.
                    </p>

                    {/* Suggestions */}
                    <div className="w-full space-y-2 text-left">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 px-1 font-semibold">
                        Suggested topics
                      </div>
                      {SUGGESTED_PROMPTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => sendMessage(item.prompt, contextData)}
                            className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-surface/50 hover:bg-surface hover:border-accent/40 transition-all text-left group cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-surface border border-border text-accent group-hover:scale-105 transition-transform shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-accent mb-0.5">
                                {item.label}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                                {item.prompt}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAssistant = msg.role === "assistant";
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 w-full min-w-0 ${
                          isAssistant ? "justify-start" : "justify-end"
                        }`}
                      >
                        {isAssistant && (
                          <div className="h-8 w-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <Bot className="h-4 w-4 text-accent" />
                          </div>
                        )}

                        <div
                          className={`min-w-0 rounded-2xl overflow-hidden break-words shadow-sm backdrop-blur-md ${
                            isFullscreen
                              ? "max-w-[96%] sm:max-w-[88%] lg:max-w-[84%] px-5 sm:px-7 py-4 sm:py-5"
                              : "max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 text-sm leading-relaxed"
                          } ${
                            isAssistant
                              ? "bg-card/80 border border-border/70 text-foreground shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                              : "bg-accent text-accent-foreground font-medium shadow-[0_4px_14px_var(--accent-glow)] ml-auto"
                          }`}
                        >
                          {isAssistant ? (
                            msg.content ? (
                              <AssistantMessageRenderer content={msg.content} isFullscreen={isFullscreen} />
                            ) : (
                              <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse delay-150" />
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse delay-300" />
                                <span className="font-mono text-[11px] text-muted-foreground/80 ml-1">
                                  Thinking & solving...
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          )}
                        </div>

                        {!isAssistant && (
                          <div className="h-8 w-8 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {error && (
                  <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-center justify-between">
                    <span>{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Composer (Fixed shrink-0): Frosted glass */}
            <div className="p-3 sm:p-4 border-t border-border/50 bg-card/65 backdrop-blur-xl shrink-0">
              <div className={`mx-auto w-full ${isFullscreen ? "max-w-5xl px-2 sm:px-6" : ""}`}>
                <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                  <div className="relative flex-1 min-w-0">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask any physics, chemistry, or math concept/problem... (Shift+Enter for newline)"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-border/80 bg-surface/70 backdrop-blur-md px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors custom-scrollbar"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pb-1 shrink-0">
                    {isLoading ? (
                      <Button
                        type="button"
                        onClick={stopGenerating}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl border-red-500/30 text-red-400 hover:bg-red-950/30 shrink-0"
                        title="Stop Generating"
                      >
                        <Square className="h-4 w-4 fill-current" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!input.trim()}
                        className="h-10 w-10 rounded-xl bg-accent hover:opacity-90 text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_var(--accent-glow)] shrink-0 transition-opacity"
                        title="Send Message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
                <div className="flex items-center justify-between mt-2 px-1 text-[11px] font-mono text-muted-foreground/60">
                  <span>Enter to send • Shift+Enter for new line</span>
                  <span>Markdown & KaTeX rendered</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </FixedPortal>
);
}
