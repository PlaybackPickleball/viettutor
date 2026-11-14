import { NextResponse } from "next/server";
import { getFixtureKaraokeSong } from "@/lib/karaoke/catalog";
import { readApprovedSong, writeApprovedSong } from "@/lib/karaoke/store";
import type { KaraokeSong } from "@/lib/karaoke/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ songId: string }> };

/** GET approved karaoke doc (filesystem override) or bundled fixture. */
export async function GET(_req: Request, ctx: Ctx) {
  const { songId } = await ctx.params;
  const approved = await readApprovedSong(songId);
  if (approved) {
    return NextResponse.json({ source: "approved", song: approved });
  }
  const fixture = getFixtureKaraokeSong(songId);
  if (fixture) {
    return NextResponse.json({ source: "fixture", song: fixture });
  }
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

/** PUT save / approve karaoke document (admin). */
export async function PUT(req: Request, ctx: Ctx) {
  const { songId } = await ctx.params;
  let body: { song?: KaraokeSong; approve?: boolean };
  try {
    body = (await req.json()) as { song?: KaraokeSong; approve?: boolean };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.song || body.song.id !== songId) {
    return NextResponse.json({ error: "song_mismatch" }, { status: 400 });
  }
  const song: KaraokeSong = {
    ...body.song,
    publishStatus: body.approve ? "approved" : body.song.publishStatus,
    approvedAt: body.approve ? new Date().toISOString() : body.song.approvedAt,
  };
  const file = await writeApprovedSong(song);

  // Also mirror into fixture path when approving catalog songs so deploys ship timings.
  if (body.approve) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fixtureFile = path.join(
        process.cwd(),
        "src/lib/karaoke/fixtures",
        `${songId}.json`,
      );
      await fs.access(fixtureFile);
      await fs.writeFile(fixtureFile, JSON.stringify(song, null, 2), "utf8");
    } catch {
      /* non-JSON fixtures (e.g. xin-chao ts) skipped */
    }
  }

  return NextResponse.json({ ok: true, file, song });
}
