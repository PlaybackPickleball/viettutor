import { NextResponse } from "next/server";
import { cleanupOcrText } from "@/lib/services/ocrService";

/**
 * Optional Google Cloud Vision OCR.
 * Without GOOGLE_CLOUD_VISION_API_KEY, clients should use Tesseract in-browser.
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        provider: "none",
        message:
          "GOOGLE_CLOUD_VISION_API_KEY not set. Use on-device Tesseract OCR in the Scan screen.",
      },
      { status: 501 },
    );
  }

  try {
    const body = (await req.json()) as { imageBase64?: string };
    if (!body.imageBase64) {
      return NextResponse.json({ ok: false, message: "imageBase64 required" }, { status: 400 });
    }

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: body.imageBase64.replace(/^data:image\/\w+;base64,/, "") },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
              imageContext: { languageHints: ["vi"] },
            },
          ],
        }),
      },
    );

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return NextResponse.json(
        { ok: false, provider: "google-vision", message: errText.slice(0, 400) },
        { status: 502 },
      );
    }

    const data = (await visionRes.json()) as {
      responses?: { fullTextAnnotation?: { text?: string } }[];
    };
    const text = cleanupOcrText(data.responses?.[0]?.fullTextAnnotation?.text ?? "");
    return NextResponse.json({
      ok: true,
      provider: "google-vision",
      text,
      note: "Correct any OCR mistakes before studying. Uncertain glyphs were not invented.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "OCR failed" },
      { status: 500 },
    );
  }
}
