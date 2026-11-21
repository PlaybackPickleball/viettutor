import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";
import {
  callAzureVietnamesePronunciation,
  isAzureAudioMime,
  vietnamesePronunciationConfigured,
} from "@/lib/vi/azureAssess";
import { feedbackUnavailable, fromAzureVietnamese } from "@/lib/vi/feedback";
import { analyzeToneExperimental } from "@/lib/vi/toneExperimental";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AUDIO_CHARS = 1_500_000;

export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  const viewerKey =
    "userId" in identity && identity.userId
      ? `vi-assess:${identity.userId}`
      : "vi-assess:anon";
  const limited = takeRateLimitToken(viewerKey, { limit: 30, windowMs: 60_000 });
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
      { ok: false, feedback: feedbackUnavailable("Recording is too long.") },
      { status: 413, headers: { "cache-control": "private, no-store" } },
    );
  }

  if (!vietnamesePronunciationConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        feedback: feedbackUnavailable(
          "Azure Pronunciation Assessment for Vietnamese is not configured. Recording and playback still work — we will not invent a score.",
        ),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  if (!audioBase64 || !isAzureAudioMime(mime)) {
    return NextResponse.json(
      {
        ok: true,
        feedback: feedbackUnavailable(
          "Unable to assess reliably — this browser audio format is not supported for Azure scoring. Try another browser, or compare by ear.",
          "format_unsupported",
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
          ),
        },
        { headers: { "cache-control": "private, no-store" } },
      );
    }

    const provider = await callAzureVietnamesePronunciation({
      audio,
      mime,
      reference: expected,
    });
    const feedback = fromAzureVietnamese(provider.httpOk, provider.body);
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
          tip:
            feedback.scoringAvailable
              ? feedback.tip
              : feedback.tip,
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
        ),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  }
}
