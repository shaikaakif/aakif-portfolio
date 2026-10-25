"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryImage } from "@/content/gallery";

interface GalleryProps {
  images: GalleryImage[];
  category?: string;
}

export function Gallery({ images, category }: GalleryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredImages = category
    ? images.filter((img) => img.category === category)
    : images;

  if (filteredImages.length === 0) {
    return (
      <div className="gallery-empty" role="status">
        <p>No images in this collection yet.</p>
        {category && <p className="gallery-empty__hint">Add images to the <code>{category}</code> category to get started.</p>}
      </div>
    );
  }

  return (
    <div className="gallery" role="list" aria-label={category ? `${category} gallery` : "Image gallery"}>
      <div className="gallery-grid">
        {filteredImages.map((image, index) => (
          <figure
            key={image.src}
            className="gallery-item"
            role="listitem"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedIndex(expandedIndex === index ? null : index);
              }
            }}
            tabIndex={0}
            aria-label={`View ${image.title}${image.caption ? `: ${image.caption}` : ""}`}
          >
            <div className="gallery-item__image-wrap">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                className="gallery-item__image"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
              {expandedIndex === index && (
                <div className="gallery-item__overlay">
                  <figcaption className="gallery-item__caption">
                    <h3>{image.title}</h3>
                    {image.caption && <p>{image.caption}</p>}
                    <span className="gallery-item__meta">
                      {image.category}
                      {image.date && ` · ${image.date}`}
                    </span>
                  </figcaption>
                </div>
              )}
            </div>
          </figure>
        ))}
      </div>

      {expandedIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${filteredImages[expandedIndex].title} - full view`}
          onClick={() => setExpandedIndex(null)}
        >
          <button
            className="gallery-lightbox__close"
            onClick={(e) => { e.stopPropagation(); setExpandedIndex(null); }}
            aria-label="Close full view"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); setExpandedIndex((expandedIndex! - 1 + filteredImages.length) % filteredImages.length); }}
            aria-label="Previous image"
            disabled={filteredImages.length <= 1}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 12H4M10 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="gallery-lightbox__content">
            <Image
              src={filteredImages[expandedIndex].src}
              alt={filteredImages[expandedIndex].alt}
              fill
              priority
              sizes="100vw"
              className="gallery-lightbox__image"
              style={{ objectFit: "contain" }}
            />
          </div>
          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); setExpandedIndex((expandedIndex! + 1) % filteredImages.length); }}
            aria-label="Next image"
            disabled={filteredImages.length <= 1}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
          <figcaption className="gallery-lightbox__caption">
            <h3>{filteredImages[expandedIndex].title}</h3>
            {filteredImages[expandedIndex].caption && <p>{filteredImages[expandedIndex].caption}</p>}
            <span className="gallery-lightbox__meta">
              {filteredImages[expandedIndex].category}
              {filteredImages[expandedIndex].date && ` · ${filteredImages[expandedIndex].date}`}
            </span>
          </figcaption>
        </div>
      )}
    </div>
  );
}