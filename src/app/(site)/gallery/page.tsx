import type { Metadata } from "next";
import { seo } from "@/content/seo";
import { PublicGallery } from "@/components/sections/public-gallery";
import {
  getPublishedGalleryCollections,
  getPublishedGalleryImages,
} from "@/lib/content/cms";
import {
  buildGalleryImageDescription,
  buildGalleryImageKeywords,
  buildGalleryPageKeywords,
} from "@/lib/seo/gallery";

const description =
  "Personal photography, event photos, project screenshots, and behind-the-scenes work.";

export async function generateMetadata(): Promise<Metadata> {
  const images = await getPublishedGalleryImages();
  const first = images[0];

  return {
    title: "Gallery",
    description,
    keywords: buildGalleryPageKeywords(images),
    alternates: {
      canonical: "/gallery/",
    },
    openGraph: {
      title: `Gallery | ${seo.title.split(" — ")[0]}`,
      description,
      url: "/gallery/",
      type: "website",
      images: first?.public_url
        ? [
            {
              url: first.public_url,
              alt: first.alt_text,
              width: first.width ?? undefined,
              height: first.height ?? undefined,
            },
          ]
        : [
            {
              url: seo.ogImage,
              alt: seo.ogImageAlt,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Gallery | ${seo.title.split(" — ")[0]}`,
      description,
      images: first?.public_url ? [first.public_url] : [seo.ogImage],
    },
  };
}

export default async function GalleryPage() {
  const [images, collections] = await Promise.all([
    getPublishedGalleryImages(),
    getPublishedGalleryCollections(),
  ]);

  const galleryData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Shaik Aakif — Gallery",
    description,
    url: `${seo.baseUrl}/gallery/`,
    image: images.map((image) => ({
      "@type": "ImageObject",
      contentUrl: image.public_url,
      name: image.title,
      description: buildGalleryImageDescription(image),
      keywords: buildGalleryImageKeywords(image).join(", "),
      width: image.width ?? undefined,
      height: image.height ?? undefined,
      datePublished: image.created_at,
      creator: {
        "@type": "Person",
        name: image.photographer ?? seo.author,
      },
      creditText: image.copyright_holder ?? undefined,
      license: image.license ?? undefined,
    })),
  };

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
            {images.length > 0 ? (
              <span className="role-pill">{images.length} images</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Image gallery">
        <div className="container">
          <PublicGallery
            initialImages={images.map((image) => ({
              id: image.id,
              public_url: image.public_url as string,
              title: image.title,
              alt_text: image.alt_text,
              caption: image.caption,
              categories: image.categories,
              collection_id: image.collection_id,
              width: image.width,
              height: image.height,
            }))}
            initialCollections={collections.map((collection) => ({
              id: collection.id,
              name: collection.name,
            }))}
          />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
