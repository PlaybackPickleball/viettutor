import { NextResponse } from "next/server";
import { vietnamesePronunciationConfigured } from "@/lib/vi/azureAssess";

export const runtime = "nodejs";

/** Booleans only. Never returns key material. */
export async function GET() {
  return NextResponse.json(
    {
      pronunciation: vietnamesePronunciationConfigured(),
      locale: "vi-VN",
      dialectDefault: "southern",
      toneScoringValidated: false,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
