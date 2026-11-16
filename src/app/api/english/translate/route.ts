import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { chatJson, isAiConfigured } from "@/lib/services/aiProvider";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";

export const runtime = "nodejs";

/** Natural Vietnamese for text the learner already confirmed. No key material in the response. */
export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  if (!isAiConfigured()) {
    return NextResponse.json(
      { ok: false, code: "ai_unconfigured", message: "Chưa có bản dịch tự động." },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }

  const limited = takeRateLimitToken("en-translate", { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, message: "Xin chờ một chút rồi dịch lại." },
      { status: 429, headers: { "cache-control": "private, no-store" } },
    );
  }

  let text = "";
  try {
    const body = (await request.json()) as { text?: string };
    text = typeof body.text === "string" ? body.text.trim().slice(0, 600) : "";
  } catch {
    return NextResponse.json(
      { ok: false, message: "Không đọc được yêu cầu." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }
  if (!text) {
    return NextResponse.json(
      { ok: false, message: "Chưa có chữ để dịch." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const result = await chatJson({
    system:
      "Translate the learner's confirmed English text into natural Vietnamese. Reply JSON {\"translationVi\": string}. Translate only what is written. If you are unsure, say so inside translationVi. Do not add a score.",
    user: text,
    maxTokens: 400,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Chưa dịch được câu này." },
      { status: 502, headers: { "cache-control": "private, no-store" } },
    );
  }
  const translationVi = (result.data as { translationVi?: unknown }).translationVi;
  if (typeof translationVi !== "string" || !translationVi.trim()) {
    return NextResponse.json(
      { ok: false, message: "Chưa dịch được câu này." },
      { status: 502, headers: { "cache-control": "private, no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true, translationVi: translationVi.trim() },
    { headers: { "cache-control": "private, no-store" } },
  );
}
