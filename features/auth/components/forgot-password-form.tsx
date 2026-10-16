"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
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
      <div className="relative w-full max-w-[430px] rounded-2xl sm:rounded-3xl p-7 sm:p-9 bg-[#121722]/90 border border-[#2B3342] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden space-y-6">
        {isSuccess ? (
          <div className="text-center space-y-5 py-2">
            <div className="w-12 h-12 rounded-xl bg-[#5DC98B]/15 text-[#5DC98B] border border-[#5DC98B]/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(93,201,139,0.25)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FB]">Check your email</h2>
              <p className="text-xs text-[#A4ADBB] font-normal leading-relaxed">
                We&apos;ve sent a secure password recovery link to your inbox.
              </p>
            </div>

            <Link href="/login" className="block pt-2">
              <Button 
                variant="outline" 
                className="w-full h-11 text-xs sm:text-sm font-bold bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] border-transparent rounded-xl transition-colors shadow-[0_2px_12px_rgba(120,169,255,0.3)]"
              >
                Return to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">Reset password</h2>
              <p className="text-xs text-zinc-400 font-normal">
                Enter your registered email address to receive recovery instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <div className="p-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-[#78A9FF] hover:bg-[#A8C5FF] text-[#0B0D12] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A9FF] shadow-[0_2px_14px_rgba(120,169,255,0.35)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B0D12]" />
                ) : (
                  <>
                    <span>Send recovery link</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0D12] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-[#A4ADBB]">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-zinc-200 hover:text-white underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#A4ADBB]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>ENCRYPTED RECOVERY • NO SPAM</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
