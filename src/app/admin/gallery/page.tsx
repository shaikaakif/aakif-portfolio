"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  ImageIcon,
  FilterIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

interface GalleryImage {
  id: string;
  storage_path: string;
  public_url: string;
  title: string;
  alt_text: string;
  caption?: string | null;
  categories: string[];
  tags: string[];
  collection_id?: string | null;
  sort_order?: number | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  file_size_bytes?: number | null;
  is_published: boolean;
  created_at: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_published: boolean;
  sort_order?: number | null;
}

interface MetadataDraft {
  title: string;
  alt_text: string;
  caption: string;
  categories: string;
  tags: string;
  collection_id: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState<MetadataDraft>({
    title: "",
    alt_text: "",
    caption: "",
    categories: "",
    tags: "",
    collection_id: "",
  });
  const [showCollections, setShowCollections] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.contains("categories", [selectedCategory]);
      }
      if (selectedCollection !== "all") {
        query = query.eq("collection_id", selectedCollection);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setImages(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCollection]);

  const fetchCollections = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: err } = await supabase
        .from("gallery_collections")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (err) throw err;
      setCollections(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load collections");
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        let query = supabase
          .from("gallery_images")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (selectedCategory !== "all") {
          query = query.contains("categories", [selectedCategory]);
        }
        if (selectedCollection !== "all") {
          query = query.eq("collection_id", selectedCollection);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        if (!ignore) setImages(data ?? []);
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load gallery images");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [selectedCategory, selectedCollection]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: err } = await supabase
          .from("gallery_collections")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });
        if (err) throw err;
        if (!ignore) setCollections(data ?? []);
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load collections");
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.alt_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || img.categories.includes(selectedCategory);
    const matchesCollection =
      selectedCollection === "all" || img.collection_id === selectedCollection;
    return matchesSearch && matchesCategory && matchesCollection;
  });

  const allCategories = [...new Set(images.flatMap((img) => img.categories))];

  const openMetadataEditor = (image: GalleryImage) => {
    setEditingImage(image);
    setDraft({
      title: image.title,
      alt_text: image.alt_text,
      caption: image.caption ?? "",
      categories: image.categories.join(", "),
      tags: image.tags.join(", "),
      collection_id: image.collection_id ?? "",
    });
    setShowMetadataEditor(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pct = Math.round(((i + 1) / files.length) * 100);
      setProgress(pct);

      try {
        const supabase = createSupabaseBrowserClient();
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const storagePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-media")
          .getPublicUrl(storagePath);

        const { error: insertError } = await supabase
          .from("gallery_images")
          .insert({
            storage_path: storagePath,
            public_url: publicUrl,
            title: file.name.replace(/\.[^/.]+$/, ""),
            alt_text: file.name.replace(/\.[^/.]+$/, ""),
            categories: ["gallery"],
            tags: [],
            is_published: false,
          });

        if (insertError) throw insertError;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    setUploading(false);
    setProgress(0);
    (e.target as HTMLInputElement).value = "";
    fetchImages();
  };

  const handlePublish = async (id: string, publish: boolean) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("gallery_images")
        .update({ is_published: publish })
        .eq("id", id);

      if (error) {
        setError(error.message);
        return;
      }
      fetchImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const image = images.find((img) => img.id === id);
      if (image) {
        await supabase.storage.from("portfolio-media").remove([image.storage_path]);
      }

      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("gallery_images")
        .update({
          title: draft.title.trim(),
          alt_text: draft.alt_text.trim(),
          caption: draft.caption.trim() || null,
          categories: draft.categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          collection_id: draft.collection_id || null,
        })
        .eq("id", editingImage.id);

      if (error) {
        setError(error.message);
        return;
      }
      setShowMetadataEditor(false);
      setEditingImage(null);
      fetchImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = images.findIndex((img) => img.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.all(
        reordered.map((img, position) =>
          supabase
            .from("gallery_images")
            .update({ sort_order: position })
            .eq("id", img.id)
        )
      );
      setImages(reordered);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reorder failed");
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("gallery_collections").insert({
        name,
        slug: slugify(name),
        description: newCollectionDescription.trim() || null,
        is_published: false,
      });
      if (error) {
        setError(error.message);
        return;
      }
      setNewCollectionName("");
      setNewCollectionDescription("");
      fetchCollections();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create collection");
    }
  };

  const handleToggleCollection = async (id: string, publish: boolean) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("gallery_collections")
        .update({ is_published: publish })
        .eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchCollections();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update collection");
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm("Delete this collection? Images will be unassigned.")) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("gallery_collections")
        .delete()
        .eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchCollections();
      fetchImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete collection");
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Image URL copied to clipboard.");
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setError("Unable to copy URL. Select and copy it manually.");
    }
  };

  return (
    <div className="admin-gallery-manager">
      <div className="admin-page-header">
        <div className="admin-header-content">
          <h1 className="admin-page-title">Gallery Manager</h1>
          <p className="admin-page-subtitle">
            Upload, organize, and publish your photography and project images.
          </p>
        </div>
        <div className="admin-header-actions">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden-file-input"
          />
          <button
            onClick={() =>
              (document.querySelector(".hidden-file-input") as HTMLInputElement)?.click()
            }
            className="button button--primary"
          >
            <PlusIcon width={16} height={16} />
            Upload Images
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="admin-notice-banner" role="status">
          {notice}
        </div>
      )}

      <div className="admin-collections">
        <button
          type="button"
          className="admin-collections-toggle"
          onClick={() => setShowCollections((prev) => !prev)}
          aria-expanded={showCollections}
        >
          Collections ({collections.length})
          <span aria-hidden="true">{showCollections ? "−" : "+"}</span>
        </button>

        {showCollections && (
          <div className="admin-collections-body">
            <form className="admin-collection-form" onSubmit={handleCreateCollection}>
              <input
                type="text"
                className="input"
                placeholder="New collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <input
                type="text"
                className="input"
                placeholder="Description (optional)"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
              <button type="submit" className="button button--primary">
                Add Collection
              </button>
            </form>

            <ul className="admin-collection-list">
              {collections.length === 0 && (
                <li className="admin-collection-empty">No collections yet.</li>
              )}
              {collections.map((collection) => (
                <li key={collection.id} className="admin-collection-row">
                  <div>
                    <strong>{collection.name}</strong>
                    <span className="admin-collection-slug">/{collection.slug}/</span>
                  </div>
                  <div className="admin-collection-actions">
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() =>
                        handleToggleCollection(collection.id, !collection.is_published)
                      }
                    >
                      {collection.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="admin-link-btn admin-link-btn--delete"
                      onClick={() => handleDeleteCollection(collection.id)}
                      title="Delete collection"
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="admin-gallery-toolbar">
        <div className="admin-search-filters">
          <div className="admin-search-box">
            <SearchIcon
              width={18}
              height={18}
              style={{ color: "var(--muted)", marginRight: "0.75rem" }}
            />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <div className="admin-filter-group">
            <FilterIcon
              width={18}
              height={18}
              style={{ color: "var(--muted)", marginRight: "0.75rem" }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="input"
              aria-label="Filter by collection"
            >
              <option value="all">All Collections</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-upload-status">
          {uploading && (
            <div className="admin-progress-bar">
              <div
                className="admin-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="admin-gallery-grid" role="grid" aria-label="Gallery images">
        {loading && (
          <div className="admin-loading" role="status">
            Loading images...
          </div>
        )}
        {!loading && filteredImages.length === 0 && (
          <div className="admin-empty-state">
            <ImageIcon width={48} height={48} style={{ color: "var(--muted)" }} />
            <p>No images found</p>
            {images.length > 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Try adjusting your search or filter
              </p>
            ) : null}
          </div>
        )}
        {!loading &&
          filteredImages.map((image) => (
            <div key={image.id} className="admin-gallery-item">
              <div className="admin-gallery-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, images are unoptimized in this static export */}
                <img
                  src={image.public_url}
                  alt={image.alt_text}
                  className="admin-gallery-image"
                  loading="lazy"
                />
                <div className="admin-gallery-overlay">
                  <div className="admin-gallery-actions">
                    <button
                      onClick={() => openMetadataEditor(image)}
                      title="Edit metadata"
                      className="admin-icon-button"
                    >
                      <EditIcon width={18} height={18} />
                    </button>
                    <button
                      onClick={() =>
                        handlePublish(image.id, !image.is_published)
                      }
                      title={image.is_published ? "Unpublish" : "Publish"}
                      className={`admin-icon-button ${
                        image.is_published ? "published" : ""
                      }`}
                    >
                      <ImageIcon width={18} height={18} />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(image.public_url)}
                      title="Copy image URL"
                      className="admin-icon-button"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      title="Delete"
                      className="admin-icon-button admin-icon-button--delete"
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>
                  <div className="admin-gallery-order">
                    <button
                      type="button"
                      onClick={() => handleMove(image.id, "up")}
                      title="Move earlier"
                      aria-label="Move image earlier"
                      className="admin-order-button"
                    >
                      <ChevronLeftIcon width={16} height={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(image.id, "down")}
                      title="Move later"
                      aria-label="Move image later"
                      className="admin-order-button"
                    >
                      <ChevronRightIcon width={16} height={16} />
                    </button>
                  </div>
                  <span className={`admin-gallery-badge ${image.is_published ? "published" : "draft"}`}>
                    {image.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="admin-gallery-info">
                <h3 className="admin-gallery-title">{image.title}</h3>
                <p className="admin-gallery-alt" title={image.alt_text}>
                  {image.alt_text}
                </p>
                <div className="admin-gallery-meta">
                  {image.categories.map((cat) => (
                    <span key={cat} className="admin-gallery-tag">
                      {cat}
                    </span>
                  ))}
                  {image.collection_id && (
                    <span className="admin-gallery-tag">
                      {collections.find((c) => c.id === image.collection_id)?.name ?? "Collection"}
                    </span>
                  )}
                  {image.width && image.height && (
                    <span className="admin-gallery-dimensions">
                      {image.width}×{image.height}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {showMetadataEditor && editingImage && (
        <div className="admin-modal-overlay" onClick={() => setShowMetadataEditor(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit Image Metadata</h2>
              <button
                onClick={() => setShowMetadataEditor(false)}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>
            <form className="admin-metadata-form" onSubmit={handleSaveMetadata}>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-title">Title</label>
                <input
                  id="gallery-title"
                  type="text"
                  className="input"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-alt">Alt Text</label>
                <textarea
                  id="gallery-alt"
                  className="input"
                  rows={3}
                  value={draft.alt_text}
                  onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-caption">Caption</label>
                <textarea
                  id="gallery-caption"
                  className="input"
                  rows={2}
                  value={draft.caption}
                  onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-categories">
                  Categories (comma-separated)
                </label>
                <input
                  id="gallery-categories"
                  type="text"
                  className="input"
                  value={draft.categories}
                  onChange={(e) => setDraft({ ...draft, categories: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-tags">Tags (comma-separated)</label>
                <input
                  id="gallery-tags"
                  type="text"
                  className="input"
                  value={draft.tags}
                  onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="gallery-collection">Collection</label>
                <select
                  id="gallery-collection"
                  className="input"
                  value={draft.collection_id}
                  onChange={(e) => setDraft({ ...draft, collection_id: e.target.value })}
                >
                  <option value="">No collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={() => setShowMetadataEditor(false)}
                  className="button button--ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}