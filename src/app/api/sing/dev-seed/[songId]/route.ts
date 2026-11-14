import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { isDevReferenceSong } from "@/lib/sing/devMode";

export const runtime = "nodejs";

/**
 * LOCAL DEV ONLY — streams a gitignored MP3 from private-media into the browser
 * so Dev Mode can copy it into IndexedDB (blob URL). Never available in production.
 */
function allowDevSeed(request: Request): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  // Published / preview hosts must never serve commercial reference audio
  if (process.env.CURSOR_APP_ID || process.env.VERCEL || process.env.VERCEL_ENV) {
    return false;
  }
  const host = request.headers.get("host") || "";
  const okHost =
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost") ||
    host.startsWith("[::1]");
  return okHost;
}

const FILE_BY_SONG: Record<string, string> = {
  "ngay-mai-nguoi-ta-lay-chong": "ngay-mai-nguoi-ta-lay-chong.mp3",
  "hat-mua-vuong-van": "hat-mua-vuong-van.mp3",
};

export async function GET(
  request: Request,
  ctx: { params: Promise<{ songId: string }> },
) {
  if (!allowDevSeed(request)) {
    return NextResponse.json(
      { error: "Dev seed unavailable", denied: true },
      { status: 404 },
    );
  }

  const { songId } = await ctx.params;
  if (!isDevReferenceSong(songId) || !FILE_BY_SONG[songId]) {
    return NextResponse.json({ error: "Unknown reference song" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "private-media",
    "ami-sing",
    FILE_BY_SONG[songId],
  );
  if (!existsSync(filePath)) {
    return NextResponse.json(
      {
        error: "Seed file missing — copy MP3 into private-media/ami-sing/",
        pathHint: FILE_BY_SONG[songId],
      },
      { status: 404 },
    );
  }

  const size = statSync(filePath).size;
  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(size),
      "Cache-Control": "no-store, private",
      "X-Ami-Sing-Dev-Seed": "1",
    },
  });
}
