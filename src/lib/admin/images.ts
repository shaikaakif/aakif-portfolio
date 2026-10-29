export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return `${file.name}: unsupported file type. Use JPEG, PNG, WebP, AVIF, or GIF.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: file is larger than 10 MB.`;
  }
  if (file.size === 0) {
    return `${file.name}: file is empty.`;
  }
  return null;
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number | null; height: number | null }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    } catch {
      // Fall through to the Image element fallback.
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

export function formatFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  return map[mime] ?? "bin";
}
