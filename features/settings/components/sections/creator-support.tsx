"use client";

import { useState } from "react";
import { Heart, Coffee, Copy, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

export function CreatorSupport() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("joshh@fam");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 mt-12 mb-8">
      <GlassCard interactive className="p-8 sm:p-12 relative overflow-hidden group">
        
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
          <Heart className="w-64 h-64 -rotate-12 text-rose-500" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Support Development
          </span>
          
          <p className="text-xl sm:text-2xl font-light text-foreground/90 leading-relaxed mb-8">
            Every feature.<br/>
            Every animation.<br/>
            Every update.<br/><br/>
            Exists because someone believed<br/>
            studying deserved better.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center mb-8">
            <a 
              href="https://patreon.com/devAndrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-glass-border bg-surface hover:bg-surface-hover hover:border-primary/30 transition-all text-sm font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              Patreon
            </a>
            
            <a 
              href="https://buymeacoffee.com/devandrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-glass-border bg-surface hover:bg-surface-hover hover:border-yellow-500/30 transition-all text-sm font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Coffee className="w-4 h-4 text-yellow-500" />
              Buy Me A Coffee
            </a>

            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-glass-border bg-surface hover:bg-surface-hover hover:border-orange-500/30 transition-all text-sm font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] group/fampay">
                  <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-[#FFAD00] to-[#FF4500] flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover/fampay:scale-110 transition-transform">
                    <span className="text-[10px] font-black text-white font-sans tracking-tighter">F</span>
                  </div>
                  FamPay
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-glass-border bg-[#0a0a0c]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-center font-semibold text-xl tracking-tight mb-2">FamPay</DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col items-center gap-6 py-4">
                  {/* Image container styled beautifully */}
                  <div className="relative w-64 h-64 rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,69,0,0.15)] bg-black/50 group/qr">
                     <div className="absolute inset-0 bg-gradient-to-tr from-[#FFAD00]/10 via-transparent to-[#FF4500]/10 opacity-50 z-10 pointer-events-none mix-blend-overlay" />
                     {/* The QR is in the bottom sheet of the screenshot. object-[center_65%] scales it up nicely */}
                     <Image 
                       src="/fampay-qr-v2.png" 
                       alt="FamPay QR Code" 
                       fill
                       className="object-cover transition-transform duration-700 group-hover/qr:scale-110"
                     />
                  </div>

                  <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">UPI ID</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center justify-between w-full h-12 px-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 transition-colors group/copy"
                    >
                      <span className="font-mono text-sm tracking-wider text-foreground">joshh@fam</span>
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground group-hover/copy:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>

          <div className="pt-6 border-t border-white/[0.06] w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground/70 tracking-widest uppercase">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline" />
            <span>by Andrew</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
