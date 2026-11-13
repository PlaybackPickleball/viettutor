import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../cursor/identity";
import { chatJson, isAiConfigured } from "@/lib/services/aiProvider";
import { explainExpression } from "@/lib/services/tutorService";

export const runtime = "nodejs";

/**
 * Authenticated word/sentence tutor analysis.
 * Falls back to lexicon when AI is not configured (still requires signed-in viewer).
 */
export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  try {
    const body = (await request.json()) as {
      expression?: string;
      sentence?: string;
      wantSentenceTranslation?: boolean;
    };
    const expression = body.expression?.trim();
    const sentence = body.sentence?.trim();
    if (!expression && !sentence) {
      return NextResponse.json(
        { ok: false, message: "expression or sentence required" },
        { status: 400, headers: { "cache-control": "private, no-store" } },
      );
    }

    if (!isAiConfigured()) {
      const lex = expression
        ? explainExpression(expression, sentence)
        : null;
      return NextResponse.json(
        {
          ok: true,
          provider: "lexicon",
          expression: lex,
          sentenceTranslation: null,
          note: "AI key not bound yet — using beginner lexicon fallback.",
        },
        { headers: { "cache-control": "private, no-store" } },
      );
    }

    const result = await chatJson({
      system: `You are ÁMi Lingua, a patient Southern-Vietnamese tutor for absolute beginners.
Return JSON only:
{
  "expression": { "text": "", "meaningEn": "", "note": "", "toneHint": "" } | null,
  "sentenceTranslation": "" | null
}
Keep notes short. Do not invent document context beyond the given sentence.
Ground meanings in the provided Vietnamese text.`,
      user: JSON.stringify({
        expression: expression ?? null,
        sentence: sentence ?? null,
        wantSentenceTranslation: Boolean(body.wantSentenceTranslation),
      }),
      maxTokens: 500,
    });

    if (!result.ok) {
      const lex = expression ? explainExpression(expression, sentence) : null;
      return NextResponse.json(
        {
          ok: true,
          provider: "lexicon-fallback",
          expression: lex,
          sentenceTranslation: null,
          note: result.message,
        },
        { headers: { "cache-control": "private, no-store" } },
      );
    }

    const data = result.data as {
      expression?: {
        text?: string;
        meaningEn?: string;
        note?: string;
        toneHint?: string;
      } | null;
      sentenceTranslation?: string | null;
    };

    return NextResponse.json(
      {
        ok: true,
        provider: "openai",
        expression: data.expression
          ? {
              expression: data.expression.text || expression || "",
              meaningEn: data.expression.meaningEn || "—",
              note: data.expression.note,
              toneHint: data.expression.toneHint,
              source: "llm" as const,
            }
          : expression
            ? explainExpression(expression, sentence)
            : null,
        sentenceTranslation: data.sentenceTranslation ?? null,
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
