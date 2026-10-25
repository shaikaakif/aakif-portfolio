"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

interface PublicImage {
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

interface PublicCollection {
  id: string;
  name: string;
}

export function PublicGallery() {
  const [images, setImages] = useState<PublicImage[]>([]);
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const [{ data: imageData }, { data: collectionData }] = await Promise.all([
          supabase
            .from("gallery_images")
            .select("id,public_url,title,alt_text,caption,categories,collection_id,width,height")
            .eq("is_published", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
          supabase
            .from("gallery_collections")
            .select("id,name")
            .eq("is_published", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
        ]);

        if (!ignore) {
          setImages(imageData ?? []);
          setCollections(collectionData ?? []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Failed to load gallery:", err);
          setImages([]);
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

  if (loading) {
    return (
      <div className="gallery-empty" role="status">
        <p>Loading gallery…</p>
      </div>
    );
  }

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
          <div className="gallery-lightbox__caption">
            <h3>{activeImage.title}</h3>
            {activeImage.caption && <p>{activeImage.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}