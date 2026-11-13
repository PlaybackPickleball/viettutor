"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { analyzeImageWithAi } from "@/lib/services/analyzeClient";
import { fileToCompressedDataUrl } from "@/lib/services/imageCompress";
import { DEMO_READING_TEXT, extractVietnameseFromImage } from "@/lib/services/ocrService";
import { saveReadingLesson } from "@/lib/vocab/store";

export function ScanClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function onPick(f: File | null) {
    if (!f) return;
    setError(null);
    setNote(null);
    setStatus(null);
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  async function scan() {
    if (!file) {
      setError("Take a photo or upload an image first.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    setStatus("Preparing photo…");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);

      setStatus("AI reading Vietnamese…");
      const ai = await analyzeImageWithAi(dataUrl);

      if (ai.ok) {
        const lesson = {
          id: `lesson-${Date.now()}`,
          imageName: file.name,
          rawOcr: ai.data.text,
          correctedText: ai.data.text,
          createdAt: new Date().toISOString(),
          provider: ai.data.provider,
          translation: ai.data.translation,
          aiSegments: ai.data.segments,
        };
        saveReadingLesson(lesson);
        router.push("/scan/review");
        return;
      }

      // Soft fallbacks: unconfigured / unsigned-in / no text → on-device OCR
      if (ai.status === 401 || ai.status === 403) {
        setNote("Sign in on the published app for AI analysis. Falling back to on-device OCR…");
      } else if (ai.code === "ai_unconfigured") {
        setNote("AI key not bound yet — using on-device OCR. Add the key to unlock Vision analysis.");
      } else if (ai.code === "no_text") {
        setNote(ai.message);
      } else {
        setNote(`AI unavailable (${ai.message}). Using on-device OCR…`);
      }

      setStatus("On-device OCR (Tesseract)…");
      const result = await extractVietnameseFromImage(file);
      const text = result.text.trim() || DEMO_READING_TEXT;
      if (!result.text.trim()) {
        setNote(
          "OCR found little text — loaded a demo sentence you can edit. Replace it with your corrected OCR.",
        );
      }
      const lesson = {
        id: `lesson-${Date.now()}`,
        imageName: file.name,
        rawOcr: result.text.trim(),
        correctedText: text,
        createdAt: new Date().toISOString(),
        provider: result.provider,
      };
      saveReadingLesson(lesson);
      router.push("/scan/review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed. Try a clearer photo.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">Scan & Read</h1>
      <p className="mt-2 text-ink/60">
        Photograph Vietnamese around you — menus, signs, books — then learn word by word with AI.
      </p>

      <div className="ami-card mt-6 overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected for scan" className="max-h-64 w-full object-cover" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-soft px-4 text-center text-sm text-ink/45">
            Camera preview or uploaded image appears here
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="teacher-btn-primary"
          onClick={() => cameraRef.current?.click()}
        >
          Take photo
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Upload image
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className="teacher-btn-amber mt-4 w-full disabled:opacity-40"
        disabled={!file || busy}
        onClick={scan}
      >
        {busy ? status || "Scanning…" : "Scan with AI"}
      </button>

      <Link href="/scan/review?demo=1" className="teacher-btn-secondary mt-3 w-full text-center">
        Try demo sentence (no photo)
      </Link>

      {note ? <p className="mt-3 text-sm text-ink/55">{note}</p> : null}
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}

      <p className="mt-6 text-xs text-ink/40">
        On the published app (signed in), AI Vision extracts text and beginner meanings. If AI is
        unavailable, on-device Tesseract OCR still works — always correct diacritics before studying.
      </p>

      <Link href="/" className="teacher-btn-secondary mt-8 w-full text-center">
        Back home
      </Link>
    </div>
  );
}
