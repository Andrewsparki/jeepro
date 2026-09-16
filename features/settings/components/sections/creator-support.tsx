"use client";

import { useState } from "react";
import { Heart, Coffee, Copy, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CreatorSupport() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("joshh@fam");
    setCopied(true);
    toast.success("UPI ID copied to clipboard: joshh@fam");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="support" className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={cn(
          "relative rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12",
          "bg-[#0d121c]/45 backdrop-blur-3xl border border-white/[0.12]",
          "hover:border-rose-500/30 transition-all duration-500",
          "shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)]",
          "overflow-hidden group",
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-rose-400/30 before:to-transparent before:pointer-events-none"
        )}
      >
        {/* Ambient Rose Radial Glow */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 pointer-events-none" />

        {/* Decorative Background Heart Graphic */}
        <div className="absolute top-0 right-0 p-8 sm:p-12 pointer-events-none z-0 flex items-center justify-center">
          <Heart className="w-56 h-56 sm:w-64 sm:h-64 -rotate-12 text-rose-500/15 fill-rose-500/5 opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_35px_rgba(244,63,94,0.4)] group-hover:scale-105 transition-all duration-700 ease-out" />

          {/* Floating heart micro-particles */}
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
                className="absolute text-rose-500/60"
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
                  delay: heart.delay,
                }}
              >
                <Heart className="w-5 h-5 fill-rose-500/30" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Support Development</span>
          </div>

          <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed mb-8">
            Every feature.<br />
            Every animation.<br />
            Every update.<br /><br />
            Exists because someone believed<br />
            studying deserved better.
          </p>

          {/* Apple Style Floating Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 w-full justify-center mb-8">
            <a
              href="https://patreon.com/devAndrew"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-rose-500/40 transition-all text-xs sm:text-sm font-semibold text-white hover:shadow-[0_0_24px_rgba(244,63,94,0.25)] active:scale-95 cursor-pointer select-none"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
              <span>Patreon</span>
            </a>

            <a
              href="https://buymeacoffee.com/devandrew"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-amber-500/40 transition-all text-xs sm:text-sm font-semibold text-white hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] active:scale-95 cursor-pointer select-none"
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Buy Me A Coffee</span>
            </a>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2.5 h-11 px-6 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-orange-500/40 transition-all text-xs sm:text-sm font-semibold text-white hover:shadow-[0_0_24px_rgba(249,115,22,0.25)] active:scale-95 cursor-pointer select-none group/fampay"
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#FFAD00] to-[#FF4500] flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover/fampay:scale-105 transition-transform">
                    <span className="text-[10px] font-black text-white font-sans tracking-tighter">
                      F
                    </span>
                  </div>
                  <span>FamPay QR</span>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md border-white/20 bg-[#0a0e17]/90 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] text-white rounded-[2.5rem] p-6 sm:p-8">
                <DialogHeader>
                  <DialogTitle className="text-center font-bold text-xl tracking-tight text-white flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-orange-400" />
                    <span>FamPay UPI Transfer</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                  {/* QR Image Frame with Scanner Brackets */}
                  <div className="relative w-64 h-64 rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_35px_rgba(255,69,0,0.25)] bg-black/60 group/qr">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FFAD00]/15 via-transparent to-[#FF4500]/15 opacity-60 z-10 pointer-events-none" />
                    <Image
                      src="/fampay-qr-v2.png"
                      alt="FamPay QR Code"
                      fill
                      className="object-cover transition-transform duration-500 group-hover/qr:scale-105"
                    />
                  </div>

                  {/* Copyable UPI Pill */}
                  <div className="flex flex-col items-center gap-2 w-full max-w-[280px]">
                    <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Instant UPI Handle
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center justify-between w-full h-12 px-4 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] transition-all cursor-pointer active:scale-95 group/copy shadow-sm"
                    >
                      <span className="font-mono text-sm tracking-wider text-white font-semibold">
                        joshh@fam
                      </span>
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400 group-hover/copy:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="pt-6 border-t border-white/[0.08] w-full flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 tracking-wider uppercase">
            <span>Engineered with passion</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline" />
            <span>by Andrew</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
