export const siteConfig = {
  name: "JEE Pro",
  description:
    "The most premium JEE preparation platform. Master Physics, Chemistry, and Mathematics with adaptive learning, real-time analytics, and AI-powered insights.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og.png",
  creator: "@jeepro",
  links: {
    twitter: "https://twitter.com/jeepro",
    github: "https://github.com/jeepro",
  },
} as const;

export type SiteConfig = typeof siteConfig;
