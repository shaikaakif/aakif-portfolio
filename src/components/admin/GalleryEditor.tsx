"use client";

import { useState } from "react";
import { SideDrawer } from "@/components/admin/ui/SideDrawer";
import { AdminAlert, AdminField } from "@/components/admin/ui/AdminUi";
import { formatBytes, formatDate, parseCommaList } from "@/lib/admin/format";
import { buildGalleryImageSeo } from "@/lib/seo/gallery";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryCollection,
  GalleryImage,
  ProjectUsage,
} from "@/lib/admin/types";
import { usageLabel } from "@/lib/admin/usage";

interface GalleryEditorProps {
  image: GalleryImage;
  collections: GalleryCollection[];
  usage: ProjectUsage[];
  onClose: () => void;
  onSaved: () => void;
  onDelete: () => void;
}

interface Draft {
  title: string;
  alt_text: string;
  caption: string;
  description: string;
  categories: string;
  tags: string;
  collection_id: string;
  sort_order: number;
  is_published: boolean;
  taken_at: string;
  photographer: string;
  copyright_holder: string;
  license: string;
  objectPositionX: number;
  objectPositionY: number;
}

function toDraft(image: GalleryImage): Draft {
  const suggested = buildGalleryImageSeo(image);

  return {
    title: image.title,
    alt_text: image.alt_text,
    caption: image.caption ?? "",
    description: image.description ?? suggested.description,
    categories: image.categories.join(", "),
    tags:
      image.tags.length > 0
        ? image.tags.join(", ")
        : suggested.tags.join(", "),
    collection_id: image.collection_id ?? "",
    sort_order: image.sort_order ?? 0,
    is_published: image.is_published,
    taken_at: image.taken_at ?? "",
    photographer: image.photographer ?? "",
    copyright_holder: image.copyright_holder ?? "",
    license: image.license ?? "",
    objectPositionX: 50,
    objectPositionY: 50,
  };
}

export function GalleryEditor({
  image,
  collections,
  usage,
  onClose,
  onSaved,
  onDelete,
}: GalleryEditorProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(image));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!draft.title.trim()) {
      setError("A title is required.");
      return;
    }
    if (!draft.alt_text.trim()) {
      setError("Alt text is required for accessibility and SEO.");
      return;
    }

    const suggested = buildGalleryImageSeo(image);
    const description = draft.description.trim() || suggested.description;
    const tags = parseCommaList(draft.tags);

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("gallery_images")
      .update({
        title: draft.title.trim(),
        alt_text: draft.alt_text.trim(),
        caption: draft.caption.trim() || null,
        description,
        categories: parseCommaList(draft.categories),
        tags: tags.length > 0 ? tags : suggested.tags,
        collection_id: draft.collection_id || null,
        sort_order: Number(draft.sort_order) || 0,
        is_published: draft.is_published,
        taken_at: draft.taken_at || null,
        photographer: draft.photographer.trim() || null,
        copyright_holder: draft.copyright_holder.trim() || null,
        license: draft.license.trim() || null,
      })
      .eq("id", image.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved();
  };

  return (
    <SideDrawer
      open
      title="Image details"
      subtitle="Update metadata, publishing, and credits."
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="admin-button admin-button--danger admin-button--small"
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </button>
          <div className="admin-drawer__footer-actions">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="gallery-editor-form"
              className="admin-button admin-button--primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </>
      }
    >
      <div className="admin-preview">
        {image.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
          <img
            src={image.public_url}
            alt={image.alt_text}
            style={{
              objectFit: "cover",
              objectPosition: `${draft.objectPositionX}% ${draft.objectPositionY}%`,
            }}
          />
        ) : null}
        <div className="admin-preview__meta">
          <span>{image.format?.toUpperCase() ?? "IMAGE"}</span>
          <span>
            {image.width && image.height
              ? `${image.width} × ${image.height}`
              : "Dimensions unknown"}
          </span>
          <span>{formatBytes(image.file_size_bytes)}</span>
        </div>
        <div className="admin-preview__crop">
          <label className="admin-field__label">Move image (X)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={draft.objectPositionX}
            onChange={(event) => update("objectPositionX", Number(event.target.value))}
            className="admin-range"
          />
          <label className="admin-field__label">Move image (Y)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={draft.objectPositionY}
            onChange={(event) => update("objectPositionY", Number(event.target.value))}
            className="admin-range"
          />
        </div>
      </div>

      {usage.length > 0 ? (
        <AdminAlert tone="info">
          Used in {usage.length} project{usage.length === 1 ? "" : "s"}:{" "}
          {usage
            .map(
              (entry) =>
                `${entry.projectTitle} (${usageLabel(entry.roles)})`
            )
            .join(", ")}
        </AdminAlert>
      ) : null}

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <button
        type="button"
        className="admin-button admin-button--ghost admin-button--small"
        style={{ marginBottom: "0.9rem" }}
        onClick={() => {
          const suggested = buildGalleryImageSeo({
            ...image,
            title: draft.title.trim() || image.title,
            caption: draft.caption.trim() || null,
            description: draft.description.trim() || null,
          });
          setDraft((current) => ({
            ...current,
            description: suggested.description,
            tags: suggested.tags.join(", "),
          }));
        }}
      >
        Generate SEO defaults
      </button>

      <form id="gallery-editor-form" onSubmit={handleSave}>
        <div className="admin-form-grid">
          <AdminField label="Title" htmlFor="editor-title" required>
            <input
              id="editor-title"
              className="admin-input"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              required
            />
          </AdminField>

          <AdminField
            label="Alt text"
            htmlFor="editor-alt"
            hint="Describe the image for screen readers and search engines."
            required
          >
            <input
              id="editor-alt"
              className="admin-input"
              value={draft.alt_text}
              onChange={(event) => update("alt_text", event.target.value)}
              required
            />
          </AdminField>
        </div>

        <div className="admin-form-grid" style={{ marginTop: "0.9rem" }}>
          <AdminField label="Caption" htmlFor="editor-caption">
            <textarea
              id="editor-caption"
              className="admin-textarea"
              rows={2}
              value={draft.caption}
              onChange={(event) => update("caption", event.target.value)}
            />
          </AdminField>
          <AdminField label="Description" htmlFor="editor-description">
            <textarea
              id="editor-description"
              className="admin-textarea"
              rows={2}
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </AdminField>
        </div>

        <div className="admin-form-grid" style={{ marginTop: "0.9rem" }}>
          <AdminField
            label="Categories"
            htmlFor="editor-categories"
            hint="Comma-separated."
          >
            <input
              id="editor-categories"
              className="admin-input"
              value={draft.categories}
              onChange={(event) => update("categories", event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Tags"
            htmlFor="editor-tags"
            hint="Comma-separated."
          >
            <input
              id="editor-tags"
              className="admin-input"
              value={draft.tags}
              onChange={(event) => update("tags", event.target.value)}
            />
          </AdminField>
        </div>

        <div className="admin-form-grid" style={{ marginTop: "0.9rem" }}>
          <AdminField label="Collection" htmlFor="editor-collection">
            <select
              id="editor-collection"
              className="admin-select"
              value={draft.collection_id}
              onChange={(event) => update("collection_id", event.target.value)}
            >
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField
            label="Sort order"
            htmlFor="editor-sort"
            hint="Lower numbers appear first."
          >
            <input
              id="editor-sort"
              type="number"
              className="admin-input"
              value={draft.sort_order}
              onChange={(event) =>
                update("sort_order", Number(event.target.value))
              }
            />
          </AdminField>
          <AdminField
            label="Visibility"
            htmlFor="editor-published"
            hint="Only published images appear on the public gallery."
          >
            <label className="admin-checkbox admin-checkbox--boxed">
              <input
                id="editor-published"
                type="checkbox"
                checked={draft.is_published}
                onChange={(event) =>
                  update("is_published", event.target.checked)
                }
              />
              Published
            </label>
          </AdminField>
        </div>

        <div className="admin-form-grid" style={{ marginTop: "0.9rem" }}>
          <AdminField label="Date taken" htmlFor="editor-taken">
            <input
              id="editor-taken"
              type="date"
              className="admin-input"
              value={draft.taken_at}
              onChange={(event) => update("taken_at", event.target.value)}
            />
          </AdminField>
          <AdminField label="Photographer" htmlFor="editor-photographer">
            <input
              id="editor-photographer"
              className="admin-input"
              value={draft.photographer}
              onChange={(event) => update("photographer", event.target.value)}
            />
          </AdminField>
        </div>

        <div className="admin-form-grid" style={{ marginTop: "0.9rem" }}>
          <AdminField label="Copyright holder" htmlFor="editor-copyright">
            <input
              id="editor-copyright"
              className="admin-input"
              value={draft.copyright_holder}
              onChange={(event) =>
                update("copyright_holder", event.target.value)
              }
            />
          </AdminField>
          <AdminField label="License" htmlFor="editor-license">
            <input
              id="editor-license"
              className="admin-input"
              value={draft.license}
              onChange={(event) => update("license", event.target.value)}
            />
          </AdminField>
        </div>
      </form>

      <dl className="admin-readonly">
        <div className="admin-readonly__row">
          <dt>Storage path</dt>
          <dd>{image.storage_path}</dd>
        </div>
        <div className="admin-readonly__row">
          <dt>Uploaded</dt>
          <dd>{formatDate(image.created_at)}</dd>
        </div>
        <div className="admin-readonly__row">
          <dt>Last updated</dt>
          <dd>{formatDate(image.updated_at)}</dd>
        </div>
        <div className="admin-readonly__row">
          <dt>Status</dt>
          <dd>{draft.is_published ? "Published" : "Draft"}</dd>
        </div>
      </dl>
    </SideDrawer>
  );
}
