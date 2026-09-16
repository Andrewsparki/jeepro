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
  TrendingUp, 
  Target, 
  Trophy, 
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE: BRANDING & HUD TELEMETRY                                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 lg:space-y-10">
          <div className="space-y-5">
            {/* Tracking Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.28em] text-[#38bdf8] uppercase">
              <span>Focus</span>
              <span className="text-[#38bdf8]/40">•</span>
              <span>Plan</span>
              <span className="text-[#38bdf8]/40">•</span>
              <span>Practice</span>
              <span className="text-[#38bdf8]/40">•</span>
              <span className="text-[#c084fc]">Pro</span>
            </div>

            {/* Confident Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.08]">
              {mode === "login" ? (
                <>
                  Your potential <br />
                  is the <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">formula.</span>
                </>
              ) : (
                <>
                  Create your <br />
                  <span className="bg-gradient-to-r from-[#1EA7FF] via-[#7257FF] to-[#C958FF] bg-clip-text text-transparent">workspace.</span>
                </>
              )}
            </h1>

            {/* Restrained Supporting Copy */}
            <p className="text-sm sm:text-base text-[#98A0B3] font-normal leading-relaxed max-w-md">
              {mode === "login"
                ? "A high-precision workspace engineered for JEE Advanced. Intelligence, focus, and clarity unified in one physical interface."
                : "Build your preparation system. High-precision analytics, adaptive practice, and deep focus unified in one physical interface."}
            </p>
          </div>

          {/* Clean HUD Telemetry Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg pt-2">
            {/* HUD Item 1 */}
            <div className="px-3.5 py-3 rounded-xl bg-[#070E1E]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-3 group hover:border-cyan-500/30 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">1M+</p>
                <p className="text-[10px] text-[#98A0B3]/80">Aspiring champs</p>
              </div>
            </div>

            {/* HUD Item 2 */}
            <div className="px-3.5 py-3 rounded-xl bg-[#070E1E]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-3 group hover:border-indigo-500/30 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">50K+</p>
                <p className="text-[10px] text-[#98A0B3]/80">Tests solved</p>
              </div>
            </div>

            {/* HUD Item 3 */}
            <div className="px-3.5 py-3 rounded-xl bg-[#070E1E]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-3 group hover:border-purple-500/30 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">230+</p>
                <p className="text-[10px] text-[#98A0B3]/80">Toppers stories</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: FLUID MORPHING FROSTED GLASS AUTH CARD                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div 
            className="relative w-full max-w-[430px] rounded-[32px] p-7 sm:p-9 bg-[#070E1E]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden space-y-5 transition-all duration-300"
          >
            
            {/* Minimalist Top Specular Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Segmented Linear-Style Tab Switcher */}
            <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl w-full max-w-[280px] mx-auto relative select-none">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={cn(
                  "relative flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-200 z-10 text-center select-none",
                  mode === "login" ? "text-black font-bold" : "text-slate-400 hover:text-white"
                )}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="auth-active-tab-capsule"
                    className="absolute inset-0 rounded-xl bg-white shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span>Sign in</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={cn(
                  "relative flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-200 z-10 text-center select-none",
                  mode === "signup" ? "text-black font-bold" : "text-slate-400 hover:text-white"
                )}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="auth-active-tab-capsule"
                    className="absolute inset-0 rounded-xl bg-white shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span>Create account</span>
              </button>
            </div>

            {/* Header Text */}
            <div className="flex flex-col items-center text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {mode === "login" ? "Welcome back." : "Create account."}
              </h2>
              <p className="text-xs text-[#98A0B3] font-medium">
                {mode === "login" ? "Back to work." : "Start your preparation system."}
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
                  className="w-full h-11 text-xs sm:text-sm font-medium bg-white/[0.035] hover:bg-white/[0.07] border-white/10 hover:border-white/20 text-slate-200 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2.5 backdrop-blur-md"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
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
              <span className="absolute bg-[#070D1A] px-3 text-[11px] uppercase tracking-widest text-[#98A0B3]/60">
                or
              </span>
            </div>

            {/* Email / Password Form */}
            <form action={handleSubmit} className="space-y-3.5">
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
                      height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.22, ease: "easeOut" }
                    }}
                    className="overflow-hidden space-y-1"
                  >
                    <Label htmlFor="fullName" className="text-xs font-medium text-slate-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input 
                        id="fullName" 
                        name="fullName"
                        type="text" 
                        placeholder="Aspirant Name" 
                        required={mode === "signup"}
                        className="bg-black/25 hover:bg-black/35 border-white/10 focus:border-[#1EA7FF]/70 focus:bg-black/45 rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-slate-500 transition-all pl-10 pr-4 shadow-inner backdrop-blur-md"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    className="bg-black/25 hover:bg-black/35 border-white/10 focus:border-[#1EA7FF]/70 focus:bg-black/45 rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-slate-500 transition-all pl-10 pr-4 shadow-inner backdrop-blur-md"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                    Password
                  </Label>
                  {mode === "login" && (
                    <Link href="/forgot-password" className="text-xs font-medium text-[#1EA7FF] hover:text-[#7257FF] transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required 
                    minLength={mode === "signup" ? 6 : undefined}
                    className="bg-black/25 hover:bg-black/35 border-white/10 focus:border-[#1EA7FF]/70 focus:bg-black/45 rounded-xl h-11 text-xs sm:text-sm text-white placeholder:text-slate-500 transition-all pl-10 pr-10 shadow-inner backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
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
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              {/* Dynamic CTA Button */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#7257FF] hover:from-[#38bdf8] hover:to-[#818cf8] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(30,167,255,0.35)] hover:shadow-[0_6px_35px_rgba(114,87,255,0.5)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign in" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Bottom Toggle Note */}
            <p className="text-center text-xs text-[#98A0B3]">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("signup")}
                    className="font-semibold text-[#7257FF] hover:text-[#C958FF] transition-colors"
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
                    className="font-semibold text-[#7257FF] hover:text-[#C958FF] transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Bottom Security Status Indicator */}
            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-slate-400/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure. Private. Built for aspirants.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
