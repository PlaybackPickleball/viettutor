import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { chatJson, isAiConfigured } from "@/lib/services/aiProvider";
import { takeRateLimitToken } from "@/lib/services/simpleRateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * One Vietnamese correction for a guided line.
 * Refuses when no server key is configured. Does not invent a reply.
 */
export async function POST(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "ai_unconfigured",
        message: "Giáo viên AI chưa được kết nối. Bạn vẫn nói theo câu mẫu.",
      },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }

  const limited = takeRateLimitToken("en-teacher", { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, message: "Xin chờ một chút rồi hỏi lại." },
      { status: 429, headers: { "cache-control": "private, no-store" } },
    );
  }

  let body: { expected?: string; heard?: string; scenario?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Không đọc được yêu cầu." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const expected = (body.expected ?? "").trim().slice(0, 240);
  const heard = (body.heard ?? "").trim().slice(0, 240);
  const scenario = (body.scenario ?? "").trim().slice(0, 80);
  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "Thiếu câu mẫu." },
      { status: 400, headers: { "cache-control": "private, no-store" } },
    );
  }

  const result = await chatJson({
    system:
      "You help a Vietnamese adult beginner practicing American English. Reply with JSON {\"correctionVi\": string, \"demoEn\": string}. correctionVi is one short sentence in Vietnamese. demoEn is the model English line only. Do not invent a numeric score. Do not ask for a native accent. If you cannot hear a problem, say the line was clear enough to continue.",
    user: `Scenario: ${scenario || "guided"}\nExpected English: ${expected}\nHeard transcript: ${heard || "(none)"}`,
    maxTokens: 300,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Giáo viên AI chưa trả lời được. Không có góp ý giả." },
      { status: 502, headers: { "cache-control": "private, no-store" } },
    );
  }

  const data = result.data as { correctionVi?: unknown; demoEn?: unknown };
  const correctionVi = typeof data.correctionVi === "string" ? data.correctionVi.trim() : "";
  const demoEn = typeof data.demoEn === "string" ? data.demoEn.trim() : "";
  if (!correctionVi || !demoEn) {
    return NextResponse.json(
      { ok: false, message: "Giáo viên AI trả lời không đủ. Không có góp ý giả." },
      { status: 502, headers: { "cache-control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, correctionVi, demoEn },
    { headers: { "cache-control": "private, no-store" } },
  );
}
