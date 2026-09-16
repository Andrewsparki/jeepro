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
    ],
  },
};

export default nextConfig;
