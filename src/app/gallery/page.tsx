import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/gallery";
import { galleryImages, galleryCategories } from "@/content/gallery";
import { seo } from "@/content/seo";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Personal photography, event photos, project screenshots, and behind-the-scenes work.",
  alternates: {
    canonical: "/gallery/",
  },
  openGraph: {
    title: `Gallery | ${seo.title.split(" — ")[0]}`,
    description: "Personal photography, event photos, project screenshots, and behind-the-scenes work.",
    url: "/gallery/",
    type: "website",
  },
};

export default function GalleryPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="gallery-title">
        <div className="container">
          <p className="eyebrow">Gallery / visual archive</p>
          <h1 className="display-title" id="gallery-title">
            Moments, work, and inspiration.
          </h1>
          <div className="page-hero__sub">
            <p>
              A curated collection of photography, event documentation, project
              screenshots, and behind-the-scenes glimpses from the journey.
            </p>
          </div>
          <div className="page-hero__meta">
            {galleryCategories.map((cat) => (
              <span className="role-pill" key={cat.id}>{cat.label}</span>
            ))}
            <span className="role-pill">{galleryImages.length} images</span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Image gallery">
        <div className="container">
          <Gallery images={galleryImages} />
        </div>
      </section>
    </>
  );
}