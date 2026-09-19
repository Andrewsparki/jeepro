"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import {
  createSupportTicket,
  getUserSupportTickets,
  type SupportTicket,
  type CreateSupportTicketInput,
} from "@/features/support/services/support.service";
import {
  LifeBuoy,
  Search,
  Send,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  User,
  CreditCard,
  Calendar,
  Bug,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { dispatchInteractionSound } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ─── FAQ Data ───────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "general",
    label: "General",
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      {
        question: "What is JEE Pro?",
        answer:
          "JEE Pro is an AI-powered JEE preparation platform that helps you study smarter with structured syllabus tracking, focus sessions, analytics, and social features to keep you motivated.",
      },
      {
        question: "Is JEE Pro free to use?",
        answer:
          "JEE Pro offers a free tier with core features. Premium plans unlock advanced analytics, unlimited study groups, and priority support.",
      },
      {
        question: "How does the XP system work?",
        answer:
          "You earn XP by completing study sessions, mastering topics, maintaining streaks, and achieving milestones. XP is used for leaderboard rankings and unlocking achievements.",
      },
      {
        question: "Can I use JEE Pro on mobile?",
        answer:
          "Yes! JEE Pro is fully responsive and works on all screen sizes. A dedicated mobile app is planned for future release.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & Profile",
    icon: <User className="w-4 h-4" />,
    items: [
      {
        question: "How do I change my profile name?",
        answer:
          "Go to Settings → Profile and update your display name. Changes are reflected across the platform immediately.",
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer:
          "Click \"Forgot Password\" on the login page. You'll receive a password reset email with a secure link to create a new password.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Account deletion is handled by our support team to ensure your data is properly removed. Submit a support request below with category \"Account\" and we'll take care of it.",
      },
    ],
  },
  {
    id: "study_tools",
    label: "Study Tools & Planner",
    icon: <Calendar className="w-4 h-4" />,
    items: [
      {
        question: "How does the Focus Timer work?",
        answer:
          "The Focus Timer tracks your study sessions with configurable durations. It automatically logs XP, updates your streak, and records the session in your study history.",
      },
      {
        question: "How do I track my syllabus progress?",
        answer:
          "Navigate to the Syllabus tab to see all Physics, Chemistry, and Mathematics chapters. Mark topics as complete to track your mastery percentage across subjects.",
      },
      {
        question: "What is the Study Planner?",
        answer:
          "The Planner lets you schedule study events on a calendar, set reminders, and organize your preparation timeline. It integrates with your syllabus progress.",
      },
      {
        question: "My study session wasn't recorded. What happened?",
        answer:
          "Sessions shorter than 60 seconds are not recorded. If a longer session is missing, check your internet connection and try refreshing. If the issue persists, submit a support request.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        question: "How do I upgrade my plan?",
        answer:
          "Visit the Pricing page from your dashboard to view available plans and upgrade. Payment is processed securely through our payment provider.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "Refund requests are evaluated on a case-by-case basis. Submit a support request with category \"Billing\" within 7 days of purchase for consideration.",
      },
    ],
  },
];

// ─── Category Config ────────────────────────────────────────────────────────

const TICKET_CATEGORIES = [
  { value: "general" as const, label: "General Question", icon: BookOpen },
  { value: "account" as const, label: "Account & Profile", icon: User },
  { value: "billing" as const, label: "Billing & Plans", icon: CreditCard },
  { value: "study_planner" as const, label: "Study Tools & Planner", icon: Calendar },
  { value: "bug_report" as const, label: "Bug Report", icon: Bug },
  { value: "feature_request" as const, label: "Feature Request", icon: Lightbulb },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open: {
    label: "Open",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: <Inbox className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <Loader2 className="w-3 h-3" />,
  },
  resolved: {
    label: "Resolved",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  closed: {
    label: "Closed",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

// ─── Support Center Component ───────────────────────────────────────────────

type SupportTab = "help" | "contact" | "requests";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<SupportTab>("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Contact form state
  const [formCategory, setFormCategory] = useState<CreateSupportTicketInput["category"]>("general");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Requests state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    const { tickets: data, error } = await getUserSupportTickets();
    if (error) {
      setTicketsError(error);
    }
    setTickets(data);
    setTicketsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "requests") {
      void getUserSupportTickets().then(({ tickets: data, error }) => {
        if (!ignore) {
          if (error) {
            setTicketsError(error);
          }
          setTickets(data);
          setTicketsLoading(false);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  // Filtered FAQ items
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = await createSupportTicket({
      category: formCategory,
      subject: formSubject,
      description: formDescription,
    });

    if (result.success) {
      toast.success("Support request submitted successfully!");
      setFormSubject("");
      setFormDescription("");
      setFormCategory("general");
      setActiveTab("requests");
      loadTickets();
    } else {
      toast.error(result.error || "Failed to submit support request.");
    }
    setIsSubmitting(false);
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabs: { key: SupportTab; label: string; icon: React.ReactNode }[] = [
    { key: "help", label: "Help Center", icon: <BookOpen className="w-4 h-4" /> },
    { key: "contact", label: "Contact Support", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "requests", label: "My Requests", icon: <Inbox className="w-4 h-4" /> },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 max-w-4xl mx-auto w-full">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-accent/5 via-background to-background p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Support Center</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Find answers, browse common questions, or contact our team.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/40">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                dispatchInteractionSound("ui.tab");
                setActiveTab(tab.key);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ─── Help Center Tab ────────────────────────────────────────── */}
          {activeTab === "help" && (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search common questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/40 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                />
              </div>

              {/* FAQ Accordion Categories */}
              {filteredFAQs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">No results found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Try a different search term, or{" "}
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="text-accent hover:underline"
                    >
                      contact support
                    </button>{" "}
                    for further help.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl border border-border/40 bg-background/60 overflow-hidden"
                    >
                      <div className="px-5 py-3.5 border-b border-border/30 bg-muted/20">
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                          <span className="text-accent">{category.icon}</span>
                          {category.label}
                          <span className="text-xs text-muted-foreground font-normal ml-auto">
                            {category.items.length} {category.items.length === 1 ? "article" : "articles"}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-border/30">
                        {category.items.map((item, idx) => {
                          const faqKey = `${category.id}-${idx}`;
                          const isExpanded = expandedFAQ === faqKey;
                          return (
                            <button
                              key={faqKey}
                              onClick={() => setExpandedFAQ(isExpanded ? null : faqKey)}
                              className="w-full text-left px-5 py-3.5 hover:bg-muted/10 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-muted-foreground shrink-0">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-accent" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      "text-sm font-medium transition-colors",
                                      isExpanded ? "text-accent" : "text-foreground"
                                    )}
                                  >
                                    {item.question}
                                  </p>
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                          {item.answer}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA to contact */}
              <div className="flex items-center justify-between p-5 rounded-xl border border-border/40 bg-muted/10">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Still need help?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Our team is here to assist you with any questions or issues.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("contact")}
                  className="rounded-full px-5 gap-2"
                  size="sm"
                >
                  Contact Support
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Contact Support Tab ────────────────────────────────────── */}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl border border-border/40 bg-background/60 p-5 md:p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Submit a Request</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Describe your issue or question and we&apos;ll get back to you as soon as possible.
                    </p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TICKET_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = formCategory === cat.value;
                        return (
                          <button
                            type="button"
                            key={cat.value}
                            onClick={() => setFormCategory(cat.value)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left",
                              isSelected
                                ? "bg-accent/10 text-accent border-accent/20"
                                : "bg-muted/10 text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="support-subject" className="text-sm font-medium text-foreground">
                      Subject
                    </label>
                    <input
                      id="support-subject"
                      type="text"
                      placeholder="Brief summary of your issue..."
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      required
                      minLength={4}
                      className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="support-description" className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      id="support-description"
                      placeholder="Please describe your issue in detail. Include any relevant steps, error messages, or context that can help us assist you faster..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                      minLength={10}
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all resize-y min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formSubject.trim() || !formDescription.trim()}
                    className="rounded-full px-6 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── My Requests Tab ────────────────────────────────────────── */}
          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Support Requests</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadTickets}
                  disabled={ticketsLoading}
                  className="gap-1.5 text-muted-foreground rounded-full"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", ticketsLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>

              {ticketsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/40 bg-background/60 p-5">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ticketsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border/40 bg-background/60">
                  <AlertCircle className="w-10 h-10 text-destructive/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">Error loading requests</h3>
                  <p className="text-xs text-muted-foreground">{ticketsError}</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border/50 bg-background/40">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Inbox className="w-7 h-7 text-accent/60" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">No support requests yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    When you submit a support request, it will appear here with its current status.
                  </p>
                  <Button
                    onClick={() => setActiveTab("contact")}
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Submit a Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                    const catConfig = TICKET_CATEGORIES.find((c) => c.value === ticket.category);
                    const CatIcon = catConfig?.icon || BookOpen;
                    const isExpanded = expandedTicket === ticket.id;

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                        className="w-full text-left rounded-xl border border-border/40 bg-background/60 hover:border-border/60 transition-all"
                      >
                        <div className="p-4 md:p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/5 border border-border/40 flex items-center justify-center shrink-0 mt-0.5">
                              <CatIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {ticket.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(ticket.created_at)}
                                    <span className="text-border">·</span>
                                    {catConfig?.label || ticket.category}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 uppercase tracking-wider",
                                    status.color
                                  )}
                                >
                                  {status.icon}
                                  {status.label}
                                </span>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 pt-3 border-t border-border/30">
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {ticket.description}
                                      </p>
                                      {ticket.resolved_at && (
                                        <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Resolved on {formatDate(ticket.resolved_at)}
                                        </p>
                                      )}
                                      <p className="text-[10px] text-muted-foreground/50 font-mono mt-2">
                                        Ticket ID: {ticket.id.slice(0, 8)}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
