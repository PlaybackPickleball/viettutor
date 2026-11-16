import { NextResponse } from "next/server";
import { callAzurePronunciation, englishPhonemeConfigured } from "@/lib/english/azureAssess";
import { isAzureAudioMime, resolveEnglishAssessment } from "@/lib/english/feedback";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AUDIO_CHARS = 1_500_000;

export async function POST(request: Request) {
  const limited = takeRateLimitToken("en-assess", { limit: 30, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, message: "Quá nhiều lần chấm. Chờ một chút rồi thử lại." },
      { status: 429, headers: { "cache-control": "private, no-store", "retry-after": String(limited.retryAfterSec) } },
    );
  }

  let body: {
    expected?: string;
    transcript?: string | null;
    mime?: string | null;
    audioBase64?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Không đọc được yêu cầu." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const expected = typeof body.expected === "string" ? body.expected.trim() : "";
  if (!expected || expected.length > 400) {
    return NextResponse.json(
      { ok: false, message: "Thiếu câu cần nói." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const transcript = typeof body.transcript === "string" ? body.transcript : null;
  const mime = typeof body.mime === "string" ? body.mime : "";
  const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
  const phonemeConfigured = englishPhonemeConfigured();
  const sendAudio = phonemeConfigured && isAzureAudioMime(mime) && audioBase64.length > 0;

  if (audioBase64.length > MAX_AUDIO_CHARS) {
    return NextResponse.json(
      { ok: false, message: "Bản ghi quá dài." },
      { status: 413, headers: { "cache-control": "private, no-store" } },
    );
  }

  const feedback = await resolveEnglishAssessment({
    expected,
    transcript,
    mime,
    phonemeConfigured,
    callProvider: sendAudio
      ? async () => {
          const audio = Buffer.from(audioBase64, "base64");
          return callAzurePronunciation({ audio, mime, reference: expected });
        }
      : undefined,
  });

  return NextResponse.json(
    { ok: true, feedback },
    { headers: { "cache-control": "private, no-store" } },
  );
}
