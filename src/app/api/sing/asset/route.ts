import { NextResponse } from "next/server";
import { requireSingViewer } from "@/lib/karaoke/adminAuth";
import { getSong } from "@/lib/sing/catalog";
import { isPublicSingAssetPath } from "@/lib/sing/masters";
import { gateSongAsset } from "@/lib/sing/rights";

export const runtime = "nodejs";

const ASSET_TYPES = [
  "audio_original",
  "audio_instrumental",
  "cover_art",
  "lyric_timing",
] as const;

type AssetType = (typeof ASSET_TYPES)[number];

function isAssetType(v: string): v is AssetType {
  return (ASSET_TYPES as readonly string[]).includes(v);
}

/**
 * Server-side rights gate. Unlicensed / expired assets never return a playable URL.
 * Audio URLs always point at /api/sing/stream (never static /sing/*).
 */
export async function GET(request: Request) {
  const identity = await requireSingViewer(request);
  if (identity instanceof Response) return identity;

  const { searchParams } = new URL(request.url);
  const songId = searchParams.get("songId")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";

  if (!songId || !type || !isAssetType(type)) {
    return NextResponse.json({ error: "songId and type required" }, { status: 400 });
  }

  const song = getSong(songId);
  const gate = gateSongAsset(song, type);
  if (!gate.ok) {
    return NextResponse.json(
      {
        error: gate.reason,
        licenseStatus: gate.licenseStatus,
        denied: true,
      },
      { status: gate.status },
    );
  }

  if (isPublicSingAssetPath(gate.url)) {
    return NextResponse.json(
      { error: "Refusing to expose a public static audio path", denied: true },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    songId,
    type,
    url: gate.url,
    licenseStatus: song!.rights.status,
  });
}
