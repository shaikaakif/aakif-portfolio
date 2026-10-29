export interface GalleryImage {
  id: string;
  storage_path: string;
  public_url: string | null;
  title: string;
  alt_text: string;
  caption: string | null;
  description: string | null;
  categories: string[];
  tags: string[];
  collection_id: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  format: string | null;
  file_size_bytes: number | null;
  taken_at: string | null;
  photographer: string | null;
  copyright_holder: string | null;
  license: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  index_label: string | null;
  category: string;
  status: string;
  tagline: string;
  description: string;
  problem: string | null;
  solution: string | null;
  stack: string[];
  live_url: string | null;
  github_url: string | null;
  metric: string | null;
  tone: string;
  artwork: string;
  code: string | null;
  cover_image_id: string | null;
  screenshot_ids: string[] | null;
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectUsage {
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  published: boolean;
  roles: Array<"cover" | "screenshot" | "social">;
}

export type UsageMap = Record<string, ProjectUsage[]>;

export interface SiteIdentitySettings {
  name: string;
  tagline: string;
  email: string;
}

export interface SeoDefaultsSettings {
  title: string;
  description: string;
}

export interface SocialLinksSettings {
  website: string;
  github: string;
  linkedin: string;
  instagram: string;
}

export interface GalleryDefaultsSettings {
  defaultStatus: "draft" | "published";
  defaultCategories: string[];
}

export interface PublishingSettings {
  requireAltText: boolean;
  autoPublishOnUpload: boolean;
}

export interface SiteSettings {
  site_identity: SiteIdentitySettings;
  seo_defaults: SeoDefaultsSettings;
  social_links: SocialLinksSettings;
  gallery_defaults: GalleryDefaultsSettings;
  publishing: PublishingSettings;
}

export type SiteSettingKey = keyof SiteSettings;

export type UploadState = "queued" | "uploading" | "done" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  width: number | null;
  height: number | null;
  state: UploadState;
  progress: number;
  error: string | null;
}
