import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import { deepgramConfigured } from "@/lib/vi/deepgramAssess";

export const runtime = "nodejs";

/** Booleans only. Never returns key material. Requires a signed-in viewer. */
export async function GET(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

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
