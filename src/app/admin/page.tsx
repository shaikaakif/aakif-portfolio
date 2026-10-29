"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FolderIcon,
  ImageIcon,
  ImagePlusIcon,
  LayoutDashboardIcon,
  RefreshIcon,
  SettingsIcon,
  UploadIcon,
} from "@/components/ui/icons";
import {
  AdminAlert,
  AdminBadge,
  AdminLoading,
  AdminPageHeader,
} from "@/components/admin/ui/AdminUi";
import { formatDate } from "@/lib/admin/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface RecentProject {
  id: string;
  title: string;
  published_at: string | null;
  updated_at: string;
}

interface RecentImage {
  id: string;
  title: string;
  public_url: string | null;
  is_published: boolean;
  created_at: string;
}

interface Metrics {
  projectsTotal: number;
  projectsPublished: number;
  projectsDraft: number;
  imagesTotal: number;
  imagesPublished: number;
  imagesDraft: number;
}

const EMPTY_METRICS: Metrics = {
  projectsTotal: 0,
  projectsPublished: 0,
  projectsDraft: 0,
  imagesTotal: 0,
  imagesPublished: 0,
  imagesDraft: 0,
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const [
        projectsResult,
        imagesResult,
        projectsTotal,
        projectsPublished,
        imagesTotal,
        imagesPublished,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("id,title,published_at,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("gallery_images")
          .select("id,title,public_url,is_published,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .not("published_at", "is", null),
        supabase
          .from("gallery_images")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("gallery_images")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true),
      ]);

      const firstError =
        projectsResult.error ??
        imagesResult.error ??
        projectsTotal.error ??
        projectsPublished.error ??
        imagesTotal.error ??
        imagesPublished.error;

      if (firstError) throw firstError;

      const totalProjects = projectsTotal.count ?? 0;
      const publishedProjects = projectsPublished.count ?? 0;
      const totalImages = imagesTotal.count ?? 0;
      const publishedImages = imagesPublished.count ?? 0;

      setMetrics({
        projectsTotal: totalProjects,
        projectsPublished: publishedProjects,
        projectsDraft: Math.max(totalProjects - publishedProjects, 0),
        imagesTotal: totalImages,
        imagesPublished: publishedImages,
        imagesDraft: Math.max(totalImages - publishedImages, 0),
      });
      setRecentProjects((projectsResult.data as RecentProject[]) ?? []);
      setRecentImages((imagesResult.data as RecentImage[]) ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch resolves asynchronously
    void load();
  }, [load]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Studio overview"
        title="Dashboard"
        description="A live view of what is in the studio, what is published, and what needs attention."
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
            <Link
              href="/admin/projects?create=1"
              className="admin-button admin-button--primary"
            >
              <FolderIcon width={16} height={16} />
              New project
            </Link>
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

      {loading ? (
        <AdminLoading label="Loading studio overview…" />
      ) : (
        <>
          <div className="admin-metrics" role="list" aria-label="Studio metrics">
            <Link href="/admin/projects" className="admin-metric" role="listitem">
              <div className="admin-metric__head">
                <span className="admin-metric__icon" aria-hidden="true">
                  <FolderIcon width={18} height={18} />
                </span>
                <ArrowUpRight width={16} height={16} aria-hidden="true" />
              </div>
              <p className="admin-metric__label">Projects</p>
              <p className="admin-metric__value">{metrics.projectsTotal}</p>
              <p className="admin-metric__note">
                {metrics.projectsPublished} published · {metrics.projectsDraft}{" "}
                draft
              </p>
            </Link>

            <Link
              href="/admin/projects?status=published"
              className="admin-metric"
              role="listitem"
            >
              <div className="admin-metric__head">
                <span className="admin-metric__icon" aria-hidden="true">
                  <LayoutDashboardIcon width={18} height={18} />
                </span>
                <ArrowUpRight width={16} height={16} aria-hidden="true" />
              </div>
              <p className="admin-metric__label">Published projects</p>
              <p className="admin-metric__value">{metrics.projectsPublished}</p>
              <p className="admin-metric__note">Visible in the public work index</p>
            </Link>

            <Link href="/admin/gallery" className="admin-metric" role="listitem">
              <div className="admin-metric__head">
                <span className="admin-metric__icon" aria-hidden="true">
                  <ImageIcon width={18} height={18} />
                </span>
                <ArrowUpRight width={16} height={16} aria-hidden="true" />
              </div>
              <p className="admin-metric__label">Gallery images</p>
              <p className="admin-metric__value">{metrics.imagesTotal}</p>
              <p className="admin-metric__note">
                {metrics.imagesPublished} published · {metrics.imagesDraft} draft
              </p>
            </Link>

            <Link
              href="/admin/gallery?status=published"
              className="admin-metric"
              role="listitem"
            >
              <div className="admin-metric__head">
                <span className="admin-metric__icon" aria-hidden="true">
                  <ImagePlusIcon width={18} height={18} />
                </span>
                <ArrowUpRight width={16} height={16} aria-hidden="true" />
              </div>
              <p className="admin-metric__label">Published gallery</p>
              <p className="admin-metric__value">{metrics.imagesPublished}</p>
              <p className="admin-metric__note">Live on the public gallery</p>
            </Link>
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-card" aria-labelledby="recent-images-title">
              <div className="admin-card__head">
                <h2 className="admin-card__title" id="recent-images-title">
                  Recent uploads
                </h2>
                <Link
                  href="/admin/gallery"
                  className="admin-button admin-button--ghost admin-button--small"
                >
                  View gallery
                </Link>
              </div>
              {recentImages.length === 0 ? (
                <p className="admin-empty__text">
                  No images yet. Upload your first image to start the gallery.
                </p>
              ) : (
                <ul className="admin-recent-list">
                  {recentImages.map((image) => (
                    <li key={image.id}>
                      <Link
                        href={`/admin/gallery?image=${image.id}`}
                        className="admin-recent"
                      >
                        <span className="admin-recent__thumb">
                          {image.public_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                            <img src={image.public_url} alt="" loading="lazy" />
                          ) : null}
                        </span>
                        <span className="admin-recent__body">
                          <span className="admin-recent__title">
                            {image.title}
                          </span>
                          <span className="admin-recent__meta">
                            {formatDate(image.created_at)}
                          </span>
                        </span>
                        <AdminBadge
                          tone={image.is_published ? "published" : "draft"}
                        >
                          {image.is_published ? "Published" : "Draft"}
                        </AdminBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-card" aria-labelledby="recent-projects-title">
              <div className="admin-card__head">
                <h2 className="admin-card__title" id="recent-projects-title">
                  Recently updated projects
                </h2>
                <Link
                  href="/admin/projects"
                  className="admin-button admin-button--ghost admin-button--small"
                >
                  View projects
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <p className="admin-empty__text">
                  No projects yet. Create one to build the public work index.
                </p>
              ) : (
                <ul className="admin-recent-list">
                  {recentProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/admin/projects?edit=${project.id}`}
                        className="admin-recent"
                      >
                        <span className="admin-recent__thumb" aria-hidden="true">
                          <span className="admin-recent__meta">AS</span>
                        </span>
                        <span className="admin-recent__body">
                          <span className="admin-recent__title">
                            {project.title}
                          </span>
                          <span className="admin-recent__meta">
                            Updated {formatDate(project.updated_at)}
                          </span>
                        </span>
                        <AdminBadge
                          tone={project.published_at ? "published" : "draft"}
                        >
                          {project.published_at ? "Published" : "Draft"}
                        </AdminBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="admin-card" aria-labelledby="quick-actions-title">
            <div className="admin-card__head">
              <h2 className="admin-card__title" id="quick-actions-title">
                Quick actions
              </h2>
              <span className="admin-card__meta">Studio shortcuts</span>
            </div>
            <div className="admin-quick-actions">
              <Link
                href="/admin/projects?create=1"
                className="admin-quick-action"
              >
                <FolderIcon width={20} height={20} aria-hidden="true" />
                <span>New project</span>
              </Link>
              <Link
                href="/admin/gallery?upload=1"
                className="admin-quick-action"
              >
                <UploadIcon width={20} height={20} aria-hidden="true" />
                <span>Upload images</span>
              </Link>
              <Link href="/admin/media" className="admin-quick-action">
                <ImageIcon width={20} height={20} aria-hidden="true" />
                <span>Media library</span>
              </Link>
              <Link href="/admin/settings" className="admin-quick-action">
                <SettingsIcon width={20} height={20} aria-hidden="true" />
                <span>Site settings</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
