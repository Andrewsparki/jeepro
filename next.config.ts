import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    authInterrupts: true,
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
      "canvas-confetti",
      "zustand",
      "@radix-ui/react-slot",
      "cmdk",
      "clsx",
      "tailwind-merge",
    ],
  },
};

export default nextConfig;
