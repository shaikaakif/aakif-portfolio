import type { Metadata } from "next";
import { seo } from "@/content/seo";
import { PublicGallery } from "@/components/sections/public-gallery";

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
    <div className="gallery-page">
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
            <span className="role-pill">Photography</span>
            <span className="role-pill">Events</span>
            <span className="role-pill">Project Screenshots</span>
            <span className="role-pill">Work & Process</span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Image gallery">
        <div className="container">
          <PublicGallery />
        </div>
      </section>
    </div>
  );
}