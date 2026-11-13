import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../cursor/identity";
import { chatJson, isAiConfigured } from "@/lib/services/aiProvider";
import { cleanupOcrText } from "@/lib/services/ocrService";

export const runtime = "nodejs";

const MAX_IMAGE_CHARS = 2_500_000; // ~1.8MB base64 budget

/**
 * Authenticated image → Vietnamese text + beginner teaching data.
 * Requires signed-in Cursor viewer (private/team app). Uses OPENAI_API_KEY when bound.
 */
export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "ai_unconfigured",
        message:
          "AI analysis is not configured yet. Use on-device OCR, or add OPENAI_API_KEY in app secrets.",
      },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }

  try {
    const body = (await request.json()) as { imageBase64?: string };
    const imageBase64 = body.imageBase64?.trim();
    if (!imageDataUrlOk(imageBase64)) {
      return NextResponse.json(
        { ok: false, message: "imageBase64 data URL required (image/jpeg or image/png)" },
        { status: 400, headers: { "cache-control": "private, no-store" } },
      );
    }
    if (imageBase64!.length > MAX_IMAGE_CHARS) {
      return NextResponse.json(
        { ok: false, message: "Image too large — capture a closer crop of the text." },
        { status: 413, headers: { "cache-control": "private, no-store" } },
      );
    }

    const result = await chatJson({
      system: `You are ÁMi Lingua, a patient Southern-Vietnamese tutor for beginners.
Extract ONLY Vietnamese text visible in the image. Preserve diacritics and tone marks.
Do not invent text that is not visible. If unclear, omit that part.
Return JSON with:
{
  "text": "full Vietnamese text, line breaks ok",
  "translation": "plain English of the whole text or null",
  "segments": [ { "text": "syllable or compound", "meaningEn": "short English", "note": "optional beginner tip" } ],
  "confidence": 0-1
}
Prefer multi-syllable compounds when they are one expression (e.g. nước dừa, cà phê).
Keep segments useful for tapping — not every punctuation mark.`,
      user: "Extract Vietnamese from this photo for a beginner reading lesson.",
      imageDataUrl: imageBase64,
      maxTokens: 1600,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 502, headers: { "cache-control": "private, no-store" } },
      );
    }

    const data = result.data as {
      text?: string;
      translation?: string | null;
      segments?: { text?: string; meaningEn?: string; note?: string }[];
      confidence?: number;
    };

    const text = cleanupOcrText(data.text ?? "");
    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          code: "no_text",
          message: "No clear Vietnamese text found. Try a sharper, closer photo.",
        },
        { status: 422, headers: { "cache-control": "private, no-store" } },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        provider: "openai-vision",
        text,
        translation: data.translation ?? null,
        segments: Array.isArray(data.segments)
          ? data.segments
              .filter((s) => s?.text && s?.meaningEn)
              .slice(0, 40)
              .map((s) => ({
                text: String(s.text).trim(),
                meaningEn: String(s.meaningEn).trim(),
                note: s.note ? String(s.note).trim() : undefined,
              }))
          : [],
        confidence: typeof data.confidence === "number" ? data.confidence : undefined,
        viewer: identity.kind === "person" ? identity.name || "learner" : "service",
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Analyze failed" },
      { status: 500, headers: { "cache-control": "private, no-store" } },
    );
  }
}

function imageDataUrlOk(value?: string): boolean {
  if (!value) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value);
}
