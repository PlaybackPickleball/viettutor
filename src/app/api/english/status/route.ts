import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/services/aiProvider";
import { englishPhonemeConfigured } from "@/lib/english/azureAssess";

export const runtime = "nodejs";

/** Booleans only. Never returns key material. */
export async function GET() {
  return NextResponse.json(
    {
      ai: isAiConfigured(),
      phoneme: englishPhonemeConfigured(),
      studioEnglishVoice: false,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
