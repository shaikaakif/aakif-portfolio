import "server-only";

import { cache } from "react";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import type {
  ArtworkVariant,
  Project,
  ProjectStatus,
  ProjectTone,
} from "@/content/types";
import type {
  GalleryCollection,
  GalleryImage,
  SiteSettings,
} from "@/lib/admin/types";

const TONES: ProjectTone[] = [
  "clay",
  "cobalt",
  "sage",
  "amber",
  "rose",
  "plum",
  "ink",
];

const ARTWORKS: ArtworkVariant[] = [
  "orbit",
  "grid",
  "wave",
  "stack",
  "aperture",
  "fold",
  "pulse",
];

interface ProjectRow {
  slug: string;
  title: string;
  index_label: string | null;
  category: string;
  status: string;
  tagline: string;
  description: string;
  problem: string | null;
  solution: string | null;
  stack: string[] | null;
  live_url: string | null;
  github_url: string | null;
  metric: string | null;
  tone: string;
  artwork: string;
  code: string | null;
  sort_order: number | null;
  published_at: string | null;
  cover_image: { public_url: string | null } | null;
}

function toProject(row: ProjectRow): Project {
  const status: ProjectStatus =
    row.status === "Case study" ? "Case study" : "Live";
  const tone = TONES.includes(row.tone as ProjectTone)
    ? (row.tone as ProjectTone)
    : "clay";
  const artwork = ARTWORKS.includes(row.artwork as ArtworkVariant)
    ? (row.artwork as ArtworkVariant)
    : "orbit";

  return {
    slug: row.slug,
    index:
      row.index_label ??
      String((row.sort_order ?? 0) + 1).padStart(2, "0"),
    title: row.title,
    category: row.category,
    status,
    tagline: row.tagline,
    description: row.description,
    problem: row.problem ?? "",
    solution: row.solution ?? "",
    stack: row.stack ?? [],
    liveUrl: row.live_url ?? undefined,
    githubUrl: row.github_url ?? undefined,
    metric: row.metric ?? "",
    tone,
    artwork,
    code: row.code ?? "",
    image: row.cover_image?.public_url ?? undefined,
  };
}

export const getPublishedGalleryImages = cache(
  async (): Promise<GalleryImage[]> => {
    const supabase = createSupabaseStaticClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select(
          "id,storage_path,public_url,title,alt_text,caption,description,categories,tags,collection_id,sort_order,width,height,format,file_size_bytes,taken_at,photographer,copyright_holder,license,is_published,created_at,updated_at"
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return (data as GalleryImage[]).filter(
        (image) => Boolean(image.public_url)
      );
    } catch {
      return [];
    }
  }
);

export const getPublishedGalleryCollections = cache(
  async (): Promise<GalleryCollection[]> => {
    const supabase = createSupabaseStaticClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("gallery_collections")
        .select(
          "id,name,slug,description,cover_image_id,sort_order,is_published,created_at,updated_at"
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error || !data) return [];
      return data as GalleryCollection[];
    } catch {
      return [];
    }
  }
);

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  const supabase = createSupabaseStaticClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug,title,index_label,category,status,tagline,description,problem,solution,stack,live_url,github_url,metric,tone,artwork,code,sort_order,published_at,cover_image:gallery_images!fk_projects_cover_image(public_url)"
      )
      .not("published_at", "is", null)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as ProjectRow[]).map(toProject);
  } catch {
    return [];
  }
});

export const getPublishedProject = cache(
  async (slug: string): Promise<Project | null> => {
    const projects = await getPublishedProjects();
    return projects.find((project) => project.slug === slug) ?? null;
  }
);

export const getPublicSiteSettings = cache(
  async (): Promise<Partial<SiteSettings> | null> => {
    const supabase = createSupabaseStaticClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key,value");

      if (error || !data) return null;

      const settings: Partial<SiteSettings> = {};
      for (const row of data as Array<{ key: string; value: unknown }>) {
        if (row.key in settings) continue;
        (settings as Record<string, unknown>)[row.key] = row.value;
      }
      return settings;
    } catch {
      return null;
    }
  }
);
