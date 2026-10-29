"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderPlusIcon,
  ImageIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  UploadIcon,
} from "@/components/ui/icons";
import {
  AdminAlert,
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
  useAdminToast,
} from "@/components/admin/ui/AdminUi";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { UploadDialog } from "@/components/admin/ui/UploadDialog";
import { GalleryCard } from "@/components/admin/GalleryCard";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { slugify } from "@/lib/admin/format";
import { buildUsageMap } from "@/lib/admin/usage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryCollection,
  GalleryImage,
  ProjectRecord,
  SiteSettings,
} from "@/lib/admin/types";

const PAGE_SIZE = 24;

interface DeleteTarget {
  ids: string[];
  title: string;
}

type SortMode = "manual" | "newest" | "oldest" | "title";

function GalleryManager() {
  const searchParams = useSearchParams();
  const { push } = useAdminToast();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [uploadDefaults, setUploadDefaults] = useState({
    defaultStatus: "draft" as "draft" | "published",
    defaultCategories: [] as string[],
    requireAltText: true,
    autoPublishOnUpload: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") === "published"
      ? "published"
      : searchParams.get("status") === "draft"
        ? "draft"
        : "all"
  );
  const [collectionFilter, setCollectionFilter] = useState(
    searchParams.get("collection") ?? "all"
  );
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(
    searchParams.get("upload") === "1"
  );
  const [editorId, setEditorId] = useState<string | null>(
    searchParams.get("image")
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [collectionDeleteTarget, setCollectionDeleteTarget] =
    useState<GalleryCollection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  const usageMap = useMemo(() => buildUsageMap(projects), [projects]);

  const load = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const [imagesResult, collectionsResult, projectsResult, settingsResult] =
        await Promise.all([
          supabase
            .from("gallery_images")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
          supabase
            .from("gallery_collections")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
          supabase.from("projects").select("*"),
          supabase
            .from("site_settings")
            .select("key,value")
            .in("key", ["gallery_defaults", "publishing"]),
        ]);

      const firstError =
        imagesResult.error ?? collectionsResult.error ?? projectsResult.error;
      if (firstError) throw firstError;

      setImages((imagesResult.data as GalleryImage[]) ?? []);
      setCollections((collectionsResult.data as GalleryCollection[]) ?? []);
      setProjects((projectsResult.data as ProjectRecord[]) ?? []);

      if (!settingsResult.error && settingsResult.data) {
        const settings = settingsResult.data as Array<{
          key: keyof SiteSettings;
          value: unknown;
        }>;
        const galleryDefaults = settings.find(
          (row) => row.key === "gallery_defaults"
        )?.value as SiteSettings["gallery_defaults"] | undefined;
        const publishing = settings.find(
          (row) => row.key === "publishing"
        )?.value as SiteSettings["publishing"] | undefined;

        if (galleryDefaults || publishing) {
          setUploadDefaults({
            defaultStatus: galleryDefaults?.defaultStatus ?? "draft",
            defaultCategories: galleryDefaults?.defaultCategories ?? [],
            requireAltText: publishing?.requireAltText ?? true,
            autoPublishOnUpload: publishing?.autoPublishOnUpload ?? false,
          });
        }
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the gallery."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch resolves asynchronously
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = images.filter((image) => {
      const matchesSearch =
        !query ||
        image.title.toLowerCase().includes(query) ||
        image.alt_text.toLowerCase().includes(query) ||
        image.categories.some((category) =>
          category.toLowerCase().includes(query)
        );
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && image.is_published) ||
        (statusFilter === "draft" && !image.is_published);
      const matchesCollection =
        collectionFilter === "all" ||
        image.collection_id === collectionFilter;
      return matchesSearch && matchesStatus && matchesCollection;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortMode === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      if (sortMode === "title") {
        return a.title.localeCompare(b.title);
      }
      return (
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [images, search, statusFilter, collectionFilter, sortMode]);

  const visible = filtered.slice(0, visibleCount);
  const editorImage =
    images.find((image) => image.id === editorId) ?? null;

  const setFilter = (updater: () => void) => {
    updater();
    setVisibleCount(PAGE_SIZE);
  };

  const toggleSelected = (id: string, selected: boolean) => {
    setSelectedIds((current) =>
      selected
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id)
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const togglePublish = async (image: GalleryImage) => {
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("gallery_images")
      .update({ is_published: !image.is_published })
      .eq("id", image.id);

    if (updateError) {
      push(updateError.message, "error");
      return;
    }

    push(
      image.is_published ? "Image unpublished." : "Image published.",
      "success"
    );
    await load();
  };

  const copyUrl = async (image: GalleryImage) => {
    if (!image.public_url) {
      push("This image has no public URL.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(image.public_url);
      push("Image URL copied.", "success");
    } catch {
      push("Unable to copy. Select the URL manually.", "error");
    }
  };

  const requestDelete = (targets: GalleryImage[]) => {
    const used = targets.filter((image) => (usageMap[image.id] ?? []).length > 0);
    if (used.length > 0) {
      push(
        `${used.map((image) => image.title).join(", ")} ${
          used.length === 1 ? "is" : "are"
        } used by a project. Remove the reference first.`,
        "error"
      );
      return;
    }

    setDeleteTarget({
      ids: targets.map((image) => image.id),
      title:
        targets.length === 1
          ? targets[0].title
          : `${targets.length} images`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    const targets = images.filter((image) =>
      deleteTarget.ids.includes(image.id)
    );

    const { error: deleteError } = await supabase
      .from("gallery_images")
      .delete()
      .in("id", deleteTarget.ids);

    if (deleteError) {
      setDeleting(false);
      push(deleteError.message, "error");
      return;
    }

    const paths = targets
      .map((image) => image.storage_path)
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("portfolio-media")
        .remove(paths);
      if (storageError) {
        push(
          "Records deleted, but some storage files could not be removed.",
          "error"
        );
      }
    }

    setDeleting(false);
    setDeleteTarget(null);
    clearSelection();
    if (editorId && deleteTarget.ids.includes(editorId)) setEditorId(null);
    push(
      deleteTarget.ids.length === 1
        ? "Image deleted."
        : `${deleteTarget.ids.length} images deleted.`,
      "success"
    );
    await load();
  };

  const bulkUpdate = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("gallery_images")
      .update({ is_published: publish })
      .in("id", selectedIds);

    if (updateError) {
      push(updateError.message, "error");
      return;
    }

    push(
      `${selectedIds.length} image${selectedIds.length === 1 ? "" : "s"} ${
        publish ? "published" : "unpublished"
      }.`,
      "success"
    );
    clearSelection();
    await load();
  };

  const createCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;

    setCreatingCollection(true);
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase
      .from("gallery_collections")
      .insert({
        name,
        slug: slugify(name),
        description: newCollectionDescription.trim() || null,
        is_published: false,
      });
    setCreatingCollection(false);

    if (insertError) {
      push(insertError.message, "error");
      return;
    }

    setNewCollectionName("");
    setNewCollectionDescription("");
    push("Collection created.", "success");
    await load();
  };

  const toggleCollection = async (collection: GalleryCollection) => {
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("gallery_collections")
      .update({ is_published: !collection.is_published })
      .eq("id", collection.id);

    if (updateError) {
      push(updateError.message, "error");
      return;
    }
    await load();
  };

  const confirmDeleteCollection = async () => {
    if (!collectionDeleteTarget) return;
    setDeletingCollection(true);
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("gallery_collections")
      .delete()
      .eq("id", collectionDeleteTarget.id);

    if (deleteError) {
      setDeletingCollection(false);
      push(deleteError.message, "error");
      return;
    }
    setDeletingCollection(false);
    setCollectionDeleteTarget(null);
    push("Collection deleted.", "success");
    await load();
  };

  const categories = useMemo(
    () => Array.from(new Set(images.flatMap((image) => image.categories))),
    [images]
  );

  const allVisibleSelected =
    visible.length > 0 && visible.every((image) => selectedIds.includes(image.id));

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Visual archive"
        title="Gallery"
        description="Curate published images, organize collections, and keep alt text and credits accurate."
        actions={
          <>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => {
                setLoading(true);
                setError(null);
                void load();
              }}
              disabled={loading}
            >
              <RefreshIcon width={16} height={16} />
              Refresh
            </button>
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={() => setUploadOpen(true)}
            >
              <UploadIcon width={16} height={16} />
              Upload images
            </button>
          </>
        }
      />

      {error ? (
        <AdminAlert tone="error">
          {error}{" "}
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--small"
            onClick={() => {
              setLoading(true);
              setError(null);
              void load();
            }}
          >
            Retry
          </button>
        </AdminAlert>
      ) : null}

      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          <div className="admin-search">
            <SearchIcon
              width={17}
              height={17}
              className="admin-search__icon"
              aria-hidden="true"
            />
            <input
              type="search"
              className="admin-input"
              placeholder="Search title, alt text, or category…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              aria-label="Search gallery"
            />
          </div>
          <select
            className="admin-select admin-select--compact"
            value={statusFilter}
            onChange={(event) =>
              setFilter(() => setStatusFilter(event.target.value))
            }
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            className="admin-select admin-select--compact"
            value={collectionFilter}
            onChange={(event) =>
              setFilter(() => setCollectionFilter(event.target.value))
            }
            aria-label="Filter by collection"
          >
            <option value="all">All collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <select
            className="admin-select admin-select--compact"
            value={sortMode}
            onChange={(event) =>
              setFilter(() => setSortMode(event.target.value as SortMode))
            }
            aria-label="Sort images"
          >
            <option value="manual">Manual order</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <span className="admin-toolbar__count">
          {filtered.length} of {images.length} images
        </span>
      </div>

      {categories.length > 0 ? (
        <div className="admin-toolbar__group" aria-label="Categories">
          {categories.map((category) => (
            <AdminBadge key={category}>{category}</AdminBadge>
          ))}
        </div>
      ) : null}

      <section className="admin-collections" aria-label="Collections">
        <button
          type="button"
          className="admin-collections__toggle"
          onClick={() => setCollectionsOpen((current) => !current)}
          aria-expanded={collectionsOpen}
          aria-controls="gallery-collections-panel"
        >
          <span>
            Collections{" "}
            <span className="admin-toolbar__count">({collections.length})</span>
          </span>
          <span aria-hidden="true">{collectionsOpen ? "−" : "+"}</span>
        </button>
        {collectionsOpen ? (
          <div className="admin-collections__body" id="gallery-collections-panel">
            <form className="admin-collection-form" onSubmit={createCollection}>
              <div className="admin-field">
                <label className="admin-field__label" htmlFor="new-collection">
                  New collection
                </label>
                <input
                  id="new-collection"
                  className="admin-input"
                  value={newCollectionName}
                  onChange={(event) => setNewCollectionName(event.target.value)}
                  placeholder="Name"
                />
              </div>
              <div className="admin-field">
                <label
                  className="admin-field__label"
                  htmlFor="new-collection-description"
                >
                  Description
                </label>
                <input
                  id="new-collection-description"
                  className="admin-input"
                  value={newCollectionDescription}
                  onChange={(event) =>
                    setNewCollectionDescription(event.target.value)
                  }
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                className="admin-button admin-button--primary"
                disabled={creatingCollection || !newCollectionName.trim()}
              >
                <FolderPlusIcon width={16} height={16} />
                {creatingCollection ? "Creating…" : "Add collection"}
              </button>
            </form>

            {collections.length === 0 ? (
              <p className="admin-empty__text">No collections yet.</p>
            ) : (
              <ul className="admin-collection-list">
                {collections.map((collection) => (
                  <li className="admin-collection-row" key={collection.id}>
                    <div className="admin-collection-row__name">
                      <strong>{collection.name}</strong>
                      <span className="admin-collection-row__slug">
                        /{collection.slug}/ ·{" "}
                        {collection.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="admin-collection-row__actions">
                      <button
                        type="button"
                        className="admin-button admin-button--ghost admin-button--small"
                        onClick={() => void toggleCollection(collection)}
                      >
                        {collection.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button--danger admin-button--small"
                        onClick={() => setCollectionDeleteTarget(collection)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      {selectedIds.length > 0 ? (
        <div className="admin-selection-bar" role="status">
          <span className="admin-selection-bar__count">
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--small"
            onClick={() => void bulkUpdate(true)}
          >
            Publish
          </button>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--small"
            onClick={() => void bulkUpdate(false)}
          >
            Unpublish
          </button>
          <button
            type="button"
            className="admin-button admin-button--danger admin-button--small"
            onClick={() =>
              requestDelete(
                images.filter((image) => selectedIds.includes(image.id))
              )
            }
          >
            Delete
          </button>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--small"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Loading gallery…" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={<ImageIcon width={34} height={34} aria-hidden="true" />}
          title={images.length === 0 ? "No images yet" : "No images match"}
          text={
            images.length === 0
              ? "Upload your first image to start curating the public gallery."
              : "Try a different search term or filter."
          }
          action={
            images.length === 0 ? (
              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={() => setUploadOpen(true)}
              >
                <PlusIcon width={16} height={16} />
                Upload images
              </button>
            ) : (
              <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCollectionFilter("all");
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="admin-toolbar">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => {
                  if (event.target.checked) {
                    setSelectedIds((current) =>
                      Array.from(
                        new Set([...current, ...visible.map((image) => image.id)])
                      )
                    );
                  } else {
                    const visibleIds = new Set(visible.map((image) => image.id));
                    setSelectedIds((current) =>
                      current.filter((id) => !visibleIds.has(id))
                    );
                  }
                }}
              />
              Select all shown
            </label>
            <span className="admin-toolbar__count">
              Showing {visible.length} of {filtered.length}
            </span>
          </div>

          <div className="admin-gallery-grid" aria-label="Gallery images">
            {visible.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                selected={selectedIds.includes(image.id)}
                onSelectChange={(selected) =>
                  toggleSelected(image.id, selected)
                }
                onEdit={() => setEditorId(image.id)}
                onTogglePublish={() => void togglePublish(image)}
                onCopyUrl={() => void copyUrl(image)}
                onDelete={() => requestDelete([image])}
              />
            ))}
          </div>

          {visible.length < filtered.length ? (
            <div className="admin-load-more">
              <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          ) : null}
        </>
      )}

      <UploadDialog
        open={uploadOpen}
        collections={collections}
        defaults={uploadDefaults}
        onClose={() => setUploadOpen(false)}
        onComplete={() => {
          void load();
          push("Upload complete.", "success");
        }}
      />

      {editorImage ? (
        <GalleryEditor
          key={editorImage.id}
          image={editorImage}
          collections={collections}
          usage={usageMap[editorImage.id] ?? []}
          onClose={() => setEditorId(null)}
          onSaved={() => {
            setEditorId(null);
            push("Image details saved.", "success");
            void load();
          }}
          onDelete={() => {
            setEditorId(null);
            requestDelete([editorImage]);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete image"
        description={
          deleteTarget ? (
            <>
              <p className="admin-confirm-text">
                Delete <strong>{deleteTarget.title}</strong>? This removes the
                database record and the stored file. This cannot be undone.
              </p>
              {deleteTarget.ids.length > 1 ? (
                <p className="admin-confirm-text">
                  All selected images are unused by projects.
                </p>
              ) : null}
            </>
          ) : null
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(collectionDeleteTarget)}
        title="Delete collection"
        description={
          collectionDeleteTarget ? (
            <p className="admin-confirm-text">
              Delete <strong>{collectionDeleteTarget.name}</strong>? Images stay
              in the library and become unassigned. This cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        busy={deletingCollection}
        onConfirm={() => void confirmDeleteCollection()}
        onCancel={() => setCollectionDeleteTarget(null)}
      />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<AdminLoading label="Loading gallery…" />}>
      <GalleryManager />
    </Suspense>
  );
}
