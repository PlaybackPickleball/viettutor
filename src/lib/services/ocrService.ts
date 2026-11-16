import type { OcrResult } from "./types";

/**
 * Modular OCR — client-only Tesseract (vie).
 * Cloud Vision is intentionally not exposed via a public server route
 * (would spend API quota without auth). Add Vision later behind signed-in users.
 */
export async function extractVietnameseFromImage(
  image: File | Blob | string,
): Promise<OcrResult> {
  if (typeof window !== "undefined") {
    return extractWithTesseract(image);
  }
  return {
    text: "",
    provider: "demo",
    note: "OCR runs on-device in the browser (Tesseract). No public Vision proxy is shipped.",
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

/**
 * On-device English OCR. Empty text stays empty — callers must not invent a sentence.
 */
export async function extractEnglishFromImage(image: File | Blob | string): Promise<OcrResult> {
  if (typeof window === "undefined") {
    return {
      text: "",
      provider: "demo",
      note: "OCR runs in the browser. No text was invented on the server.",
    };
  }
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(image);
    return {
      text: cleanupOcrText(text),
      provider: "tesseract",
      confidence: typeof confidence === "number" ? confidence : undefined,
      note: "OCR via Tesseract (English). Confirm the text before studying it.",
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
