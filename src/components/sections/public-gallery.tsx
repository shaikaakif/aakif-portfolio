"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

export interface PublicImage {
  id: string;
  public_url: string;
  title: string;
  alt_text: string;
  caption?: string | null;
  categories: string[];
  collection_id?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface PublicCollection {
  id: string;
  name: string;
}

interface PublicGalleryProps {
  initialImages: PublicImage[];
  initialCollections: PublicCollection[];
}

export function PublicGallery({
  initialImages,
  initialCollections,
}: PublicGalleryProps) {
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = initialImages;
  const collections = initialCollections;

  const visibleImages =
    activeCollection === "all"
      ? images
      : images.filter((image) => image.collection_id === activeCollection);

  const openLightbox = (id: string) => {
    const index = visibleImages.findIndex((image) => image.id === id);
    if (index >= 0) setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        const next = current + direction;
        if (next < 0 || next >= visibleImages.length) return current;
        return next;
      });
    },
    [visibleImages.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, closeLightbox, step]);

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <div>
          <p>The gallery is being curated.</p>
          <p className="gallery-empty__hint">
            New photographs and project shots will appear here soon.
          </p>
        </div>
      </div>
    );
  }

  const activeImage = lightboxIndex !== null ? visibleImages[lightboxIndex] : null;

  return (
    <div className="gallery">
      {collections.length > 0 && (
        <div className="gallery-filters" role="group" aria-label="Filter gallery">
          <button
            type="button"
            className={`role-pill gallery-filter ${activeCollection === "all" ? "is-active" : ""}`}
            aria-pressed={activeCollection === "all"}
            onClick={() => setActiveCollection("all")}
          >
            All
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              className={`role-pill gallery-filter ${activeCollection === collection.id ? "is-active" : ""}`}
              aria-pressed={activeCollection === collection.id}
              onClick={() => setActiveCollection(collection.id)}
            >
              {collection.name}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-grid" role="list" aria-label="Gallery images">
        {visibleImages.map((image) => (
          <button
            key={image.id}
            type="button"
            className="gallery-item"
            onClick={() => openLightbox(image.id)}
            aria-label={`Open ${image.title}`}
            role="listitem"
          >
            <div className="gallery-item__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, images are unoptimized in this static export */}
              <img
                src={image.public_url}
                alt={image.alt_text}
                className="gallery-item__image"
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="gallery-item__overlay">
              <div className="gallery-item__caption">
                <h3>{image.title}</h3>
                {image.caption && <p>{image.caption}</p>}
                {image.categories.length > 0 && (
                  <span className="gallery-item__meta">
                    {image.categories.join(" / ")}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeImage && lightboxIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            disabled={lightboxIndex === 0}
            aria-label="Previous image"
          >
            <ChevronLeftIcon width={22} height={22} />
          </button>
          <div className="gallery-lightbox__content" onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, images are unoptimized in this static export */}
            <img
              src={activeImage.public_url}
              alt={activeImage.alt_text}
              className="gallery-lightbox__image"
            />
          </div>
          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            disabled={lightboxIndex === visibleImages.length - 1}
            aria-label="Next image"
          >
            <ChevronRightIcon width={22} height={22} />
          </button>
          <div
            className="gallery-lightbox__caption"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{activeImage.title}</h3>
            {activeImage.caption && <p>{activeImage.caption}</p>}
            <Link
              href={`/gallery/${activeImage.id}/`}
              className="gallery-lightbox__meta"
              style={{ textDecoration: "underline" }}
            >
              View image details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
