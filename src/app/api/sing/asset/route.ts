import { NextResponse } from "next/server";
import { getSong } from "@/lib/sing/catalog";
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
 */
export async function GET(request: Request) {
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

  return NextResponse.json({
    ok: true,
    songId,
    type,
    url: gate.url,
    licenseStatus: song!.rights.status,
  });
}
