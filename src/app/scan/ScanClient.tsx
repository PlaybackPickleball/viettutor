"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { DEFAULT_CROP, ScanCropper } from "@/components/ScanCropper";
import { analyzeImageWithAi } from "@/lib/services/analyzeClient";
import {
  dataUrlToBlob,
  fileToCompressedDataUrl,
  type CropRect,
} from "@/lib/services/imageCompress";
import { DEMO_READING_TEXT, extractVietnameseFromImage } from "@/lib/services/ocrService";
import { saveReadingLesson } from "@/lib/vocab/store";

export function ScanClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropRect>(DEFAULT_CROP);
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
    setCrop(DEFAULT_CROP);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  async function scan() {
    if (!file || !preview) {
      setError("Take a photo or upload an image first.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    setStatus("Cropping selected text…");
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 1600, 0.82, crop);

      setStatus("AI reading selected Vietnamese…");
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
        router.push("/scan/read");
        return;
      }

      if (ai.status === 401 || ai.status === 403) {
        setNote("Sign in on the published app for AI analysis. Falling back to on-device OCR…");
      } else if (ai.code === "ai_unconfigured") {
        setNote("AI key not bound yet — using on-device OCR.");
      } else if (ai.code === "no_text" || ai.code === "noisy_text") {
        setNote(ai.message);
      } else {
        setNote(`AI unavailable (${ai.message}). Using on-device OCR…`);
      }

      setStatus("On-device OCR on your selection…");
      const blob = await dataUrlToBlob(dataUrl);
      const result = await extractVietnameseFromImage(blob);
      const text = result.text.trim() || DEMO_READING_TEXT;
      if (!result.text.trim()) {
        setNote(
          "OCR found little text in the selection — loaded a demo sentence. Drag the box onto clearer text and try again, or edit the result.",
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
      router.push("/scan/read");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed. Try a clearer crop of the text.");
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
        Photograph Vietnamese, then drag the box onto the words you want to learn.
      </p>

      <div className="ami-card mt-6 overflow-hidden">
        {preview ? (
          <ScanCropper src={preview} crop={crop} onChange={setCrop} />
        ) : (
          <div className="flex h-48 items-center justify-center bg-soft px-4 text-center text-sm text-ink/45">
            Camera preview or uploaded image appears here
          </div>
        )}
      </div>

      {preview ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="teacher-btn-secondary py-2 text-sm"
            onClick={() => setCrop(DEFAULT_CROP)}
            disabled={busy}
          >
            Reset selection
          </button>
          <button
            type="button"
            className="teacher-btn-secondary py-2 text-sm"
            onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })}
            disabled={busy}
          >
            Use full photo
          </button>
        </div>
      ) : null}

      <p className="mt-3 text-sm text-ink/50">
        {preview
          ? "Drag the coral box (or its corners) over only the Vietnamese text — ignore browser tabs, ads, or other UI."
          : "Take a photo or upload, then select the text area."}
      </p>

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
        {busy ? status || "Scanning…" : "Scan selected text"}
      </button>

      <Link href="/scan/read?demo=1" className="teacher-btn-secondary mt-3 w-full text-center">
        Try demo sentence (no photo)
      </Link>

      {note ? <p className="mt-3 text-sm text-ink/55">{note}</p> : null}
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}

      <p className="mt-6 text-xs text-ink/40">
        Only the area inside the box is sent for AI reading. Closer crops of signs and menus work
        best — always fix diacritics on the next screen before studying.
      </p>

      <Link href="/" className="teacher-btn-secondary mt-8 w-full text-center">
        Back home
      </Link>
    </div>
  );
}
