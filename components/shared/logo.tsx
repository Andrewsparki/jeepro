import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
        <span className="text-sm font-bold text-white">J</span>
      </div>
      <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
