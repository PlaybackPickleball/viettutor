import type { TutorExplanation } from "./types";

export type AiImageAnalysis = {
  text: string;
  translation: string | null;
  segments: { text: string; meaningEn: string; note?: string }[];
  provider: string;
  confidence?: number;
};

export type AiTextAnalysis = {
  expression: TutorExplanation | null;
  sentenceTranslation: string | null;
  provider: string;
  note?: string;
};

/** Call authenticated Vision analysis. Returns null if unavailable / unsigned-in. */
export async function analyzeImageWithAi(
  imageDataUrl: string,
): Promise<
  | { ok: true; data: AiImageAnalysis }
  | { ok: false; code?: string; message: string; status: number }
> {
  const res = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: imageDataUrl }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    code?: string;
    message?: string;
    text?: string;
    translation?: string | null;
    segments?: { text: string; meaningEn: string; note?: string }[];
    provider?: string;
    confidence?: number;
  };
  if (!res.ok || !json.ok || !json.text) {
    return {
      ok: false,
      code: json.code,
      message: json.message || `Analyze failed (${res.status})`,
      status: res.status,
    };
  }
  return {
    ok: true,
    data: {
      text: json.text,
      translation: json.translation ?? null,
      segments: json.segments ?? [],
      provider: json.provider || "openai-vision",
      confidence: json.confidence,
    },
  };
}

export async function analyzeTextWithAi(args: {
  expression?: string;
  sentence?: string;
  wantSentenceTranslation?: boolean;
}): Promise<AiTextAnalysis | null> {
  try {
    const res = await fetch("/api/analyze-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      ok?: boolean;
      expression?: TutorExplanation | null;
      sentenceTranslation?: string | null;
      provider?: string;
      note?: string;
    };
    if (!json.ok) return null;
    return {
      expression: json.expression ?? null,
      sentenceTranslation: json.sentenceTranslation ?? null,
      provider: json.provider || "openai",
      note: json.note,
    };
  } catch {
    return null;
  }
}
