"use client";

import { useMemo, useState } from "react";
import { ImageIcon, SearchIcon } from "@/components/ui/icons";
import type { GalleryImage } from "@/lib/admin/types";

interface MediaPickerProps {
  assets: GalleryImage[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  multiple?: boolean;
  label?: string;
  emptyText?: string;
}

export function MediaPicker({
  assets,
  selectedIds,
  onToggle,
  multiple = false,
  label = "Select an image",
  emptyText = "No media available yet. Upload images in the Gallery first.",
}: MediaPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return assets;
    return assets.filter(
      (asset) =>
        asset.title.toLowerCase().includes(value) ||
        asset.storage_path.toLowerCase().includes(value)
    );
  }, [assets, query]);

  const selected = assets.filter((asset) => selectedIds.includes(asset.id));

  return (
    <div className="admin-media-picker">
      <div className="admin-media-picker__toolbar">
        <div className="admin-search" style={{ flex: "1 1 auto" }}>
          <SearchIcon
            width={16}
            height={16}
            className="admin-search__icon"
            aria-hidden="true"
          />
          <input
            type="search"
            className="admin-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search media…"
            aria-label={`Search media for ${label}`}
          />
        </div>
        <span className="admin-toolbar__count">
          {selectedIds.length} selected
        </span>
      </div>

      <div
        className="admin-media-picker__grid"
        role="group"
        aria-label={label}
      >
        {filtered.length === 0 ? (
          <p className="admin-media-picker__empty">{emptyText}</p>
        ) : (
          filtered.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                className={`admin-media-picker__item${
                  isSelected ? " is-selected" : ""
                }`}
                onClick={() => onToggle(asset.id)}
                aria-pressed={isSelected}
                title={asset.title}
              >
                <span className="admin-media-picker__thumb">
                  {asset.public_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                    <img src={asset.public_url} alt="" loading="lazy" />
                  ) : (
                    <ImageIcon width={22} height={22} aria-hidden="true" />
                  )}
                </span>
                <span className="admin-media-picker__name">{asset.title}</span>
              </button>
            );
          })
        )}
      </div>

      {selected.length > 0 ? (
        <div className="admin-media-picker__selected">
          {multiple ? (
            <span className="admin-upload-meta">
              {selected.map((asset) => asset.title).join(", ")}
            </span>
          ) : (
            <>
              {selected[0].public_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, unoptimized in static export
                <img src={selected[0].public_url} alt="" />
              ) : null}
              <span className="admin-upload-meta">{selected[0].title}</span>
              <button
                type="button"
                className="admin-button admin-button--ghost admin-button--small"
                onClick={() => onToggle(selected[0].id)}
                style={{ marginLeft: "auto" }}
              >
                Clear
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
