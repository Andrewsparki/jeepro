"use client";

import { useState } from "react";
import { Heart, Coffee, Copy, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function CreatorSupport() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("joshh@fam");
    setCopied(true);
    toast.success("UPI ID copied to clipboard: joshh@fam");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="support" className="py-8 my-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl p-8 sm:p-12 bg-black/40 backdrop-blur-3xl border border-white/10 hover:border-rose-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group overflow-hidden transition-all duration-500"
      >
        {/* Ambient Rose Glow */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 pointer-events-none" />

        {/* Decorative background with glowing heart & popping particles */}
        <div className="absolute top-0 right-0 p-8 sm:p-12 pointer-events-none z-0 flex items-center justify-center">
          {/* Big glowing heart */}
          <Heart className="w-56 h-56 sm:w-64 sm:h-64 -rotate-12 text-rose-500/20 fill-rose-500/10 opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_35px_rgba(244,63,94,0.6)] group-hover:scale-105 transition-all duration-700 ease-out" />
          
          {/* Popping floating hearts */}
          <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-500">
            {[
              { x: -45, y: -90, duration: 2.2, delay: 0.2, repeatDelay: 1.0 },
              { x: 50, y: -120, duration: 2.5, delay: 0.5, repeatDelay: 0.7 },
              { x: -60, y: -70, duration: 1.8, delay: 0.1, repeatDelay: 1.2 },
              { x: 35, y: -100, duration: 2.6, delay: 0.8, repeatDelay: 0.5 },
              { x: -10, y: -130, duration: 2.1, delay: 0.4, repeatDelay: 0.9 },
            ].map((heart, i) => (
              <motion.div
                key={i}
                className="absolute text-rose-500/70"
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.8],
                  x: heart.x,
                  y: heart.y,
                }}
                transition={{
                  duration: heart.duration,
                  repeat: Infinity,
                  repeatDelay: heart.repeatDelay,
                  ease: "easeOut",
                  delay: heart.delay
                }}
              >
                <Heart className="w-6 h-6 fill-rose-500/40" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-rose-400 mb-4 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            Support Development
          </span>
          
          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-8">
            Every feature.<br/>
            Every animation.<br/>
            Every update.<br/><br/>
            Exists because someone believed<br/>
            studying deserved better.
          </p>

          {/* Support Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center mb-8">
            <a 
              href="https://patreon.com/devAndrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.12] hover:border-rose-500/40 transition-all text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
              <span>Patreon</span>
            </a>
            
            <a 
              href="https://buymeacoffee.com/devandrew" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.12] hover:border-yellow-500/40 transition-all text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
            >
              <Coffee className="w-4 h-4 text-yellow-400" />
              <span>Buy Me A Coffee</span>
            </a>

            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.12] hover:border-orange-500/40 transition-all text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] group/fampay active:scale-95 cursor-pointer">
                  <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-[#FFAD00] to-[#FF4500] flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover/fampay:scale-110 transition-transform">
                    <span className="text-[10px] font-black text-white font-sans tracking-tighter">F</span>
                  </div>
                  <span>FamPay</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-white/15 bg-[#0a0a0c]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white">
                <DialogHeader>
                  <DialogTitle className="text-center font-bold text-xl tracking-tight mb-2 text-white">FamPay QR</DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col items-center gap-6 py-4">
                  {/* QR Image Container */}
                  <div className="relative w-64 h-64 rounded-3xl overflow-hidden border border-white/15 shadow-[0_0_30px_rgba(255,69,0,0.2)] bg-black/60 group/qr">
                     <div className="absolute inset-0 bg-gradient-to-tr from-[#FFAD00]/10 via-transparent to-[#FF4500]/10 opacity-50 z-10 pointer-events-none mix-blend-overlay" />
                     <Image 
                       src="/fampay-qr-v2.png" 
                       alt="FamPay QR Code" 
                       fill
                       className="object-cover transition-transform duration-500 group-hover/qr:scale-105"
                     />
                  </div>

                  {/* UPI Copy Button */}
                  <div className="flex flex-col items-center gap-2 w-full max-w-[260px]">
                    <span className="text-[10px] uppercase tracking-widest text-[#98A0B3] font-bold">UPI ID</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center justify-between w-full h-12 px-4 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] transition-colors group/copy cursor-pointer active:scale-95"
                    >
                      <span className="font-mono text-sm tracking-wider text-white font-semibold">joshh@fam</span>
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>

          <div className="pt-6 border-t border-white/[0.08] w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white/60 tracking-widest uppercase">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline" />
            <span>by Andrew</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
