"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EditIcon,
  FolderIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
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
import { ProjectFormModal } from "@/components/admin/ProjectFormModal";
import { formatDate } from "@/lib/admin/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GalleryImage,
  ProjectRecord,
} from "@/lib/admin/types";

type SortMode = "manual" | "newest" | "title";

function ProjectManager() {
  const searchParams = useSearchParams();
  const { push } = useAdminToast();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [assets, setAssets] = useState<GalleryImage[]>([]);
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
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "1");
  const [editingId, setEditingId] = useState<string | null>(
    searchParams.get("edit")
  );
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const assetMap = useMemo(() => {
    const map = new Map<string, GalleryImage>();
    for (const asset of assets) map.set(asset.id, asset);
    return map;
  }, [assets]);

  const load = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const [projectsResult, assetsResult] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("updated_at", { ascending: false }),
        supabase
          .from("gallery_images")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const firstError = projectsResult.error ?? assetsResult.error;
      if (firstError) throw firstError;

      setProjects((projectsResult.data as ProjectRecord[]) ?? []);
      setAssets((assetsResult.data as GalleryImage[]) ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load projects."
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
    const result = projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.tagline.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && project.published_at !== null) ||
        (statusFilter === "draft" && project.published_at === null);
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && project.featured) ||
        (featuredFilter === "standard" && !project.featured);
      return matchesSearch && matchesStatus && matchesFeatured;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "newest") {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }
      if (sortMode === "title") {
        return a.title.localeCompare(b.title);
      }
      return (
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        a.title.localeCompare(b.title)
      );
    });
  }, [projects, search, statusFilter, featuredFilter, sortMode]);

  const editingProject = editingId
    ? projects.find((project) => project.id === editingId) ?? null
    : null;

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (project: ProjectRecord) => {
    setEditingId(project.id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const togglePublish = async (project: ProjectRecord) => {
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        published_at: project.published_at ? null : new Date().toISOString(),
      })
      .eq("id", project.id);

    if (updateError) {
      push(updateError.message, "error");
      return;
    }
    push(
      project.published_at ? "Project unpublished." : "Project published.",
      "success"
    );
    await load();
  };

  const toggleFeatured = async (project: ProjectRecord) => {
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("projects")
      .update({ featured: !project.featured })
      .eq("id", project.id);

    if (updateError) {
      push(updateError.message, "error");
      return;
    }
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);

    if (deleteError) {
      push(deleteError.message, "error");
      return;
    }

    setDeleteTarget(null);
    if (editingId === deleteTarget.id) closeForm();
    push("Project deleted.", "success");
    await load();
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Work index"
        title="Projects"
        description="Published projects replace the static portfolio content after the next build. Drafts stay private."
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
              onClick={openCreate}
            >
              <PlusIcon width={16} height={16} />
              New project
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
              placeholder="Search projects…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>
          <select
            className="admin-select admin-select--compact"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            className="admin-select admin-select--compact"
            value={featuredFilter}
            onChange={(event) => setFeaturedFilter(event.target.value)}
            aria-label="Filter by featured"
          >
            <option value="all">All projects</option>
            <option value="featured">Featured</option>
            <option value="standard">Not featured</option>
          </select>
          <select
            className="admin-select admin-select--compact"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            aria-label="Sort projects"
          >
            <option value="manual">Manual order</option>
            <option value="newest">Recently updated</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <span className="admin-toolbar__count">
          {filtered.length} of {projects.length} projects
        </span>
      </div>

      {loading ? (
        <AdminLoading label="Loading projects…" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={<FolderIcon width={34} height={34} aria-hidden="true" />}
          title={projects.length === 0 ? "No projects yet" : "No projects match"}
          text={
            projects.length === 0
              ? "Create your first project to start replacing the static work index."
              : "Try a different search term or filter."
          }
          action={
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={openCreate}
            >
              <PlusIcon width={16} height={16} />
              New project
            </button>
          }
        />
      ) : (
        <div className="admin-project-list" aria-label="Projects">
          {filtered.map((project) => {
            const cover = project.cover_image_id
              ? assetMap.get(project.cover_image_id)
              : null;
            return (
              <article className="admin-project-row" key={project.id}>
                <div className="admin-project-main">
                  <div className="admin-project-cover" aria-hidden="true">
                    {cover?.public_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                      <img src={cover.public_url} alt="" loading="lazy" />
                    ) : (
                      project.code || project.title.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="admin-project-info">
                    <h3 className="admin-project-title">{project.title}</h3>
                    <p className="admin-project-tagline">{project.tagline}</p>
                    <div className="admin-project-meta">
                      <AdminBadge
                        tone={project.published_at ? "published" : "draft"}
                      >
                        {project.published_at ? "Published" : "Draft"}
                      </AdminBadge>
                      {project.featured ? (
                        <AdminBadge tone="featured">Featured</AdminBadge>
                      ) : null}
                      <span className="admin-project-meta admin-toolbar__count">
                        {project.category} · /{project.slug}/ · Updated{" "}
                        {formatDate(project.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="admin-project-actions">
                  <button
                    type="button"
                    className={`admin-icon-button admin-icon-button--surface${
                      project.featured ? " is-published" : ""
                    }`}
                    onClick={() => void toggleFeatured(project)}
                    aria-label={
                      project.featured
                        ? `Remove ${project.title} from featured`
                        : `Feature ${project.title}`
                    }
                    title={project.featured ? "Unfeature" : "Feature"}
                  >
                    <StarIcon width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button admin-icon-button--surface"
                    onClick={() => void togglePublish(project)}
                    aria-label={
                      project.published_at
                        ? `Unpublish ${project.title}`
                        : `Publish ${project.title}`
                    }
                    title={project.published_at ? "Unpublish" : "Publish"}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "0.55rem",
                        height: "0.55rem",
                        borderRadius: "50%",
                        background: project.published_at
                          ? "var(--success)"
                          : "var(--line-strong)",
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button admin-icon-button--surface"
                    onClick={() => openEdit(project)}
                    aria-label={`Edit ${project.title}`}
                    title="Edit"
                  >
                    <EditIcon width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button admin-icon-button--surface is-danger"
                    onClick={() => setDeleteTarget(project)}
                    aria-label={`Delete ${project.title}`}
                    title="Delete"
                  >
                    <TrashIcon width={15} height={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formOpen && (!editingId || editingProject) ? (
        <ProjectFormModal
          key={editingProject?.id ?? "new"}
          project={editingProject}
          assets={assets}
          onClose={closeForm}
          onSaved={() => {
            push(
              editingProject ? "Project saved." : "Project created.",
              "success"
            );
            void load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project"
        description={
          deleteTarget ? (
            <p className="admin-confirm-text">
              Delete <strong>{deleteTarget.title}</strong>? The project record
              will be removed. Media assets are kept in the library.
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

export default function ProjectsPage() {
  return (
    <Suspense fallback={<AdminLoading label="Loading projects…" />}>
      <ProjectManager />
    </Suspense>
  );
}
