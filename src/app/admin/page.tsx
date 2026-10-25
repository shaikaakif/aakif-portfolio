"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  FolderIcon,
  ImageIcon,
  FileTextIcon,
  TrendingUpIcon,
  PlusIcon,
  SettingsIcon,
} from "@/components/ui/icons";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  trend?: string;
}

function MetricCard({ title, value, icon, href, description, trend }: MetricCardProps) {
  return (
    <Link href={href} className="admin-metric-card" style={{ textDecoration: "none" }}>
      <div className="admin-metric-icon" aria-hidden="true">{icon}</div>
      <div className="admin-metric-content">
        <p className="admin-metric-title">{title}</p>
        <p className="admin-metric-value">{value}</p>
        {description && <p className="admin-metric-desc">{description}</p>}
        {trend && <p className="admin-metric-trend">{trend}</p>}
      </div>
      <ArrowUpRight width={20} height={20} className="admin-metric-arrow" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    projectsPublished: 0,
    projectsDraft: 0,
    galleryImages: 0,
    galleryPublished: 0,
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchMetrics = async () => {
      try {
        const [{ count: projectsPublished }, { count: projectsDraft }, { count: galleryImages }, { count: galleryPublished }] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).not("published_at", "is", null),
          supabase.from("projects").select("*", { count: "exact", head: true }).is("published_at", null),
          supabase.from("gallery_images").select("*", { count: "exact", head: true }),
          supabase.from("gallery_images").select("*", { count: "exact", head: true }).eq("is_published", true),
        ]);

        setMetrics({
          projectsPublished: projectsPublished || 0,
          projectsDraft: projectsDraft || 0,
          galleryImages: galleryImages || 0,
          galleryPublished: galleryPublished || 0,
        });
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-subtitle">Welcome back. Here&apos;s what&apos;s happening with your portfolio.</p>
        </div>
        <div className="admin-dashboard-actions">
          <Link href="/admin/projects/new" className="button button--primary">
            <PlusIcon width={16} height={16} />
            New Project
          </Link>
          <Link href="/admin/gallery/upload" className="button button--ghost">
            <ImageIcon width={16} height={16} />
            Upload Images
          </Link>
        </div>
      </div>

      <div className="admin-metrics-grid" role="list" aria-label="Portfolio metrics">
        <MetricCard
          title="Published Projects"
          value={metrics.projectsPublished}
          icon={<FolderIcon width={24} height={24} />}
          href="/admin/projects"
          description={metrics.projectsDraft > 0 ? `${metrics.projectsDraft} draft${metrics.projectsDraft !== 1 ? "s" : ""} in progress` : "All projects published"}
        />
        <MetricCard
          title="Gallery Images"
          value={metrics.galleryImages}
          icon={<ImageIcon width={24} height={24} />}
          href="/admin/gallery"
          description={metrics.galleryPublished > 0 ? `${metrics.galleryPublished} published` : "No images published yet"}
        />
        <MetricCard
          title="Draft Projects"
          value={metrics.projectsDraft}
          icon={<FileTextIcon width={24} height={24} />}
          href="/admin/projects?status=draft"
          description="Works in progress"
        />
        <MetricCard
          title="Published Gallery"
          value={metrics.galleryPublished}
          icon={<TrendingUpIcon width={24} height={24} />}
          href="/admin/gallery?status=published"
          description="Live on your portfolio"
        />
      </div>

      <div className="admin-quick-links" role="list" aria-label="Quick actions">
        <Link href="/admin/projects" className="admin-quick-link">
          <FolderIcon width={24} height={24} />
          <span>Manage Projects</span>
          <ArrowUpRight width={16} height={16} />
        </Link>
        <Link href="/admin/gallery" className="admin-quick-link">
          <ImageIcon width={24} height={24} />
          <span>Manage Gallery</span>
          <ArrowUpRight width={16} height={16} />
        </Link>
        <Link href="/admin/media" className="admin-quick-link">
          <FileTextIcon width={24} height={24} />
          <span>Media Library</span>
          <ArrowUpRight width={16} height={16} />
        </Link>
        <Link href="/admin/settings" className="admin-quick-link">
          <SettingsIcon width={24} height={24} />
          <span>Site Settings</span>
          <ArrowUpRight width={16} height={16} />
        </Link>
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 100%;
        }

        .admin-dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .admin-dashboard-title {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem;
        }

        .admin-dashboard-subtitle {
          color: var(--ink-soft);
          font-size: 1rem;
          margin: 0;
        }

        .admin-dashboard-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .admin-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .admin-metric-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background: var(--paper-soft);
          color: var(--ink);
          transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
        }

        .admin-metric-card:hover {
          border-color: var(--line-strong);
          box-shadow: var(--shadow-card);
          transform: translateY(-1px);
        }

        .admin-metric-icon {
          display: grid;
          place-items: center;
          width: 3rem;
          height: 3rem;
          border-radius: var(--radius-md);
          background: var(--accent-soft);
          color: var(--accent);
        }

        .admin-metric-content {
          display: grid;
          gap: 0.25rem;
          min-width: 0;
        }

        .admin-metric-title {
          margin: 0;
          color: var(--muted);
          font-family: var(--font-jetbrains), ui-monospace, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-metric-value {
          margin: 0;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 500;
          line-height: 1.1;
          font-family: var(--font-outfit), sans-serif;
        }

        .admin-metric-desc {
          margin: 0;
          color: var(--ink-soft);
          font-size: 0.8rem;
        }

        .admin-metric-trend {
          margin: 0;
          color: var(--success);
          font-size: 0.75rem;
          font-family: var(--font-jetbrains), ui-monospace, monospace;
        }

        .admin-metric-arrow {
          color: var(--muted);
          transition: transform 150ms ease, color 150ms ease;
        }

        .admin-metric-card:hover .admin-metric-arrow {
          transform: translate(2px, -2px);
          color: var(--accent);
        }

        .admin-quick-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .admin-quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background: var(--paper-soft);
          color: var(--ink);
          text-decoration: none;
          text-align: center;
          transition: all 150ms ease;
        }

        .admin-quick-link:hover {
          border-color: var(--line-strong);
          background: var(--paper);
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
        }

        .admin-quick-link svg {
          color: var(--muted);
          transition: color 150ms ease;
        }

        .admin-quick-link:hover svg {
          color: var(--accent);
        }

        .admin-quick-link span {
          font-weight: 500;
          font-size: 0.95rem;
        }

        @media (max-width: 48rem) {
          .admin-dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }
          .admin-dashboard-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}