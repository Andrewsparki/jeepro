import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/pricing", "/privacy"],
      disallow: ["/dashboard/", "/admin/", "/api/", "/login", "/signup"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
