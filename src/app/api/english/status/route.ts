import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { isAiConfigured } from "@/lib/services/aiProvider";
import { englishPhonemeConfigured } from "@/lib/english/azureAssess";

export const runtime = "nodejs";

/** Booleans only. Never returns key material. Requires a signed-in viewer. */
export async function GET(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  return NextResponse.json(
    {
      ai: isAiConfigured(),
      phoneme: englishPhonemeConfigured(),
      studioEnglishVoice: false,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
