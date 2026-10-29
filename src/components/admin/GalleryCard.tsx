"use client";

import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  LinkIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { AdminBadge } from "@/components/admin/ui/AdminUi";
import { formatBytes } from "@/lib/admin/format";
import type { GalleryImage } from "@/lib/admin/types";

interface GalleryCardProps {
  image: GalleryImage;
  selected: boolean;
  onSelectChange: (selected: boolean) => void;
  onEdit: () => void;
  onTogglePublish: () => void;
  onCopyUrl: () => void;
  onDelete: () => void;
}

export function GalleryCard({
  image,
  selected,
  onSelectChange,
  onEdit,
  onTogglePublish,
  onCopyUrl,
  onDelete,
}: GalleryCardProps) {
  return (
    <article
      className={`admin-gallery-card${selected ? " is-selected" : ""}`}
      aria-label={image.title}
    >
      <div className="admin-gallery-card__media">
        {image.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
          <img
            src={image.public_url}
            alt={image.alt_text}
            className="admin-gallery-card__image"
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="admin-empty">
            <ImageIcon width={26} height={26} aria-hidden="true" />
          </div>
        )}

        <label className="admin-gallery-card__check">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectChange(event.target.checked)}
            aria-label={`Select ${image.title}`}
          />
        </label>

        <span className="admin-gallery-card__status">
          <AdminBadge tone={image.is_published ? "published" : "draft"}>
            {image.is_published ? "Published" : "Draft"}
          </AdminBadge>
        </span>
      </div>

      <div className="admin-gallery-card__info">
        <h3 className="admin-gallery-card__title" title={image.title}>
          {image.title}
        </h3>
        <div className="admin-gallery-card__meta">
          <span>{image.format?.toUpperCase() ?? "IMAGE"}</span>
          {image.width && image.height ? (
            <span>
              {image.width}×{image.height}
            </span>
          ) : null}
          <span>{formatBytes(image.file_size_bytes)}</span>
        </div>

        <div className="admin-gallery-card__actions admin-gallery-card__actions--info">
          <button
            type="button"
            className="admin-icon-button admin-icon-button--surface"
            onClick={onEdit}
            aria-label={`Edit ${image.title}`}
            title="Edit metadata"
          >
            <EditIcon width={15} height={15} />
          </button>
          <button
            type="button"
            className="admin-icon-button admin-icon-button--surface"
            onClick={onTogglePublish}
            aria-label={
              image.is_published
                ? `Unpublish ${image.title}`
                : `Publish ${image.title}`
            }
            title={image.is_published ? "Unpublish" : "Publish"}
          >
            {image.is_published ? (
              <EyeOffIcon width={15} height={15} />
            ) : (
              <EyeIcon width={15} height={15} />
            )}
          </button>
          <button
            type="button"
            className="admin-icon-button admin-icon-button--surface"
            onClick={onCopyUrl}
            aria-label={`Copy URL for ${image.title}`}
            title="Copy image URL"
          >
            <LinkIcon width={15} height={15} />
          </button>
          <button
            type="button"
            className="admin-icon-button admin-icon-button--surface is-danger"
            onClick={onDelete}
            aria-label={`Delete ${image.title}`}
            title="Delete"
          >
            <TrashIcon width={15} height={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
