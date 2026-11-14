import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/karaoke/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ songId: string }> };

/** Serve admin-uploaded masters from data/karaoke/uploads. */
export async function GET(_req: Request, ctx: Ctx) {
  const { songId } = await ctx.params;
  const dir = UPLOAD_DIR;
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const match = entries.find((f) => f.startsWith(`${songId}.`));
  if (!match) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const file = path.join(dir, match);
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
