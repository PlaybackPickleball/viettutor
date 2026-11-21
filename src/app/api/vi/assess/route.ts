import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";
import {
  callDeepgramVietnameseListen,
  deepgramConfigured,
  isDeepgramAudioMime,
} from "@/lib/vi/deepgramAssess";
import { feedbackUnavailable, fromDeepgramTranscript } from "@/lib/vi/feedback";
import { analyzeToneExperimental } from "@/lib/vi/toneExperimental";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AUDIO_CHARS = 1_500_000;

export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  const viewerKey =
    identity.kind === "person" ? `u:${identity.userId}` : `k:${identity.idp.sub}`;
  const limited = takeRateLimitToken(`vi-assess:${viewerKey}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        feedback: feedbackUnavailable(
          "Too many assessment attempts — wait a moment, then try again.",
        ),
      },
      {
        status: 429,
        headers: {
          "cache-control": "private, no-store",
          "retry-after": String(limited.retryAfterSec),
        },
      },
    );
  }

  let body: {
    expected?: string;
    mime?: string | null;
    audioBase64?: string | null;
    dialect?: string | null;
    itemId?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, feedback: feedbackUnavailable("Could not read the request.") },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const expected = typeof body.expected === "string" ? body.expected.trim() : "";
  if (!expected || expected.length > 400) {
    return NextResponse.json(
      { ok: false, feedback: feedbackUnavailable("Missing Vietnamese reference text.") },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const mime = typeof body.mime === "string" ? body.mime : "";
  const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
  const dialect = body.dialect === "northern" ? "northern" : "southern";

  if (audioBase64.length > MAX_AUDIO_CHARS) {
    return NextResponse.json(
      { ok: false, feedback: feedbackUnavailable("Recording is too long.", "unavailable", expected) },
      { status: 413, headers: { "cache-control": "private, no-store" } },
    );
  }

  if (!deepgramConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        feedback: feedbackUnavailable(
          "Deepgram Vietnamese transcription is not configured. Recording and playback still work — we will not invent a score.",
          "unavailable",
          expected,
        ),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  if (!audioBase64 || !isDeepgramAudioMime(mime)) {
    return NextResponse.json(
      {
        ok: true,
        feedback: feedbackUnavailable(
          "Unable to assess reliably — this browser audio format is not supported. Try again after the take converts to WAV.",
          "format_unsupported",
          expected,
        ),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  try {
    const audio = Buffer.from(audioBase64, "base64");
    if (audio.byteLength < 400) {
      return NextResponse.json(
        {
          ok: true,
          feedback: feedbackUnavailable(
            "Unable to assess reliably — that take was too short or silent.",
            "silence",
            expected,
          ),
        },
        { headers: { "cache-control": "private, no-store" } },
      );
    }

    const provider = await callDeepgramVietnameseListen({ audio, mime });
    const feedback = fromDeepgramTranscript({
      expected,
      httpOk: provider.httpOk,
      transcript: provider.transcript,
      confidence: provider.confidence,
    });
    const tone = analyzeToneExperimental({
      expectedText: expected,
      dialect,
    });

    return NextResponse.json(
      {
        ok: true,
        feedback: {
          ...feedback,
          toneScore: tone.toneScore,
          toneStatus: tone.status === "not_validated" ? "not_validated" : "unavailable",
          experimentalLabel:
            feedback.experimentalLabel ??
            (tone.status === "not_validated" ? tone.experimentalLabel : undefined),
          itemId: typeof body.itemId === "string" ? body.itemId : null,
          dialect,
        },
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        feedback: feedbackUnavailable(
          "Unable to assess reliably — please try again.",
          "unavailable",
          expected,
        ),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  }
}
