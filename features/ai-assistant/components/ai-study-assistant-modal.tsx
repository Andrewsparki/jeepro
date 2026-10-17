"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Lock background document scrolling while the assistant is open
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isFullscreen) {
          e.preventDefault();
          e.stopPropagation();
          setIsFullscreen(false);
        } else {
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

  if (!isOpen) return null;

  return (
    <FixedPortal>
      <AnimatePresence>
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
            isFullscreen ? "p-0" : "p-3 sm:p-5 md:p-6"
          }`}
        >
          {/* Backdrop: translucent dark frost with backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#07090E]/60 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal / Fullscreen Container: Glassmorphic translucent shell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            style={{
              height: isFullscreen ? "100dvh" : "min(88dvh, 800px)",
              maxHeight: isFullscreen ? "100dvh" : "800px",
              width: isFullscreen ? "100vw" : "min(94vw, 896px)",
            }}
            className={`relative flex flex-col min-h-0 min-w-0 bg-[#0B0D13]/75 text-[#F5F7FB] shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(120,169,255,0.06)] backdrop-blur-3xl ring-1 ring-[#78A9FF]/20 overflow-hidden ${
              isFullscreen
                ? "rounded-none border-none"
                : "rounded-2xl border border-[#2B3342]/70"
            }`}
          >
            {/* Header (Fixed shrink-0): Frosted glass */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2B3342]/50 bg-[#121722]/50 backdrop-blur-md shrink-0 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#78A9FF]/20 to-[#4378FF]/30 border border-[#78A9FF]/30 flex items-center justify-center shadow-[0_0_15px_rgba(120,169,255,0.15)] shrink-0">
                  <Sparkles className="h-5 w-5 text-[#78A9FF]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-[#F5F7FB] tracking-tight truncate">
                      JEE Pro AI Assistant
                    </h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 shrink-0">
                      Gemini 3.6 Flash
                    </span>
                  </div>
                  <p className="text-xs text-[#A4ADBB] truncate hidden sm:block">
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
                    className="p-2 rounded-lg text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-[#1A2232] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-[#1A2232] transition-colors"
                  title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-[#78A9FF]" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-[#A4ADBB] hover:text-[#F5F7FB] hover:bg-[#1A2232] transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Context Sub-bar (if active) */}
            {(contextData?.subject || contextData?.chapter) && (
              <div className="px-5 py-2 bg-[#121722]/90 border-b border-[#2B3342]/50 flex items-center gap-2 text-xs text-[#A4ADBB] shrink-0 min-w-0">
                <BookOpen className="h-3.5 w-3.5 text-[#78A9FF] shrink-0" />
                <span className="shrink-0">Context:</span>
                {contextData.subject && (
                  <span className="font-medium text-[#78A9FF] truncate">{contextData.subject}</span>
                )}
                {contextData.chapter && (
                  <span className="text-[#F5F7FB] truncate">› {contextData.chapter}</span>
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
                    <div className="h-14 w-14 rounded-2xl bg-[#171E2C] border border-[#2B3342] flex items-center justify-center mb-4 shadow-inner">
                      <Lightbulb className="h-7 w-7 text-[#78A9FF]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#F5F7FB] mb-1.5">
                      How can I help with your JEE prep?
                    </h3>
                    <p className="text-sm text-[#A4ADBB] mb-6 leading-relaxed">
                      Ask me to break down tricky derivations, solve numericals step-by-step, or clarify mechanisms with LaTeX formulas.
                    </p>

                    {/* Suggestions */}
                    <div className="w-full space-y-2 text-left">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#A4ADBB]/70 px-1 font-semibold">
                        Suggested topics
                      </div>
                      {SUGGESTED_PROMPTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => sendMessage(item.prompt, contextData)}
                            className="w-full flex items-start gap-3 p-3 rounded-xl border border-[#2B3342]/70 bg-[#121722]/50 hover:bg-[#1A2232] hover:border-[#78A9FF]/40 transition-all text-left group cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-[#1A2232] border border-[#2B3342] text-[#78A9FF] group-hover:scale-105 transition-transform shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#78A9FF] mb-0.5">
                                {item.label}
                              </div>
                              <div className="text-xs text-[#A4ADBB] line-clamp-2 group-hover:text-[#F5F7FB] transition-colors">
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
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#78A9FF]/20 to-[#4378FF]/30 border border-[#78A9FF]/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <Bot className="h-4 w-4 text-[#78A9FF]" />
                          </div>
                        )}

                        <div
                          className={`min-w-0 rounded-2xl overflow-hidden break-words shadow-sm backdrop-blur-md ${
                            isFullscreen
                              ? "max-w-[96%] sm:max-w-[88%] lg:max-w-[84%] px-5 sm:px-7 py-4 sm:py-5"
                              : "max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 text-sm leading-relaxed"
                          } ${
                            isAssistant
                              ? "bg-[#131926]/75 border border-[#2B3342]/70 text-[#F5F7FB] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                              : "bg-gradient-to-r from-[#2563EB]/90 to-[#1D4ED8]/90 text-white font-medium shadow-[0_4px_14px_rgba(37,99,235,0.3)] ml-auto"
                          }`}
                        >
                          {isAssistant ? (
                            msg.content ? (
                              <AssistantMessageRenderer content={msg.content} isFullscreen={isFullscreen} />
                            ) : (
                              <div className="flex items-center gap-2 py-1 text-xs text-[#A4ADBB]">
                                <span className="h-2 w-2 rounded-full bg-[#78A9FF] animate-pulse" />
                                <span className="h-2 w-2 rounded-full bg-[#78A9FF] animate-pulse delay-150" />
                                <span className="h-2 w-2 rounded-full bg-[#78A9FF] animate-pulse delay-300" />
                                <span className="font-mono text-[11px] text-[#A4ADBB]/80 ml-1">
                                  Thinking & solving...
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          )}
                        </div>

                        {!isAssistant && (
                          <div className="h-8 w-8 rounded-xl bg-[#1E2638] border border-[#2B3342] flex items-center justify-center shrink-0 mt-0.5">
                            <User className="h-4 w-4 text-[#A4ADBB]" />
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
            <div className="p-3 sm:p-4 border-t border-[#2B3342]/50 bg-[#0E121B]/65 backdrop-blur-xl shrink-0">
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
                      className="w-full resize-none rounded-xl border border-[#2B3342]/80 bg-[#141A27]/70 backdrop-blur-md px-3.5 py-2.5 text-sm text-[#F5F7FB] placeholder:text-[#A4ADBB]/60 focus:border-[#78A9FF] focus:outline-none focus:ring-1 focus:ring-[#78A9FF]/40 transition-colors custom-scrollbar"
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
                        className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0"
                        title="Send Message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
                <div className="flex items-center justify-between mt-2 px-1 text-[11px] font-mono text-[#A4ADBB]/60">
                  <span>Enter to send • Shift+Enter for new line</span>
                  <span>Markdown & KaTeX rendered</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </FixedPortal>
  );
}
