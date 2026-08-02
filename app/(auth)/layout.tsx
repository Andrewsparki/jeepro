import { ReactNode } from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center px-8 border-b border-border/10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">JEE Pro</span>
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-8 mt-20">
        {children}
      </main>
    </div>
  );
}
