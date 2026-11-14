import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { beginAlignJob, endAlignJob, MAX_ALIGN_UPLOAD_BYTES } from "@/lib/karaoke/alignGuard";
import { requireSingAdmin } from "@/lib/karaoke/adminAuth";
import { getFixtureKaraokeSong } from "@/lib/karaoke/catalog";
import { runForcedAlignmentJob } from "@/lib/karaoke/pipelineServer";
import { parseSafeSongId } from "@/lib/karaoke/safeId";
import {
  ensureKaraokeDirs,
  readApprovedSong,
  resolveUnderRoot,
  uploadPath,
} from "@/lib/karaoke/store";

export const runtime = "nodejs";
export const maxDuration = 800;

/**
 * POST multipart: audio file + verified lyrics → Demucs + forced align.
 * Admin-only (signed-in; team apps require admin role).
 */
export async function POST(req: Request) {
  const identity = await requireSingAdmin(req);
  if (identity instanceof Response) return identity;

  const gate = beginAlignJob(identity.sub);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: 429 });
  }

  try {
    await ensureKaraokeDirs();
    const form = await req.formData();
    const songId = parseSafeSongId(String(form.get("songId") || ""));
    const title = String(form.get("title") || songId || "").trim().slice(0, 200);
    const artist = String(form.get("artist") || "Unknown").trim().slice(0, 200);
    const lyricsViRaw = String(form.get("lyricsVi") || "").slice(0, 200_000);
    const isolateVocals = String(form.get("isolateVocals") ?? "1") !== "0";
    const model = String(form.get("model") || "base").slice(0, 32);

    if (!songId) {
      return NextResponse.json({ error: "songId_required" }, { status: 400 });
    }
    const verifiedLyricsVi = lyricsViRaw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 500);
    if (!verifiedLyricsVi.length) {
      return NextResponse.json({ error: "lyrics_required" }, { status: 400 });
    }

    let audioPath: string | null = null;
    let audioUrl = `/sing/${songId}.mp3`;

    const file = form.get("audio");
    if (file && typeof file !== "string" && "arrayBuffer" in file) {
      const size = typeof file.size === "number" ? file.size : 0;
      if (size > MAX_ALIGN_UPLOAD_BYTES) {
        return NextResponse.json({ error: "upload_too_large" }, { status: 413 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      if (buf.byteLength > MAX_ALIGN_UPLOAD_BYTES) {
        return NextResponse.json({ error: "upload_too_large" }, { status: 413 });
      }
      const ext = (file.name?.split(".").pop() || "mp3").toLowerCase();
      try {
        audioPath = uploadPath(songId, ext);
      } catch {
        return NextResponse.json({ error: "unsupported_audio" }, { status: 400 });
      }
      await fs.writeFile(audioPath, buf);
      audioUrl = `/api/sing/media/${songId}`;
    } else {
      const publicDir = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "sing");
      const publicMp3 = resolveUnderRoot(publicDir, `${songId}.mp3`);
      const publicWav = resolveUnderRoot(publicDir, `${songId}.wav`);
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

    const job = await runForcedAlignmentJob({
      songId,
      title: title || songId,
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
  } finally {
    endAlignJob();
  }
}
