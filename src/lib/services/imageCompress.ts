/** Compress / crop phone photos for AI upload (keeps text readable, caps payload size). */

export type CropRect = {
  /** Normalized 0–1 against the displayed/natural image */
  x: number;
  y: number;
  w: number;
  h: number;
};

export async function fileToCompressedDataUrl(
  file: File,
  maxEdge = 1280,
  quality = 0.72,
  crop?: CropRect | null,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    return bitmapToCompressedDataUrl(bitmap, maxEdge, quality, crop);
  } finally {
    bitmap.close();
  }
}

export async function urlToCompressedDataUrl(
  url: string,
  maxEdge = 1280,
  quality = 0.72,
  crop?: CropRect | null,
): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  try {
    return bitmapToCompressedDataUrl(bitmap, maxEdge, quality, crop);
  } finally {
    bitmap.close();
  }
}

export function bitmapToCompressedDataUrl(
  bitmap: ImageBitmap,
  maxEdge = 1280,
  quality = 0.72,
  crop?: CropRect | null,
): string {
  const sx = crop ? Math.max(0, Math.floor(crop.x * bitmap.width)) : 0;
  const sy = crop ? Math.max(0, Math.floor(crop.y * bitmap.height)) : 0;
  const sw = crop
    ? Math.max(1, Math.min(bitmap.width - sx, Math.floor(crop.w * bitmap.width)))
    : bitmap.width;
  const sh = crop
    ? Math.max(1, Math.min(bitmap.height - sy, Math.floor(crop.h * bitmap.height)))
    : bitmap.height;

  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Turn a cropped data URL into a Blob for on-device OCR. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
