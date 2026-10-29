import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/ui/icons";
import { getPublishedGalleryImages } from "@/lib/content/cms";
import { seo } from "@/content/seo";

interface GalleryImagePageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const images = await getPublishedGalleryImages();
  if (images.length === 0) {
    // Static export requires at least one param; this placeholder resolves to notFound.
    return [{ id: "_empty" }];
  }
  return images.map((image) => ({ id: image.id }));
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: GalleryImagePageProps): Promise<Metadata> {
  const { id } = await params;
  const images = await getPublishedGalleryImages();
  const image = images.find((item) => item.id === id);

  if (!image) {
    return {
      title: "Image not found",
      robots: { index: false, follow: false },
    };
  }

  const description = image.caption ?? image.description ?? image.alt_text;

  return {
    title: image.title,
    description,
    alternates: {
      canonical: `/gallery/${image.id}/`,
    },
    openGraph: {
      title: `${image.title} | ${seo.title.split(" — ")[0]}`,
      description,
      url: `/gallery/${image.id}/`,
      type: "article",
      images: image.public_url
        ? [
            {
              url: image.public_url,
              alt: image.alt_text,
              width: image.width ?? undefined,
              height: image.height ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: image.title,
      description,
      images: image.public_url ? [image.public_url] : [seo.ogImage],
    },
  };
}

export default async function GalleryImagePage({
  params,
}: GalleryImagePageProps) {
  const { id } = await params;
  const images = await getPublishedGalleryImages();
  const image = images.find((item) => item.id === id);

  if (!image || !image.public_url) notFound();

  const taken = formatDate(image.taken_at);
  const uploaded = formatDate(image.created_at);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: image.public_url,
    name: image.title,
    description: image.caption ?? image.description ?? image.alt_text,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    datePublished: image.created_at,
    dateCreated: image.taken_at ?? undefined,
    creator: {
      "@type": "Person",
      name: image.photographer ?? seo.author,
    },
    creditText: image.copyright_holder ?? undefined,
    license: image.license ?? undefined,
    keywords: [...image.categories, ...image.tags].join(", "),
    isPartOf: {
      "@type": "ImageGallery",
      name: "Shaik Aakif — Gallery",
      url: `${seo.baseUrl}/gallery/`,
    },
  };

  return (
    <div className="gallery-page">
      <section className="section">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link prefetch={false} href="/gallery/">
              <ArrowLeft width={13} height={13} />
              All images
            </Link>
          </nav>

          <div className="gallery-detail">
            <figure className="gallery-detail__figure">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase asset, images are unoptimized in this static export */}
              <img
                src={image.public_url}
                alt={image.alt_text}
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                loading="eager"
                decoding="async"
              />
              <figcaption>
                <h1 className="gallery-detail__title">{image.title}</h1>
                {image.caption ? (
                  <p className="gallery-detail__caption">{image.caption}</p>
                ) : null}
              </figcaption>
            </figure>

            <aside className="gallery-detail__aside" aria-label="Image details">
              {image.description ? (
                <p className="gallery-detail__description">
                  {image.description}
                </p>
              ) : null}

              <dl className="gallery-detail__meta">
                {image.width && image.height ? (
                  <div>
                    <dt>Dimensions</dt>
                    <dd>
                      {image.width} × {image.height}
                    </dd>
                  </div>
                ) : null}
                {taken ? (
                  <div>
                    <dt>Taken</dt>
                    <dd>{taken}</dd>
                  </div>
                ) : null}
                {uploaded ? (
                  <div>
                    <dt>Published</dt>
                    <dd>{uploaded}</dd>
                  </div>
                ) : null}
                {image.photographer ? (
                  <div>
                    <dt>Photographer</dt>
                    <dd>{image.photographer}</dd>
                  </div>
                ) : null}
                {image.copyright_holder ? (
                  <div>
                    <dt>Credit</dt>
                    <dd>{image.copyright_holder}</dd>
                  </div>
                ) : null}
                {image.license ? (
                  <div>
                    <dt>License</dt>
                    <dd>{image.license}</dd>
                  </div>
                ) : null}
              </dl>

              {image.categories.length > 0 || image.tags.length > 0 ? (
                <div className="gallery-detail__tags">
                  {[...image.categories, ...image.tags].map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <Link
                prefetch={false}
                href="/gallery/"
                className="text-link"
              >
                Back to the gallery
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
