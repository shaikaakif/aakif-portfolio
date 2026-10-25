"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  index_label?: string | null;
  category: string;
  status: string;
  tagline: string;
  description: string;
  problem?: string | null;
  solution?: string | null;
  stack: string[];
  live_url?: string | null;
  github_url?: string | null;
  metric?: string | null;
  tone: string;
  artwork: string;
  code?: string | null;
  cover_image_id?: string | null;
  screenshot_ids?: string[] | null;
  featured: boolean;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at: string;
}

interface GalleryOption {
  id: string;
  title: string;
  public_url: string;
}

interface ProjectDraft {
  slug: string;
  title: string;
  index_label: string;
  category: string;
  status: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  stack: string;
  live_url: string;
  github_url: string;
  metric: string;
  tone: string;
  artwork: string;
  code: string;
  cover_image_id: string;
  screenshot_ids: string[];
  featured: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  published: boolean;
}

const EMPTY_DRAFT: ProjectDraft = {
  slug: "",
  title: "",
  index_label: "",
  category: "",
  status: "Live",
  tagline: "",
  description: "",
  problem: "",
  solution: "",
  stack: "",
  live_url: "",
  github_url: "",
  metric: "",
  tone: "clay",
  artwork: "orbit",
  code: "",
  cover_image_id: "",
  screenshot_ids: [],
  featured: false,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  published: false,
};

const TONES = ["clay", "cobalt", "sage", "amber", "rose", "plum", "ink"];
const ARTWORKS = ["orbit", "grid", "wave", "stack", "aperture", "fold", "pulse"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDraft(project: ProjectRecord): ProjectDraft {
  return {
    slug: project.slug,
    title: project.title,
    index_label: project.index_label ?? "",
    category: project.category,
    status: project.status,
    tagline: project.tagline,
    description: project.description,
    problem: project.problem ?? "",
    solution: project.solution ?? "",
    stack: (project.stack ?? []).join(", "),
    live_url: project.live_url ?? "",
    github_url: project.github_url ?? "",
    metric: project.metric ?? "",
    tone: project.tone,
    artwork: project.artwork,
    code: project.code ?? "",
    cover_image_id: project.cover_image_id ?? "",
    screenshot_ids: project.screenshot_ids ?? [],
    featured: project.featured,
    sort_order: project.sort_order ?? 0,
    seo_title: project.seo_title ?? "",
    seo_description: project.seo_description ?? "",
    published: project.published_at !== null && project.published_at !== undefined,
  };
}

interface ProjectFormModalProps {
  project: ProjectRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectFormModal({ project, onClose, onSaved }: ProjectFormModalProps) {
  const [draft, setDraft] = useState<ProjectDraft>(
    project ? toDraft(project) : EMPTY_DRAFT
  );
  const [gallery, setGallery] = useState<GalleryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: err } = await supabase
          .from("gallery_images")
          .select("id,title,public_url")
          .order("created_at", { ascending: false });
        if (err) throw err;
        if (!ignore) setGallery(data ?? []);
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load images");
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const update = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleScreenshot = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      screenshot_ids: prev.screenshot_ids.includes(id)
        ? prev.screenshot_ids.filter((item) => item !== id)
        : [...prev.screenshot_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const slug = draft.slug.trim() || slugify(draft.title);
    if (!slug || !draft.title.trim() || !draft.category.trim()) {
      setError("Title, slug, and category are required.");
      return;
    }

    const payload = {
      slug,
      title: draft.title.trim(),
      index_label: draft.index_label.trim() || null,
      category: draft.category.trim(),
      status: draft.status,
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      problem: draft.problem.trim() || null,
      solution: draft.solution.trim() || null,
      stack: draft.stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      live_url: draft.live_url.trim() || null,
      github_url: draft.github_url.trim() || null,
      metric: draft.metric.trim() || null,
      tone: draft.tone,
      artwork: draft.artwork,
      code: draft.code.trim() || null,
      cover_image_id: draft.cover_image_id || null,
      screenshot_ids: draft.screenshot_ids,
      featured: draft.featured,
      sort_order: Number(draft.sort_order) || 0,
      seo_title: draft.seo_title.trim() || null,
      seo_description: draft.seo_description.trim() || null,
      published_at: draft.published
        ? project?.published_at ?? new Date().toISOString()
        : null,
    };

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = project
        ? await supabase.from("projects").update(payload).eq("id", project.id)
        : await supabase.from("projects").insert(payload);

      if (err) throw err;
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{project ? "Edit Project" : "New Project"}</h2>
          <button type="button" onClick={onClose} className="admin-modal-close">
            ×
          </button>
        </div>

        {error && (
          <div className="admin-error-banner" role="alert">
            {error}
          </div>
        )}

        <form className="admin-metadata-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-title">Title</label>
              <input
                id="project-title"
                className="input"
                type="text"
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-slug">Slug</label>
              <input
                id="project-slug"
                className="input"
                type="text"
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder={slugify(draft.title) || "project-slug"}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-category">Category</label>
              <input
                id="project-category"
                className="input"
                type="text"
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-status">Status</label>
              <select
                id="project-status"
                className="input"
                value={draft.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="Live">Live</option>
                <option value="Case study">Case study</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-index">Index label</label>
              <input
                id="project-index"
                className="input"
                type="text"
                value={draft.index_label}
                onChange={(e) => update("index_label", e.target.value)}
                placeholder="01"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="project-tagline">Tagline</label>
            <input
              id="project-tagline"
              className="input"
              type="text"
              value={draft.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              className="input"
              rows={4}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-problem">Problem</label>
              <textarea
                id="project-problem"
                className="input"
                rows={3}
                value={draft.problem}
                onChange={(e) => update("problem", e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-solution">Solution</label>
              <textarea
                id="project-solution"
                className="input"
                rows={3}
                value={draft.solution}
                onChange={(e) => update("solution", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-stack">Stack (comma-separated)</label>
              <input
                id="project-stack"
                className="input"
                type="text"
                value={draft.stack}
                onChange={(e) => update("stack", e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-metric">Metric</label>
              <input
                id="project-metric"
                className="input"
                type="text"
                value={draft.metric}
                onChange={(e) => update("metric", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-live">Live URL</label>
              <input
                id="project-live"
                className="input"
                type="url"
                value={draft.live_url}
                onChange={(e) => update("live_url", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-github">GitHub URL</label>
              <input
                id="project-github"
                className="input"
                type="url"
                value={draft.github_url}
                onChange={(e) => update("github_url", e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-tone">Tone</label>
              <select
                id="project-tone"
                className="input"
                value={draft.tone}
                onChange={(e) => update("tone", e.target.value)}
              >
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-artwork">Artwork</label>
              <select
                id="project-artwork"
                className="input"
                value={draft.artwork}
                onChange={(e) => update("artwork", e.target.value)}
              >
                {ARTWORKS.map((artwork) => (
                  <option key={artwork} value={artwork}>{artwork}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-code">Code</label>
              <input
                id="project-code"
                className="input"
                type="text"
                value={draft.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="LL"
                maxLength={4}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-cover">Cover image</label>
              <select
                id="project-cover"
                className="input"
                value={draft.cover_image_id}
                onChange={(e) => update("cover_image_id", e.target.value)}
              >
                <option value="">No cover image</option>
                {gallery.map((image) => (
                  <option key={image.id} value={image.id}>{image.title}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-sort">Sort order</label>
              <input
                id="project-sort"
                className="input"
                type="number"
                value={draft.sort_order}
                onChange={(e) => update("sort_order", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <span className="admin-form-label">Screenshots</span>
            <div className="admin-image-picker">
              {gallery.length === 0 && (
                <p className="admin-collection-empty">No gallery images yet.</p>
              )}
              {gallery.map((image) => (
                <label key={image.id} className="admin-image-picker-item">
                  <input
                    type="checkbox"
                    checked={draft.screenshot_ids.includes(image.id)}
                    onChange={() => toggleScreenshot(image.id)}
                  />
                  <span>{image.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-seo-title">SEO title</label>
              <input
                id="project-seo-title"
                className="input"
                type="text"
                value={draft.seo_title}
                onChange={(e) => update("seo_title", e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="project-seo-description">SEO description</label>
              <input
                id="project-seo-description"
                className="input"
                type="text"
                value={draft.seo_description}
                onChange={(e) => update("seo_description", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row admin-form-row--inline">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              Featured on homepage
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => update("published", e.target.checked)}
              />
              Published
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="button" onClick={onClose} className="button button--ghost">
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}