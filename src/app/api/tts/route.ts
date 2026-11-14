import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../cursor/identity";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";
import {
  isTtsConfigured,
  synthesizeVietnameseSpeech,
  TTS_MAX_CHARS,
} from "@/lib/services/ttsProvider";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Natural Vietnamese TTS (OpenAI) for signed-in viewers.
 * Falls back client-side to Web Speech when this returns 503.
 */
export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  if (!isTtsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "tts_unconfigured",
        message: "Natural TTS is not configured yet.",
      },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }

  const viewerKey =
    identity.kind === "person" ? `u:${identity.userId}` : `k:${identity.idp.sub}`;

  const limited = takeRateLimitToken(`tts:${viewerKey}`, { limit: 40, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many TTS requests — try again shortly." },
      {
        status: 429,
        headers: {
          "cache-control": "private, no-store",
          "retry-after": String(limited.retryAfterSec),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as { text?: string; slow?: boolean };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { ok: false, message: "text required" },
        { status: 400, headers: { "cache-control": "private, no-store" } },
      );
    }
    if (text.length > TTS_MAX_CHARS) {
      return NextResponse.json(
        { ok: false, message: `text too long (max ${TTS_MAX_CHARS} chars)` },
        { status: 413, headers: { "cache-control": "private, no-store" } },
      );
    }

    const result = await synthesizeVietnameseSpeech(text, { slow: Boolean(body.slow) });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: result.status ?? 502, headers: { "cache-control": "private, no-store" } },
      );
    }

    return new NextResponse(result.audio, {
      status: 200,
      headers: {
        "content-type": result.contentType,
        "cache-control": "private, max-age=3600",
        "x-ami-tts": "openai",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "TTS failed" },
      { status: 500, headers: { "cache-control": "private, no-store" } },
    );
  }
}
