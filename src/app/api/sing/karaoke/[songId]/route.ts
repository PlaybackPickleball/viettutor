import { NextResponse } from "next/server";
import { requireSingAdmin, requireSingViewer } from "@/lib/karaoke/adminAuth";
import { getFixtureKaraokeSong } from "@/lib/karaoke/catalog";
import { parseSafeSongId } from "@/lib/karaoke/safeId";
import { readApprovedSong, writeApprovedSong } from "@/lib/karaoke/store";
import type { KaraokeSong } from "@/lib/karaoke/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ songId: string }> };

/** GET approved karaoke doc (filesystem override) or bundled fixture. */
export async function GET(req: Request, ctx: Ctx) {
  const identity = await requireSingViewer(req);
  if (identity instanceof Response) return identity;

  const { songId: raw } = await ctx.params;
  const songId = parseSafeSongId(raw);
  if (!songId) {
    return NextResponse.json({ error: "invalid_song_id" }, { status: 400 });
  }

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

/** PUT save / approve karaoke document (admin only). Writes under data/karaoke/approved only. */
export async function PUT(req: Request, ctx: Ctx) {
  const identity = await requireSingAdmin(req);
  if (identity instanceof Response) return identity;

  const { songId: raw } = await ctx.params;
  const songId = parseSafeSongId(raw);
  if (!songId) {
    return NextResponse.json({ error: "invalid_song_id" }, { status: 400 });
  }

  let body: { song?: KaraokeSong; approve?: boolean };
  try {
    body = (await req.json()) as { song?: KaraokeSong; approve?: boolean };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.song || parseSafeSongId(body.song.id) !== songId) {
    return NextResponse.json({ error: "song_mismatch" }, { status: 400 });
  }

  const song: KaraokeSong = {
    ...body.song,
    id: songId,
    publishStatus: body.approve ? "approved" : body.song.publishStatus,
    approvedAt: body.approve ? new Date().toISOString() : body.song.approvedAt,
  };

  try {
    const file = await writeApprovedSong(song);
    return NextResponse.json({ ok: true, file, song });
  } catch (e) {
    return NextResponse.json(
      { error: "write_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
