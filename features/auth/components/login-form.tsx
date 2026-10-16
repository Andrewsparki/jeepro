"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { login, signup, loginWithGoogle } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  Loader2, 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  BookOpen, 
  RefreshCw, 
  Timer, 
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  initialMode?: "login" | "signup";
}

export function LoginForm({ initialMode = "login" }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextTarget = searchParams?.get("next") || "";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError(null);
    const search = nextTarget ? `?next=${encodeURIComponent(nextTarget)}` : "";
    window.history.replaceState(null, "", (newMode === "login" ? "/login" : "/signup") + search);
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const result = mode === "login" 
      ? await login(formData) 
      : await signup(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE: BRANDING & REAL TELEMETRY                                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            {/* Tracking Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] text-zinc-300 font-mono text-[11px] uppercase tracking-wider w-fit">
              <span>AUTHENTICATED ACCESS // JEE 2026</span>
            </div>

            {/* Confident Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              {mode === "login" ? (
                <>
                  Return to Your <br />
                  Preparation Workspace.
                </>
              ) : (
                <>
                  Build Your <br />
                  Preparation System.
                </>
              )}
            </h1>

            {/* Restrained Supporting Copy */}
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-md">
              {mode === "login"
                ? "Resume your active study blocks, formula spaced recall queues, and previous year problem sets."
                : "A high-precision study operating system engineered specifically for JEE Main and Advanced aspirants."}
            </p>
          </div>

          {/* Genuine Capability Modules (No Fabricated Statistics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg pt-2">
            {/* Capability 1 */}
            <div className="p-4 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-200 flex items-center justify-center border border-white/[0.08] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">90 Chapters</p>
                <p className="text-[10px] font-mono text-zinc-400">NCERT &amp; IIT Bombay</p>
              </div>
            </div>

            {/* Capability 2 */}
            <div className="p-4 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-200 flex items-center justify-center border border-white/[0.08] shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Spaced Recall</p>
                <p className="text-[10px] font-mono text-zinc-400">24h • 3d • 7d • 21d</p>
              </div>
            </div>

            {/* Capability 3 */}
            <div className="p-4 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-200 flex items-center justify-center border border-white/[0.08] shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Focus Chamber</p>
                <p className="text-[10px] font-mono text-zinc-400">Floating PiP Timer</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: CLEAN OBSIDIAN AUTH CARD                                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div 
            className="relative w-full max-w-[430px] rounded-2xl sm:rounded-3xl p-7 sm:p-9 bg-[#121722]/90 border border-[#2B3342] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden space-y-6"
          >
            {/* Segmented Mode Switcher */}
            <div className="flex items-center p-1 bg-[#0B0D12] border border-[#2B3342] rounded-xl w-full max-w-[280px] mx-auto select-none">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={cn(
                  "relative flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors duration-150 text-center select-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#78A9FF]",
                  mode === "login" ? "text-[#F5F7FB] font-bold" : "text-[#A4ADBB] hover:text-[#F5F7FB]"
                )}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="auth-active-tab-capsule"
                    className="absolute inset-0 rounded-lg bg-[#171D28] border border-[#78A9FF]/40 shadow-xs pointer-events-none"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign in</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={cn(
                  "relative flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors duration-150 text-center select-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#78A9FF]",
                  mode === "signup" ? "text-[#F5F7FB] font-bold" : "text-[#A4ADBB] hover:text-[#F5F7FB]"
                )}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="auth-active-tab-capsule"
                    className="absolute inset-0 rounded-lg bg-[#171D28] border border-[#78A9FF]/40 shadow-xs pointer-events-none"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Create account</span>
              </button>
            </div>

            {/* Header Text */}
            <div className="flex flex-col items-center text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {mode === "login" ? "Sign in to JEE Pro" : "Create your workspace"}
              </h2>
              <p className="text-xs text-zinc-400 font-normal">
                {mode === "login" ? "Enter your credentials to continue." : "Free access across all 90 chapters."}
              </p>
            </div>

            {/* Social Authentication Options */}
            <div className="space-y-2.5">
              {/* Google Button */}
              <form action={async () => {
                const result = await loginWithGoogle(nextTarget);
                if (result?.error) {
                  setError(result.error);
                }
              }}>
                <Button 
                  variant="outline" 
                  type="submit" 
                  className="w-full h-11 text-xs sm:text-sm font-semibold bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-zinc-200 rounded-xl transition-colors flex items-center justify-center gap-2.5"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </form>
            </div>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/[0.08]" />
              <span className="absolute bg-[#090C15] px-3 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                or
              </span>
            </div>

            {/* Email / Password Form */}
            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="next" value={nextTarget} />
              
              {/* Full Name Field (Smoothly Expands on Signup Mode) */}
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div
                    key="signup-fullname"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.25, ease: "easeOut" },
                      opacity: { duration: 0.2 }
                    }}
                    className="overflow-hidden space-y-1"
                  >
                    <Label htmlFor="fullName" className="text-xs font-mono uppercase text-zinc-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <Input 
                        id="fullName" 
                        name="fullName"
                        type="text" 
                        placeholder="Aspirant Name" 
                        required={mode === "signup"}
                        className="bg-black border border-white/[0.12] focus:border-white focus:ring-1 focus:ring-white rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-zinc-500 pl-10 pr-4"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-mono uppercase text-zinc-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    className="bg-black border border-white/[0.12] focus:border-white focus:ring-1 focus:ring-white rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-zinc-500 pl-10 pr-4"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-mono uppercase text-zinc-300">
                    Password
                  </Label>
                  {mode === "login" && (
                    <Link href="/forgot-password" className="text-xs text-zinc-400 hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required 
                    minLength={mode === "signup" ? 6 : undefined}
                    className="bg-black border border-white/[0.12] focus:border-white focus:ring-1 focus:ring-white rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-zinc-500 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
                  {error}
                </div>
              )}

              {/* Dynamic Electric Blue CTA Button */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] shadow-[0_2px_14px_rgba(120,169,255,0.35)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B0D12]" />
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign in to workspace" : "Create account"}</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0D12] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Bottom Toggle Note */}
            <p className="text-center text-xs text-zinc-400">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("signup")}
                    className="font-semibold text-zinc-200 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="font-semibold text-zinc-200 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Security Indicator */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#A4ADBB]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>100% PRIVATE • ZERO TRACKERS • NO ADS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
