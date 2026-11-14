import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { requireSingViewer } from "@/lib/karaoke/adminAuth";
import { parseSafeSongId } from "@/lib/karaoke/safeId";
import { resolveUnderRoot, UPLOAD_DIR } from "@/lib/karaoke/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ songId: string }> };

/** Serve admin-uploaded masters from data/karaoke/uploads. */
export async function GET(req: Request, ctx: Ctx) {
  const identity = await requireSingViewer(req);
  if (identity instanceof Response) return identity;

  const { songId: raw } = await ctx.params;
  const songId = parseSafeSongId(raw);
  if (!songId) {
    return NextResponse.json({ error: "invalid_song_id" }, { status: 400 });
  }

  let entries: string[] = [];
  try {
    entries = await fs.readdir(UPLOAD_DIR);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const match = entries.find((f) => {
    const base = f.split(".")[0];
    return base === songId && /^[a-z0-9]+(?:-[a-z0-9]+)*\.(mp3|wav|m4a|ogg)$/i.test(f);
  });
  if (!match) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let file: string;
  try {
    file = resolveUnderRoot(UPLOAD_DIR, match);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const buf = await fs.readFile(file);
  const ext = match.split(".").pop()?.toLowerCase();
  const type =
    ext === "wav"
      ? "audio/wav"
      : ext === "m4a"
        ? "audio/mp4"
        : ext === "ogg"
          ? "audio/ogg"
          : "audio/mpeg";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
