"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EditIcon,
  GridIcon,
  ImageIcon,
  LinkIcon,
  ListIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
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
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { formatBytes, formatDate } from "@/lib/admin/format";
import { buildUsageMap } from "@/lib/admin/usage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryCollection,
  GalleryImage,
  ProjectRecord,
  SiteSettings,
} from "@/lib/admin/types";

const PAGE_SIZE = 24;

type ViewMode = "grid" | "list";

export default function MediaLibraryPage() {
  const { push } = useAdminToast();

  const [assets, setAssets] = useState<GalleryImage[]>([]);
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
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const usageMap = useMemo(() => buildUsageMap(projects), [projects]);

  const load = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const [assetsResult, collectionsResult, projectsResult, settingsResult] =
        await Promise.all([
          supabase
            .from("gallery_images")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("gallery_collections")
            .select("*")
            .order("name", { ascending: true }),
          supabase.from("projects").select("*"),
          supabase
            .from("site_settings")
            .select("key,value")
            .in("key", ["gallery_defaults", "publishing"]),
        ]);

      const firstError =
        assetsResult.error ?? collectionsResult.error ?? projectsResult.error;
      if (firstError) throw firstError;

      setAssets((assetsResult.data as GalleryImage[]) ?? []);
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
          : "Could not load the media library."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch resolves asynchronously
    void load();
  }, [load]);

  const formats = useMemo(
    () =>
      Array.from(
        new Set(
          assets
            .map((asset) => asset.format?.toLowerCase())
            .filter((format): format is string => Boolean(format))
        )
      ).sort(),
    [assets]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.title.toLowerCase().includes(query) ||
        asset.storage_path.toLowerCase().includes(query) ||
        asset.alt_text.toLowerCase().includes(query);
      const matchesFormat =
        formatFilter === "all" || asset.format?.toLowerCase() === formatFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && asset.is_published) ||
        (statusFilter === "draft" && !asset.is_published);
      return matchesSearch && matchesFormat && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      if (sortMode === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortMode === "size") {
        return (b.file_size_bytes ?? 0) - (a.file_size_bytes ?? 0);
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [assets, search, formatFilter, statusFilter, sortMode]);

  const visible = filtered.slice(0, visibleCount);
  const editorAsset = assets.find((asset) => asset.id === editorId) ?? null;

  const requestDelete = (asset: GalleryImage) => {
    const usage = usageMap[asset.id] ?? [];
    if (usage.length > 0) {
      push(
        `${asset.title} is used by ${usage.length} project${
          usage.length === 1 ? "" : "s"
        }. Remove the reference before deleting.`,
        "error"
      );
      return;
    }
    setDeleteTarget(asset);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();

    const { error: deleteError } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setDeleting(false);
      push(deleteError.message, "error");
      return;
    }

    const { error: storageError } = await supabase.storage
      .from("portfolio-media")
      .remove([deleteTarget.storage_path]);

    if (storageError) {
      push("Record deleted, but the stored file could not be removed.", "error");
    }

    setDeleting(false);
    setDeleteTarget(null);
    if (editorId === deleteTarget.id) setEditorId(null);
    push("Media asset deleted.", "success");
    await load();
  };

  const copyUrl = async (asset: GalleryImage) => {
    if (!asset.public_url) {
      push("This asset has no public URL.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(asset.public_url);
      push("Public URL copied.", "success");
    } catch {
      push("Unable to copy. Select the URL manually.", "error");
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="All assets"
        title="Media Library"
        description="Every uploaded asset, including drafts. Reuse images across projects and check usage before deleting."
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
              Add media
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
              placeholder="Search assets…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              aria-label="Search media assets"
            />
          </div>
          <select
            className="admin-select admin-select--compact"
            value={formatFilter}
            onChange={(event) => {
              setFormatFilter(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            aria-label="Filter by format"
          >
            <option value="all">All formats</option>
            {formats.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            className="admin-select admin-select--compact"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            className="admin-select admin-select--compact"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            aria-label="Sort assets"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
            <option value="size">Largest first</option>
          </select>
        </div>
        <div className="admin-toolbar__group">
          <span className="admin-toolbar__count">
            {filtered.length} of {assets.length} assets
          </span>
          <div className="admin-toolbar__group" role="group" aria-label="View">
            <button
              type="button"
              className={`admin-icon-button admin-icon-button--surface${
                view === "grid" ? " is-published" : ""
              }`}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <GridIcon width={16} height={16} />
            </button>
            <button
              type="button"
              className={`admin-icon-button admin-icon-button--surface${
                view === "list" ? " is-published" : ""
              }`}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <ListIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Loading media…" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={<ImageIcon width={34} height={34} aria-hidden="true" />}
          title={assets.length === 0 ? "No media yet" : "No assets match"}
          text={
            assets.length === 0
              ? "Upload images to build a reusable media library."
              : "Try a different search term or filter."
          }
          action={
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={() => setUploadOpen(true)}
            >
              <UploadIcon width={16} height={16} />
              Add media
            </button>
          }
        />
      ) : view === "grid" ? (
        <>
          <div className="admin-gallery-grid" aria-label="Media assets">
            {visible.map((asset) => {
              const usage = usageMap[asset.id] ?? [];
              return (
                <article className="admin-gallery-card" key={asset.id}>
                  <div className="admin-gallery-card__media">
                    {asset.public_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                      <img
                        src={asset.public_url}
                        alt={asset.alt_text}
                        className="admin-gallery-card__image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span className="admin-gallery-card__status">
                      <AdminBadge
                        tone={asset.is_published ? "published" : "draft"}
                      >
                        {asset.is_published ? "Published" : "Draft"}
                      </AdminBadge>
                    </span>
                  </div>
                  <div className="admin-gallery-card__info">
                    <h3 className="admin-gallery-card__title">{asset.title}</h3>
                    <div className="admin-gallery-card__meta">
                      <span>{asset.format?.toUpperCase() ?? "IMAGE"}</span>
                      <span>{formatBytes(asset.file_size_bytes)}</span>
                      <span>
                        {usage.length > 0
                          ? `Used in ${usage.length}`
                          : "Unused"}
                      </span>
                    </div>
                    <div className="admin-gallery-card__actions admin-gallery-card__actions--info">
                      <button
                        type="button"
                        className="admin-icon-button admin-icon-button--surface"
                        onClick={() => setEditorId(asset.id)}
                        aria-label={`Edit ${asset.title}`}
                        title="Edit metadata"
                      >
                        <EditIcon width={15} height={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button admin-icon-button--surface"
                        onClick={() => void copyUrl(asset)}
                        aria-label={`Copy URL for ${asset.title}`}
                        title="Copy image URL"
                      >
                        <LinkIcon width={15} height={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button admin-icon-button--surface is-danger"
                        onClick={() => requestDelete(asset)}
                        aria-label={`Delete ${asset.title}`}
                        title="Delete"
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {visible.length < filtered.length ? (
            <div className="admin-load-more">
              <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Asset</th>
                <th scope="col">Format</th>
                <th scope="col">Dimensions</th>
                <th scope="col">Size</th>
                <th scope="col">Status</th>
                <th scope="col">Usage</th>
                <th scope="col">Uploaded</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((asset) => {
                const usage = usageMap[asset.id] ?? [];
                return (
                  <tr key={asset.id}>
                    <td>
                      <div className="admin-table__title">
                        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                          <span className="admin-table__thumb">
                            {asset.public_url ? (
                              // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                              <img src={asset.public_url} alt="" loading="lazy" />
                            ) : null}
                          </span>
                          <span>
                            <strong>{asset.title}</strong>
                            <span>{asset.storage_path}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{asset.format?.toUpperCase() ?? "—"}</td>
                    <td>
                      {asset.width && asset.height
                        ? `${asset.width}×${asset.height}`
                        : "—"}
                    </td>
                    <td>{formatBytes(asset.file_size_bytes)}</td>
                    <td>
                      <AdminBadge
                        tone={asset.is_published ? "published" : "draft"}
                      >
                        {asset.is_published ? "Published" : "Draft"}
                      </AdminBadge>
                    </td>
                    <td>
                      {usage.length > 0
                        ? `${usage.length} project${usage.length === 1 ? "" : "s"}`
                        : "Unused"}
                    </td>
                    <td>{formatDate(asset.created_at)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-icon-button admin-icon-button--surface"
                          onClick={() => setEditorId(asset.id)}
                          aria-label={`Edit ${asset.title}`}
                        >
                          <EditIcon width={15} height={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button admin-icon-button--surface"
                          onClick={() => void copyUrl(asset)}
                          aria-label={`Copy URL for ${asset.title}`}
                        >
                          <LinkIcon width={15} height={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button admin-icon-button--surface is-danger"
                          onClick={() => requestDelete(asset)}
                          aria-label={`Delete ${asset.title}`}
                        >
                          <TrashIcon width={15} height={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

      {editorAsset ? (
        <GalleryEditor
          key={editorAsset.id}
          image={editorAsset}
          collections={collections}
          usage={usageMap[editorAsset.id] ?? []}
          onClose={() => setEditorId(null)}
          onSaved={() => {
            setEditorId(null);
            push("Asset details saved.", "success");
            void load();
          }}
          onDelete={() => {
            setEditorId(null);
            requestDelete(editorAsset);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete media asset"
        description={
          deleteTarget ? (
            <p className="admin-confirm-text">
              Delete <strong>{deleteTarget.title}</strong>? The database record
              and stored file will be removed. This cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
