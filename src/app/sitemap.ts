import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { seo } from "@/content/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = projects.map((project) => ({
    url: `${seo.baseUrl}/work/${project.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${seo.baseUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${seo.baseUrl}/work/`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${seo.baseUrl}/about/`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${seo.baseUrl}/gallery/`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projectRoutes,
  ];
}

export const dynamic = "force-static";

