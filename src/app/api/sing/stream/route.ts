import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { requireSingViewer } from "@/lib/karaoke/adminAuth";
import { getSong } from "@/lib/sing/catalog";
import { resolveMasterFile } from "@/lib/sing/masters.server";
import { gateSongAsset } from "@/lib/sing/rights";
import { resolveUnderRoot, UPLOAD_DIR } from "@/lib/karaoke/store";
import { parseSafeSongId } from "@/lib/karaoke/safeId";

export const runtime = "nodejs";

const ASSET_TYPES = ["audio_original", "audio_instrumental"] as const;
type AudioAssetType = (typeof ASSET_TYPES)[number];

function isAudioType(v: string): v is AudioAssetType {
  return (ASSET_TYPES as readonly string[]).includes(v);
}

/**
 * Stream licensed masters after identity + Production-mode rights checks.
 * Files live under data/sing/masters (or karaoke uploads) — never public/.
 */
export async function GET(request: Request) {
  const identity = await requireSingViewer(request);
  if (identity instanceof Response) return identity;

  const { searchParams } = new URL(request.url);
  const songIdRaw = searchParams.get("songId")?.trim() ?? "";
  const typeRaw = searchParams.get("type")?.trim() ?? "audio_original";
  const songId = parseSafeSongId(songIdRaw);
  if (!songId || !isAudioType(typeRaw)) {
    return NextResponse.json({ error: "songId and type required" }, { status: 400 });
  }

  const song = getSong(songId);
  const gate = gateSongAsset(song, typeRaw);
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.reason, licenseStatus: gate.licenseStatus, denied: true },
      { status: gate.status },
    );
  }

  // Prefer catalog masters directory.
  if (song && typeRaw === "audio_original") {
    const master = await resolveMasterFile(song);
    if (master) {
      const buf = await fs.readFile(master.absolutePath);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": master.contentType,
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  }

  // Fallback: admin-uploaded file under data/karaoke/uploads
  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    const match = entries.find((f) => {
      const base = f.split(".")[0];
      return base === songId && /^[a-z0-9]+(?:-[a-z0-9]+)*\.(mp3|wav|m4a|ogg)$/i.test(f);
    });
    if (match) {
      const file = resolveUnderRoot(UPLOAD_DIR, match);
      const buf = await fs.readFile(file);
      const ext = match.split(".").pop()?.toLowerCase() ?? "mp3";
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
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch {
    // uploads dir may be absent
  }

  return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
}
