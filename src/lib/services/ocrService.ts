import type { OcrResult } from "./types";

/**
 * Modular OCR:
 * - Browser: Tesseract.js with Vietnamese (`vie`) — works without cloud keys
 * - Server (optional): Google Cloud Vision when GOOGLE_CLOUD_VISION_API_KEY is set
 */
export async function extractVietnameseFromImage(
  image: File | Blob | string,
): Promise<OcrResult> {
  // Prefer client Tesseract for Phase 1 reliability without secrets
  if (typeof window !== "undefined") {
    return extractWithTesseract(image);
  }
  return {
    text: "",
    provider: "demo",
    note: "OCR must run in the browser (Tesseract) or via /api/ocr with a Vision key.",
  };
}

async function extractWithTesseract(image: File | Blob | string): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("vie");
  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(image);
    const cleaned = cleanupOcrText(text);
    return {
      text: cleaned,
      provider: "tesseract",
      confidence: typeof confidence === "number" ? confidence : undefined,
      note:
        "OCR via Tesseract (Vietnamese). Please correct any diacritic mistakes before studying.",
    };
  } finally {
    await worker.terminate();
  }
}

export function cleanupOcrText(raw: string): string {
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

/** Demo sentence for empty OCR / walkthrough — not invented from a photo. */
export const DEMO_READING_TEXT = "Tôi muốn uống nước dừa.";
