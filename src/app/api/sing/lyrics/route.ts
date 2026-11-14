import { NextResponse } from "next/server";
import { getSong } from "@/lib/sing/catalog";
import { canShowLyrics } from "@/lib/sing/rights";

export const runtime = "nodejs";

/** Serve timed lyrics only when lyrics_display rights are approved. */
export async function GET(request: Request) {
  const songId = new URL(request.url).searchParams.get("songId")?.trim() ?? "";
  if (!songId) {
    return NextResponse.json({ error: "songId required" }, { status: 400 });
  }
  const song = getSong(songId);
  if (!song) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canShowLyrics(song)) {
    return NextResponse.json(
      {
        error: "Lyrics not authorized",
        licenseStatus: song.rights.status,
        denied: true,
      },
      { status: 403 },
    );
  }
  return NextResponse.json({
    songId: song.id,
    lines: song.lines,
    licenseStatus: song.rights.status,
  });
}
