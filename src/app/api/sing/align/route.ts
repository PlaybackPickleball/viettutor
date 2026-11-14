import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getFixtureKaraokeSong } from "@/lib/karaoke/catalog";
import { runForcedAlignmentJob } from "@/lib/karaoke/pipelineServer";
import { ensureKaraokeDirs, readApprovedSong, UPLOAD_DIR } from "@/lib/karaoke/store";

export const runtime = "nodejs";
export const maxDuration = 800;

/**
 * POST multipart: audio file + verified lyrics → Demucs + forced align.
 * Fields: songId, title, artist, lyricsVi, isolateVocals ("1"|"0"), audio (file, optional if catalog mp3 exists)
 */
export async function POST(req: Request) {
  await ensureKaraokeDirs();
  const form = await req.formData();
  const songId = String(form.get("songId") || "").trim();
  const title = String(form.get("title") || songId).trim();
  const artist = String(form.get("artist") || "Unknown").trim();
  const lyricsViRaw = String(form.get("lyricsVi") || "");
  const isolateVocals = String(form.get("isolateVocals") ?? "1") !== "0";
  const model = String(form.get("model") || "base");

  if (!songId) {
    return NextResponse.json({ error: "songId_required" }, { status: 400 });
  }
  const verifiedLyricsVi = lyricsViRaw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!verifiedLyricsVi.length) {
    return NextResponse.json({ error: "lyrics_required" }, { status: 400 });
  }

  let audioPath: string | null = null;
  let audioUrl = `/sing/${songId}.mp3`;

  const file = form.get("audio");
  if (file && typeof file !== "string" && "arrayBuffer" in file) {
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = (file.name?.split(".").pop() || "mp3").toLowerCase();
    if (!["mp3", "wav", "m4a", "ogg"].includes(ext)) {
      return NextResponse.json({ error: "unsupported_audio" }, { status: 400 });
    }
    audioPath = path.join(/* turbopackIgnore: true */ UPLOAD_DIR, `${songId}.${ext}`);
    await fs.writeFile(audioPath, buf);
    // Serve uploads via API asset helper when not in public/
    audioUrl = `/api/sing/media/${songId}`;
  } else {
    // Prefer public catalog masters
    const publicMp3 = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "public",
      "sing",
      `${songId}.mp3`,
    );
    const publicWav = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "public",
      "sing",
      `${songId}.wav`,
    );
    try {
      await fs.access(publicMp3);
      audioPath = publicMp3;
      audioUrl = `/sing/${songId}.mp3`;
    } catch {
      try {
        await fs.access(publicWav);
        audioPath = publicWav;
        audioUrl = `/sing/${songId}.wav`;
      } catch {
        return NextResponse.json({ error: "audio_required" }, { status: 400 });
      }
    }
  }

  const previous = (await readApprovedSong(songId)) ?? getFixtureKaraokeSong(songId) ?? null;

  try {
    const job = await runForcedAlignmentJob({
      songId,
      title,
      artist,
      audioPath,
      audioUrl,
      verifiedLyricsVi,
      isolateVocals,
      model,
      previous,
    });
    if (!job.output) {
      return NextResponse.json(
        { error: "align_failed", log: job.log?.slice(-2000) },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      jobId: job.id,
      song: job.output,
      logTail: job.log?.slice(-1500),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "align_exception", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
