import type { MetadataRoute } from "next";
import { projects as staticProjects } from "@/content/projects";
import { seo } from "@/content/seo";
import {
  getPublishedGalleryImages,
  getPublishedProjects,
} from "@/lib/content/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cmsProjects, galleryImages] = await Promise.all([
    getPublishedProjects(),
    getPublishedGalleryImages(),
  ]);

  const projects =
    cmsProjects.length > 0 ? cmsProjects : staticProjects;

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${seo.baseUrl}/work/${project.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: project.image ? [project.image] : undefined,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = galleryImages.map((image) => ({
    url: `${seo.baseUrl}/gallery/${image.id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    images: image.public_url ? [image.public_url] : undefined,
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
      images: galleryImages
        .map((image) => image.public_url)
        .filter((url): url is string => Boolean(url)),
    },
    ...projectRoutes,
    ...galleryRoutes,
  ];
}

export const dynamic = "force-static";
