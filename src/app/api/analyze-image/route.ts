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
Extract ONLY the Vietnamese words/phrases that are the main subject of the photo
(signs, menus, book titles, posters). Preserve diacritics and tone marks exactly.

IGNORE and never copy: browser tabs, address bars, Google Search UI, app chrome,
English navigation, watermarks, timestamps, random Latin gibberish, or UI labels
like "ÁMi Lingua", "Samples", "Typography", "Search".

Do not invent text that is not clearly visible. If the crop has no readable
Vietnamese, return {"text":"","translation":null,"segments":[],"confidence":0}.

Return JSON with:
{
  "text": "Vietnamese only, line breaks ok",
  "translation": "plain English of that Vietnamese or null",
  "segments": [ { "text": "syllable or compound", "meaningEn": "short English", "note": "optional beginner tip" } ],
  "confidence": 0-1
}
Prefer multi-syllable compounds when they are one expression (e.g. nước dừa, cơm nhà, xứ Quảng).
Keep segments useful for tapping — not punctuation.`,
      user: "Read only the Vietnamese text inside this cropped photo for a beginner lesson.",
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
          message:
            "No clear Vietnamese text in this selection. Drag the box onto the words and try again.",
        },
        { status: 422, headers: { "cache-control": "private, no-store" } },
      );
    }
    if (looksLikeUiNoise(text)) {
      return NextResponse.json(
        {
          ok: false,
          code: "noisy_text",
          message:
            "That selection looks like browser or app UI, not Vietnamese. Crop tighter onto the sign or menu text.",
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

/** Reject OCR that is mostly English chrome / gibberish instead of Vietnamese. */
function looksLikeUiNoise(text: string): boolean {
  const lower = text.toLowerCase();
  const chromeHints = [
    "ami lingua",
    "ámi lingua",
    "google search",
    "level 1 learning",
    "typography",
    "samples |",
    "http://",
    "https://",
  ];
  if (chromeHints.some((h) => lower.includes(h))) return true;

  const letters = text.replace(/\s+/g, "");
  if (letters.length < 2) return true;
  const viet = (text.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi) || [])
    .length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  // Real Vietnamese almost always has diacritics; pure ASCII UI dumps do not.
  if (latin > 24 && viet === 0) return true;
  if (latin > 0 && viet / Math.max(1, latin) < 0.08 && latin > 40) return true;
  return false;
}
