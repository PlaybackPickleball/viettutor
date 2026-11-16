"use client";

import { useRef, useState } from "react";
import { ScanCropper, DEFAULT_CROP } from "@/components/ScanCropper";
import { browserStore } from "@/lib/experience/store";
import { lookupGloss } from "@/lib/english/curriculum";
import { interpretOcr, splitWords, teachGate } from "@/lib/english/ocrGate";
import { loadEnglishProgress, saveEnglishProgress, upsertReview } from "@/lib/english/progress";
import { speakEnglish } from "@/lib/english/speakClient";
import { dataUrlToBlob, fileToCompressedDataUrl, type CropRect } from "@/lib/services/imageCompress";
import { extractEnglishFromImage } from "@/lib/services/ocrService";
import { HearPhrase } from "./HearPhrase";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";

type Teach = {
  text: string;
  translation: string | null;
  translationError: string | null;
};

export function EnglishScan() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropRect>(DEFAULT_CROP);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [teach, setTeach] = useState<Teach | null>(null);
  const [aiReady, setAiReady] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  function onPick(next: File | null) {
    if (!next) return;
    setError(null);
    setTeach(null);
    setConfirmed(false);
    setSaved(null);
    setFile(next);
    setCrop(DEFAULT_CROP);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(next));
  }

  async function readPhoto() {
    if (!file) {
      setError("Hãy chọn một ảnh có chữ tiếng Anh.");
      return;
    }
    setBusy(true);
    setError(null);
    setTeach(null);
    setConfirmed(false);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 1600, 0.82, crop);
      const blob = await dataUrlToBlob(dataUrl);
      const result = await extractEnglishFromImage(blob);
      const read = interpretOcr(result.text, null);
      if (read.status !== "needs_confirm") {
        setDraft("");
        setError(read.message);
        return;
      }
      setDraft(read.text);
    } catch {
      const read = interpretOcr(null, "failed");
      setError(read.status === "error" ? read.message : "Không đọc được ảnh.");
    } finally {
      setBusy(false);
    }
  }

  function confirmText() {
    const gate = teachGate(draft, true);
    if (!gate.ok) {
      setError(gate.message);
      return;
    }
    setConfirmed(true);
    setTeach({ text: draft.trim(), translation: null, translationError: null });
    setError(null);
    void fetch("/api/english/status")
      .then((res) => (res.ok ? res.json() : { ai: false }))
      .then((data: { ai?: boolean }) => setAiReady(Boolean(data.ai)))
      .catch(() => setAiReady(false));
  }

  async function translate() {
    if (!teach) return;
    setTeach({ ...teach, translationError: null });
    try {
      const res = await fetch("/api/english/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: teach.text }),
      });
      const data = (await res.json()) as { ok?: boolean; translationVi?: string; message?: string };
      if (!res.ok || !data.ok || !data.translationVi) {
        setTeach({ ...teach, translationError: data.message || "Chưa dịch được câu này." });
        return;
      }
      setTeach({ ...teach, translation: data.translationVi, translationError: null });
    } catch {
      setTeach({ ...teach, translationError: "Chưa dịch được câu này." });
    }
  }

  function saveWord(en: string, vi: string) {
    const store = browserStore();
    const progress = upsertReview(
      loadEnglishProgress(store),
      { en, vi, lessonId: "scan", category: "needs_practice" },
      new Date().toISOString().slice(0, 10),
    );
    saveEnglishProgress(progress, store);
    setSaved(en);
  }

  const words = teach ? splitWords(teach.text) : [];

  return (
    <EnShell title="Đọc chữ tiếng Anh">
      <p className="text-lg">Chụp chữ tiếng Anh. Đọc lại và xác nhận trước khi học. Không có câu mẫu nếu ảnh không ra chữ.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={primaryBtn} onClick={() => cameraRef.current?.click()}>
          Chụp ảnh
        </button>
        <button type="button" className={secondaryBtn} onClick={() => fileRef.current?.click()}>
          Chọn ảnh
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
      />
      {preview ? (
        <div className="mt-4">
          <ScanCropper src={preview} crop={crop} onChange={setCrop} />
          <button type="button" className={`${primaryBtn} mt-4`} disabled={busy} onClick={() => void readPhoto()}>
            {busy ? "Đang đọc…" : "Đọc vùng đã chọn"}
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="mt-4" role="status">
          {error}
        </p>
      ) : null}
      {draft && !teach ? (
        <div className="mt-5 space-y-3">
          <label className="block text-lg" htmlFor="ocr-draft">
            Sửa chữ nếu máy đọc sai, rồi xác nhận.
          </label>
          <textarea
            id="ocr-draft"
            className="en-panel min-h-28 w-full bg-white p-3 text-lg"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setConfirmed(false);
            }}
          />
          <button type="button" className={primaryBtn} onClick={confirmText}>
            Đúng rồi, học đoạn này
          </button>
        </div>
      ) : null}
      {teach && confirmed ? (
        <div className="mt-5 space-y-4">
          <div className="en-panel p-4">
            <HearPhrase text={teach.text} size="display" />
            <p className="mt-2 text-base">Bấm từng từ để nghe.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} onClick={() => void speakEnglish(teach.text, false)}>
              Nghe lại
            </button>
            <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(teach.text, true)}>
              Nghe chậm
            </button>
            {aiReady ? (
              <button type="button" className={secondaryBtn} onClick={() => void translate()}>
                Xin bản dịch câu
              </button>
            ) : (
              <p>Chưa có bản dịch cả câu. Bấm từng từ để xem nghĩa đã có trong bài học.</p>
            )}
          </div>
          {teach.translation ? <p>{teach.translation}</p> : null}
          {teach.translationError ? <p>{teach.translationError}</p> : null}
          <ul className="space-y-2">
            {words.map((word, index) => {
              const gloss = lookupGloss(word);
              return (
                <li key={`${word}-${index}`}>
                  <button
                    type="button"
                    className={`${secondaryBtn} w-full justify-between`}
                    onClick={() => void speakEnglish(word, true)}
                  >
                    <span lang="en">{word}</span>
                    <span>{gloss ?? "Chưa có trong bài học"}</span>
                  </button>
                  {gloss ? (
                    <button type="button" className={`${secondaryBtn} mt-2`} onClick={() => saveWord(word, gloss)}>
                      Lưu để ôn
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {saved ? <p>Đã lưu “{saved}” vào phần ôn.</p> : null}
        </div>
      ) : null}
    </EnShell>
  );
}
