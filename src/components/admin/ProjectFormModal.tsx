"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import {
  AdminAlert,
  AdminField,
} from "@/components/admin/ui/AdminUi";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { MediaPicker } from "@/components/admin/ui/MediaPicker";
import { useDialogA11y } from "@/components/admin/ui/useDialogA11y";
import { isValidUrl, slugify } from "@/lib/admin/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryImage,
  ProjectRecord,
} from "@/lib/admin/types";

const TONES = ["clay", "cobalt", "sage", "amber", "rose", "plum", "ink"];
const ARTWORKS = ["orbit", "grid", "wave", "stack", "aperture", "fold", "pulse"];

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
  seo_image_id: string;
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
  seo_image_id: "",
  featured: false,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  published: false,
};

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
    seo_image_id: project.seo_image_id ?? "",
    featured: project.featured,
    sort_order: project.sort_order ?? 0,
    seo_title: project.seo_title ?? "",
    seo_description: project.seo_description ?? "",
    published: Boolean(project.published_at),
  };
}

function draftsEqual(a: ProjectDraft, b: ProjectDraft) {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface ProjectFormModalProps {
  project: ProjectRecord | null;
  assets: GalleryImage[];
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectFormModal({
  project,
  assets,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const initial = project ? toDraft(project) : EMPTY_DRAFT;
  const [draft, setDraft] = useState<ProjectDraft>(initial);
  const [baseline] = useState<ProjectDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const dirty = !draftsEqual(draft, baseline);
  const ref = useDialogA11y(true, () => requestClose());

  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function requestClose() {
    if (saving) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  const update = <K extends keyof ProjectDraft>(
    key: K,
    value: ProjectDraft[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setDraft((current) => {
      const shouldUpdateSlug =
        !current.slug || current.slug === slugify(current.title);
      return {
        ...current,
        title: value,
        slug: shouldUpdateSlug ? slugify(value) : current.slug,
      };
    });
  };

  const toggleScreenshot = (id: string) => {
    setDraft((current) => ({
      ...current,
      screenshot_ids: current.screenshot_ids.includes(id)
        ? current.screenshot_ids.filter((item) => item !== id)
        : [...current.screenshot_ids, id],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const slug = draft.slug.trim() || slugify(draft.title);
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError("Slug must use lowercase letters, numbers, and hyphens.");
      return;
    }
    if (!draft.title.trim() || !draft.category.trim()) {
      setError("Title and category are required.");
      return;
    }
    if (!draft.tagline.trim() || !draft.description.trim()) {
      setError("Tagline and description are required.");
      return;
    }
    if (!isValidUrl(draft.live_url) || !isValidUrl(draft.github_url)) {
      setError("Live and GitHub URLs must start with http:// or https://.");
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
      seo_image_id: draft.seo_image_id || null,
      featured: draft.featured,
      sort_order: Number(draft.sort_order) || 0,
      seo_title: draft.seo_title.trim() || null,
      seo_description: draft.seo_description.trim() || null,
      published_at: draft.published
        ? project?.published_at ?? new Date().toISOString()
        : null,
    };

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error: saveError } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);

    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "That slug is already used by another project."
          : saveError.message
      );
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <>
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div
          ref={ref}
          className="admin-modal admin-modal--wide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-form-title"
        >
          <div className="admin-modal__header">
            <div>
              <h2 className="admin-modal__title" id="project-form-title">
                {project ? "Edit project" : "New project"}
              </h2>
              <p className="admin-modal__subtitle">
                Published projects replace the static fallback on the public
                work index after the next build.
              </p>
            </div>
            <button
              type="button"
              className="admin-drawer__close"
              onClick={requestClose}
              aria-label="Close project form"
              disabled={saving}
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-modal__body">
              {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

              <div className="admin-form-grid admin-form-grid--two">
                <AdminField label="Title" htmlFor="project-title" required>
                  <input
                    id="project-title"
                    className="admin-input"
                    value={draft.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    required
                  />
                </AdminField>
                <AdminField label="Slug" htmlFor="project-slug" required>
                  <input
                    id="project-slug"
                    className="admin-input"
                    value={draft.slug}
                    onChange={(event) =>
                      update("slug", slugify(event.target.value))
                    }
                    placeholder="project-slug"
                    required
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid">
                <AdminField label="Category" htmlFor="project-category" required>
                  <input
                    id="project-category"
                    className="admin-input"
                    value={draft.category}
                    onChange={(event) => update("category", event.target.value)}
                    required
                  />
                </AdminField>
                <AdminField label="Status" htmlFor="project-status">
                  <select
                    id="project-status"
                    className="admin-select"
                    value={draft.status}
                    onChange={(event) => update("status", event.target.value)}
                  >
                    <option value="Live">Live</option>
                    <option value="Case study">Case study</option>
                  </select>
                </AdminField>
                <AdminField label="Index label" htmlFor="project-index">
                  <input
                    id="project-index"
                    className="admin-input"
                    value={draft.index_label}
                    onChange={(event) =>
                      update("index_label", event.target.value)
                    }
                    placeholder="01"
                  />
                </AdminField>
              </div>

              <AdminField label="Tagline" htmlFor="project-tagline" required>
                <input
                  id="project-tagline"
                  className="admin-input"
                  value={draft.tagline}
                  onChange={(event) => update("tagline", event.target.value)}
                  required
                />
              </AdminField>

              <AdminField
                label="Description"
                htmlFor="project-description"
                required
              >
                <textarea
                  id="project-description"
                  className="admin-textarea"
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  required
                />
              </AdminField>

              <div className="admin-form-grid admin-form-grid--two">
                <AdminField label="Problem" htmlFor="project-problem">
                  <textarea
                    id="project-problem"
                    className="admin-textarea"
                    rows={3}
                    value={draft.problem}
                    onChange={(event) => update("problem", event.target.value)}
                  />
                </AdminField>
                <AdminField label="Solution" htmlFor="project-solution">
                  <textarea
                    id="project-solution"
                    className="admin-textarea"
                    rows={3}
                    value={draft.solution}
                    onChange={(event) => update("solution", event.target.value)}
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid">
                <AdminField
                  label="Stack"
                  htmlFor="project-stack"
                  hint="Comma-separated."
                >
                  <input
                    id="project-stack"
                    className="admin-input"
                    value={draft.stack}
                    onChange={(event) => update("stack", event.target.value)}
                  />
                </AdminField>
                <AdminField label="Outcome metric" htmlFor="project-metric">
                  <input
                    id="project-metric"
                    className="admin-input"
                    value={draft.metric}
                    onChange={(event) => update("metric", event.target.value)}
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid admin-form-grid--two">
                <AdminField label="Live URL" htmlFor="project-live">
                  <input
                    id="project-live"
                    type="url"
                    className="admin-input"
                    value={draft.live_url}
                    onChange={(event) => update("live_url", event.target.value)}
                    placeholder="https://"
                  />
                </AdminField>
                <AdminField label="GitHub URL" htmlFor="project-github">
                  <input
                    id="project-github"
                    type="url"
                    className="admin-input"
                    value={draft.github_url}
                    onChange={(event) =>
                      update("github_url", event.target.value)
                    }
                    placeholder="https://"
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid">
                <AdminField label="Tone" htmlFor="project-tone">
                  <select
                    id="project-tone"
                    className="admin-select"
                    value={draft.tone}
                    onChange={(event) => update("tone", event.target.value)}
                  >
                    {TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Artwork" htmlFor="project-artwork">
                  <select
                    id="project-artwork"
                    className="admin-select"
                    value={draft.artwork}
                    onChange={(event) => update("artwork", event.target.value)}
                  >
                    {ARTWORKS.map((artwork) => (
                      <option key={artwork} value={artwork}>
                        {artwork}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Code" htmlFor="project-code">
                  <input
                    id="project-code"
                    className="admin-input"
                    value={draft.code}
                    onChange={(event) => update("code", event.target.value)}
                    placeholder="LL"
                    maxLength={4}
                  />
                </AdminField>
                <AdminField label="Sort order" htmlFor="project-sort">
                  <input
                    id="project-sort"
                    type="number"
                    className="admin-input"
                    value={draft.sort_order}
                    onChange={(event) =>
                      update("sort_order", Number(event.target.value))
                    }
                  />
                </AdminField>
              </div>

              <AdminField
                label="Cover image"
                htmlFor="project-cover-picker"
                hint="Used on the work index and project metadata."
              >
                <MediaPicker
                  assets={assets}
                  selectedIds={draft.cover_image_id ? [draft.cover_image_id] : []}
                  onToggle={(id) =>
                    update(
                      "cover_image_id",
                      draft.cover_image_id === id ? "" : id
                    )
                  }
                  label="Choose a cover image"
                />
              </AdminField>

              <AdminField
                label="Screenshots"
                htmlFor="project-screenshot-picker"
                hint="Select any number of supporting images."
              >
                <MediaPicker
                  assets={assets}
                  selectedIds={draft.screenshot_ids}
                  onToggle={toggleScreenshot}
                  multiple
                  label="Choose screenshots"
                />
              </AdminField>

              <AdminField
                label="Social image"
                htmlFor="project-social-picker"
                hint="Used for Open Graph and Twitter cards."
              >
                <MediaPicker
                  assets={assets}
                  selectedIds={draft.seo_image_id ? [draft.seo_image_id] : []}
                  onToggle={(id) =>
                    update(
                      "seo_image_id",
                      draft.seo_image_id === id ? "" : id
                    )
                  }
                  label="Choose a social image"
                />
              </AdminField>

              <div className="admin-form-grid admin-form-grid--two">
                <AdminField label="SEO title" htmlFor="project-seo-title">
                  <input
                    id="project-seo-title"
                    className="admin-input"
                    value={draft.seo_title}
                    onChange={(event) =>
                      update("seo_title", event.target.value)
                    }
                  />
                </AdminField>
                <AdminField
                  label="SEO description"
                  htmlFor="project-seo-description"
                >
                  <input
                    id="project-seo-description"
                    className="admin-input"
                    value={draft.seo_description}
                    onChange={(event) =>
                      update("seo_description", event.target.value)
                    }
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid admin-form-grid--two">
                <label className="admin-checkbox admin-checkbox--boxed">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(event) =>
                      update("featured", event.target.checked)
                    }
                  />
                  Featured on the homepage
                </label>
                <label className="admin-checkbox admin-checkbox--boxed">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(event) =>
                      update("published", event.target.checked)
                    }
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="admin-modal__footer">
              {dirty ? (
                <span className="admin-toolbar__count">Unsaved changes</span>
              ) : null}
              <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={requestClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-button admin-button--primary"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : project
                    ? "Save changes"
                    : "Create project"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        description={
          <p className="admin-confirm-text">
            You have unsaved project changes. Closing now will discard them.
          </p>
        }
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
