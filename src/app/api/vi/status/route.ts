import { NextResponse } from "next/server";
import { deepgramConfigured } from "@/lib/vi/deepgramAssess";

export const runtime = "nodejs";

/** Booleans only. Never returns key material. */
export async function GET() {
  return NextResponse.json(
    {
      pronunciation: deepgramConfigured(),
      provider: "deepgram",
      mode: "transcription_match",
      locale: "vi",
      dialectDefault: "southern",
      /** Numerical pronunciation / tone scores are not claimed. */
      scoringAvailable: false,
      toneScoringValidated: false,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
