"use client";

import { useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  ImagePlusIcon,
  UploadIcon,
} from "@/components/ui/icons";
import { useDialogA11y } from "@/components/admin/ui/useDialogA11y";
import {
  ALLOWED_IMAGE_ACCEPT,
  formatFromMime,
  getImageDimensions,
  validateImageFile,
} from "@/lib/admin/images";
import {
  fileExtension,
  formatBytes,
  titleFromFilename,
} from "@/lib/admin/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryCollection,
  UploadItem,
} from "@/lib/admin/types";

interface UploadDefaults {
  defaultStatus: "draft" | "published";
  defaultCategories: string[];
  requireAltText: boolean;
  autoPublishOnUpload: boolean;
}

interface UploadDialogProps {
  open: boolean;
  collections: GalleryCollection[];
  defaults: UploadDefaults;
  onClose: () => void;
  onComplete: () => void;
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function UploadDialog({
  open,
  collections,
  defaults,
  onClose,
  onComplete,
}: UploadDialogProps) {
  const ref = useDialogA11y(open, onClose);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [publishNow, setPublishNow] = useState(
    defaults.defaultStatus === "published" || defaults.autoPublishOnUpload
  );
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);

  if (!open) return null;

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);

    const accepted: UploadItem[] = [];
    const problems: string[] = [];

    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) {
        problems.push(problem);
        continue;
      }

      const id = makeId();
      const title = titleFromFilename(file.name);
      accepted.push({
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        title,
        altText: title,
        width: null,
        height: null,
        state: "queued",
        progress: 0,
        error: null,
      });
    }

    if (problems.length > 0) setError(problems.join(" "));
    if (accepted.length === 0) return;

    setItems((current) => [...current, ...accepted]);

    for (const item of accepted) {
      const dimensions = await getImageDimensions(item.file);
      updateItem(item.id, dimensions);
    }
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const uploadItem = async (item: UploadItem) => {
    if (defaults.requireAltText && !item.altText.trim()) {
      updateItem(item.id, {
        state: "error",
        error: "Alt text is required by your publishing settings.",
      });
      return false;
    }

    updateItem(item.id, { state: "uploading", error: null, progress: 20 });

    const supabase = createSupabaseBrowserClient();
    const extension = fileExtension(item.file.name) || formatFromMime(item.file.type);
    const storagePath = `gallery/${makeId()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-media")
      .upload(storagePath, item.file, {
        cacheControl: "3600",
        contentType: item.file.type,
        upsert: false,
      });

    if (uploadError) {
      updateItem(item.id, {
        state: "error",
        progress: 0,
        error: uploadError.message,
      });
      return false;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio-media").getPublicUrl(storagePath);

    updateItem(item.id, { progress: 75 });

    const { error: insertError } = await supabase
      .from("gallery_images")
      .insert({
        storage_path: storagePath,
        public_url: publicUrl,
        title: item.title.trim() || titleFromFilename(item.file.name),
        alt_text: item.altText.trim(),
        caption: null,
        description: null,
        categories: defaults.defaultCategories,
        tags: [],
        collection_id: collectionId || null,
        sort_order: 0,
        width: item.width,
        height: item.height,
        format: formatFromMime(item.file.type),
        file_size_bytes: item.file.size,
        is_published: publishNow,
      });

    if (insertError) {
      await supabase.storage.from("portfolio-media").remove([storagePath]);
      updateItem(item.id, {
        state: "error",
        progress: 0,
        error: insertError.message,
      });
      return false;
    }

    updateItem(item.id, { state: "done", progress: 100 });
    return true;
  };

  const runUpload = async (targets: UploadItem[]) => {
    if (targets.length === 0 || uploading) return;
    setUploading(true);
    setError(null);
    let successes = 0;

    for (const item of targets) {
      const ok = await uploadItem(item);
      if (ok) successes += 1;
    }

    setUploading(false);
    if (successes > 0) {
      setCompleted((current) => current + successes);
      onComplete();
    }
  };

  const queued = items.filter((item) => item.state === "queued");
  const failed = items.filter((item) => item.state === "error");
  const done = items.filter((item) => item.state === "done");

  const handleClose = () => {
    if (uploading) return;
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setCompleted(0);
    setError(null);
    onClose();
  };

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={ref}
        className="admin-modal admin-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-dialog-title"
      >
        <div className="admin-modal__header">
          <div>
            <h2 className="admin-modal__title" id="upload-dialog-title">
              Upload images
            </h2>
            <p className="admin-modal__subtitle">
              JPEG, PNG, WebP, AVIF, or GIF · up to 10 MB per file
            </p>
          </div>
          <button
            type="button"
            className="admin-drawer__close"
            onClick={handleClose}
            aria-label="Close upload dialog"
            disabled={uploading}
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <div className="admin-modal__body">
          {error ? (
            <div className="admin-alert admin-alert--error" role="alert">
              <AlertCircleIcon width={17} height={17} aria-hidden="true" />
              <div>{error}</div>
            </div>
          ) : null}

          <div
            className={`admin-upload-dropzone${dragging ? " is-dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void addFiles(Array.from(event.dataTransfer.files));
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            aria-label="Choose images to upload"
          >
            <UploadIcon width={26} height={26} aria-hidden="true" />
            <p className="admin-upload-dropzone__title">
              Drop images here or browse
            </p>
            <p className="admin-upload-dropzone__hint">
              Dimensions and file size are recorded automatically.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_ACCEPT}
              multiple
              className="admin-sr-only"
              hidden
              onChange={(event) => {
                void addFiles(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
          </div>

          {items.length > 0 ? (
            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-field">
                <label className="admin-field__label" htmlFor="upload-collection">
                  Collection
                </label>
                <select
                  id="upload-collection"
                  className="admin-select"
                  value={collectionId}
                  onChange={(event) => setCollectionId(event.target.value)}
                  disabled={uploading}
                >
                  <option value="">No collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="admin-checkbox admin-checkbox--boxed">
                <input
                  type="checkbox"
                  checked={publishNow}
                  onChange={(event) => setPublishNow(event.target.checked)}
                  disabled={uploading}
                />
                Publish immediately
              </label>
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="admin-upload-list">
              {items.map((item) => (
                <div className="admin-upload-row" key={item.id}>
                  <div className="admin-upload-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={item.previewUrl} alt="" />
                  </div>
                  <div className="admin-upload-info">
                    <input
                      className="admin-input"
                      value={item.title}
                      onChange={(event) =>
                        updateItem(item.id, { title: event.target.value })
                      }
                      aria-label={`Title for ${item.file.name}`}
                      disabled={uploading || item.state === "done"}
                    />
                    <input
                      className="admin-input"
                      value={item.altText}
                      onChange={(event) =>
                        updateItem(item.id, { altText: event.target.value })
                      }
                      aria-label={`Alt text for ${item.file.name}`}
                      placeholder="Describe the image for screen readers"
                      disabled={uploading || item.state === "done"}
                    />
                    <span className="admin-upload-meta">
                      {formatBytes(item.file.size)}
                      {item.width && item.height
                        ? ` · ${item.width}×${item.height}`
                        : ""}
                      {item.error ? ` · ${item.error}` : ""}
                    </span>
                    {item.state === "uploading" ? (
                      <div className="admin-progress">
                        <div
                          className="admin-progress__fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="admin-upload-status">
                    {item.state === "queued" ? (
                      <button
                        type="button"
                        className="admin-icon-button admin-icon-button--surface"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                        disabled={uploading}
                      >
                        <CloseIcon width={14} height={14} />
                      </button>
                    ) : item.state === "uploading" ? (
                      <>
                        <span className="admin-spinner" aria-hidden="true" />
                        <span className="admin-upload-status">Uploading…</span>
                      </>
                    ) : item.state === "done" ? (
                      <span className="admin-upload-status admin-upload-status--done">
                        <CheckCircleIcon width={15} height={15} /> Done
                      </span>
                    ) : item.state === "error" ? (
                      <span className="admin-upload-status admin-upload-status--error">
                        <AlertCircleIcon width={15} height={15} /> Failed
                      </span>
                    ) : (
                      <span className="admin-upload-status">Cancelled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-upload-dropzone__hint">
              <ImagePlusIcon width={16} height={16} aria-hidden="true" /> Add at
              least one image to begin.
            </p>
          )}
        </div>

        <div className="admin-modal__footer">
          {done.length > 0 ? (
            <span className="admin-toolbar__count">
              {completed} uploaded this session
            </span>
          ) : null}
          {failed.length > 0 ? (
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => void runUpload(failed)}
              disabled={uploading}
            >
              Retry failed ({failed.length})
            </button>
          ) : null}
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={handleClose}
            disabled={uploading}
          >
            {done.length > 0 && queued.length === 0 ? "Done" : "Cancel"}
          </button>
          {queued.length > 0 ? (
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={() => void runUpload(queued)}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : `Upload ${queued.length}`}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
