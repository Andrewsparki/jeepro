"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, CheckCircle2, Mail, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-center">
      <div className="relative w-full max-w-[420px] rounded-[32px] p-7 sm:p-9 bg-[#070E1E]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden space-y-6">
        {/* Minimalist Top Specular Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {isSuccess ? (
          <div className="text-center space-y-5 py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(85,230,165,0.25)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">Check your email</h2>
              <p className="text-xs text-[#98A0B3] font-normal leading-relaxed">
                We&apos;ve sent a secure password recovery link to your inbox.
              </p>
            </div>

            <Link href="/login" className="block pt-2">
              <Button 
                variant="outline" 
                className="w-full h-11 text-xs sm:text-sm font-medium bg-white/[0.035] hover:bg-white/[0.07] border-white/10 text-slate-200 rounded-xl"
              >
                Return to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-13 h-13 rounded-2xl bg-white/[0.06] border border-white/15 shadow-[0_0_25px_rgba(114,87,255,0.25)] flex items-center justify-center p-1 backdrop-blur-md">
                <div className="w-full h-full rounded-[14px] bg-[#081020]/90 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-6 h-6 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                </div>
              </div>

              <div className="pt-1.5 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Reset password
                </h2>
                <p className="text-xs text-[#98A0B3] font-medium">
                  We&apos;ll send a secure reset link to your email.
                </p>
              </div>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#1EA7FF] via-[#5260FF] to-[#7257FF] hover:from-[#38bdf8] hover:to-[#818cf8] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(30,167,255,0.35)] hover:shadow-[0_6px_35px_rgba(114,87,255,0.5)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Back to sign in */}
            <p className="text-center text-xs text-[#98A0B3]">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-[#7257FF] hover:text-[#C958FF] transition-colors">
                Sign in
              </Link>
            </p>

            {/* Security Indicator */}
            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-slate-400/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure. Private. Built for aspirants.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
