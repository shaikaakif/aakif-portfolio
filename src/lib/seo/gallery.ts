import { seo } from "@/content/seo";
import type { GalleryImage } from "@/lib/admin/types";

const NAME_VARIANTS = [
  "Shaik Aakif",
  "Shaik Akif",
  "Shaik Akeef",
  "Shaik Aquif",
  "Shaik Aaquif",
  "Sheikh Aakif",
  "Sheikh Akif",
  "Sheik Aakif",
  "Sheik Akif",
  "Aakif Shaik",
  "Akif Shaik",
  "Aakif",
  "Akif",
  "Akeef",
];

const GALLERY_KEYWORDS = [
  "Shaik Aakif gallery",
  "Shaik Aakif photography",
  "Shaik Aakif photos",
  "Shaik Aakif portfolio",
  "AI builder portfolio",
  "product developer portfolio",
  "photography portfolio",
  "project screenshots",
  "behind the scenes",
];

function unique(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

export function buildGalleryImageDescription(image: GalleryImage) {
  const detail = image.caption ?? image.description;

  if (detail && detail.trim().length > 0) {
    return `${image.title} — ${detail.trim()} Photograph from the gallery of Shaik Aakif, AI builder and product developer.`;
  }

  return `${image.title} — a photograph from the personal and project gallery of Shaik Aakif, AI builder and product developer.`;
}

export function buildGalleryImageKeywords(image: GalleryImage) {
  return unique([
    ...NAME_VARIANTS,
    ...seo.keywords,
    ...GALLERY_KEYWORDS,
    image.title,
    `${image.title} Shaik Aakif`,
    ...image.categories,
    ...image.categories.map((category) => `${category} photography`),
    ...image.tags,
    image.photographer ?? "",
    image.copyright_holder ?? "",
    image.license ?? "",
  ]);
}

export function buildGalleryImageTags(image: GalleryImage) {
  return unique([
    ...NAME_VARIANTS,
    "Shaik Aakif gallery",
    "Shaik Aakif photography",
    image.title,
    ...image.categories,
    ...image.tags,
  ]);
}

export function buildGalleryImageSeo(image: GalleryImage) {
  return {
    title: image.title,
    description: buildGalleryImageDescription(image),
    keywords: buildGalleryImageKeywords(image),
    tags: buildGalleryImageTags(image),
  };
}

export function buildGalleryPageKeywords(images: GalleryImage[]) {
  return unique([
    ...NAME_VARIANTS,
    ...seo.keywords,
    ...GALLERY_KEYWORDS,
    ...images.flatMap((image) => [
      image.title,
      `${image.title} Shaik Aakif`,
      ...image.categories,
      ...image.tags,
    ]),
  ]);
}
