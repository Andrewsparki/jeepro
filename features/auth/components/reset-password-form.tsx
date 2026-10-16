"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
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
              <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FB]">Password updated</h2>
              <p className="text-xs text-[#A4ADBB] font-normal leading-relaxed">
                Your password has been successfully reset. Redirecting to workspace...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FB]">Set new password</h2>
              <p className="text-xs text-zinc-400 font-normal">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-mono uppercase text-zinc-300">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    required 
                    minLength={6}
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
                    <span>Update password</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0D12] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#A4ADBB]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#78A9FF]" />
              <span>END-TO-END ENCRYPTED</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
