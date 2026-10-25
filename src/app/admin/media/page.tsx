"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PlusIcon, SearchIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";

interface MediaAsset {
  id: string;
  storage_path: string;
  public_url: string;
  title: string;
  alt_text: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  file_size_bytes?: number | null;
  created_at: string;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: err } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setAssets(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load media assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: err } = await supabase
          .from("gallery_images")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        if (!ignore) setAssets(data ?? []);
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load media assets");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredAssets = assets.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.storage_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, storagePath: string) => {
    if (!window.confirm("Delete this media asset?")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.storage.from("portfolio-media").remove([storagePath]);
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchAssets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setError("Unable to copy. Select and copy manually.");
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="admin-media-library">
      <div className="admin-page-header">
        <div className="admin-header-content">
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-subtitle">Browse and reuse your uploaded assets.</p>
        </div>
        <Link href="/admin/gallery" className="button button--primary">
          <PlusIcon width={16} height={16} />
          Upload New
        </Link>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert">{error}</div>
      )}
      {notice && (
        <div className="admin-notice-banner" role="status">{notice}</div>
      )}

      <div className="admin-media-search">
        <SearchIcon width={18} height={18} style={{ color: "var(--muted)", marginRight: "0.75rem" }} />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ paddingLeft: "2.5rem", width: "300px" }}
        />
      </div>

      <div className="admin-media-grid" role="grid" aria-label="Media assets">
        {loading && (
          <div className="admin-loading">Loading media...</div>
        )}
        {!loading && filteredAssets.length === 0 && (
          <div className="admin-empty-state">
            <ImageIcon width={48} height={48} style={{ color: "var(--muted)" }} />
            <p>No media assets found</p>
          </div>
        )}
        {!loading && filteredAssets.map((asset) => (
          <div key={asset.id} className="admin-media-item">
            <div className="admin-media-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, images are unoptimized in this static export */}
              <img src={asset.public_url} alt={asset.alt_text} className="admin-media-image" loading="lazy" />
            </div>
            <div className="admin-media-info">
              <h4 className="admin-media-title">{asset.title}</h4>
              <div className="admin-media-meta">
                <span>{asset.width}×{asset.height}</span>
                <span>{asset.format?.toUpperCase()}</span>
                <span>{formatFileSize(asset.file_size_bytes)}</span>
              </div>
              <p className="admin-media-path" title={asset.storage_path}>{asset.storage_path}</p>
            </div>
            <div className="admin-media-actions">
              <button
                type="button"
                onClick={() => handleCopy(asset.public_url, "Image URL")}
                className="admin-link-btn"
                title="Copy public URL"
              >
                URL
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `![${asset.alt_text}](${asset.public_url})`,
                    "Markdown image"
                  )
                }
                className="admin-link-btn"
                title="Copy Markdown"
              >
                MD
              </button>
              <button onClick={() => handleDelete(asset.id, asset.storage_path)} className="admin-delete-btn" title="Delete">
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}