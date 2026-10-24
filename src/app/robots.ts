import type { MetadataRoute } from "next";
import { seo } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_next/", "/admin/"],
    },
    sitemap: `${seo.baseUrl}/sitemap.xml`,
    host: seo.baseUrl,
  };
}

export const dynamic = "force-static";

