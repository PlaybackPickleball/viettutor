"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { ENGLISH_KARAOKE_MODES } from "@/lib/english/karaokeModes";
import { loadEnglishKaraoke, markKaraokeMode, toggleSavedSong } from "@/lib/english/karaokeProgress";
import { getEnglishSong, wordSyncClaimed } from "@/lib/english/song";
import { speakEnglish, stopEnglishSpeech } from "@/lib/english/speakClient";
import type { SingMode } from "@/lib/sing/types";
import { HearPhrase } from "./HearPhrase";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";
import { SpeakTake } from "./SpeakTake";

export function EnglishKaraoke({ songId }: { songId: string }) {
  const song = getEnglishSong(songId);
  const [mode, setMode] = useState<SingMode>("listen");
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!song) return;
    setSaved(loadEnglishKaraoke(browserStore()).savedIds.includes(song.id));
    return () => stopEnglishSpeech();
  }, [song]);

  if (!song) {
    return (
      <EnShell title="Không thấy bài hát" backHref="/en/sing" backLabel="Danh sách bài hát">
        <Link href="/en/sing" className={primaryBtn}>
          Về danh sách
        </Link>
      </EnShell>
    );
  }

  const currentSong = song;
  const line = currentSong.lines[index] ?? currentSong.lines[0];
  const sync = wordSyncClaimed(currentSong);

  async function playLine(slow: boolean) {
    if (!line) return;
    setError(null);
    setPlaying(true);
    try {
      await speakEnglish(line.en, slow);
    } catch {
      setError("Máy này chưa đọc được câu hát. Bạn vẫn xem lời được.");
    } finally {
      setPlaying(false);
    }
  }

  async function playAll() {
    setError(null);
    setPlaying(true);
    try {
      for (let i = 0; i < currentSong.lines.length; i += 1) {
        setIndex(i);
        await speakEnglish(currentSong.lines[i].en, false);
      }
      markKaraokeMode(browserStore(), currentSong.id, "listen");
    } catch {
      setError("Máy này chưa đọc được câu hát. Bạn vẫn xem lời được.");
    } finally {
      setPlaying(false);
    }
  }

  function finishMode() {
    markKaraokeMode(browserStore(), currentSong.id, mode);
  }

  return (
    <EnShell title={currentSong.titleVi} backHref="/en/sing" backLabel="Danh sách bài hát">
      <p className="text-lg" lang="en">
        {currentSong.titleEn}
      </p>
      <p className="mt-2 text-base">{currentSong.summaryVi}</p>
      <p className="mt-2 text-base">{currentSong.wordSync.noteVi}</p>
      {sync ? null : <p className="mt-2 text-base">Bài hát gốc của lớp học. Không dùng bài có bản quyền.</p>}

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Cách luyện">
        {ENGLISH_KARAOKE_MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? "en-btn en-btn-primary px-4" : "en-btn en-btn-secondary px-4"}
            aria-pressed={mode === item.id}
            onClick={() => {
              stopEnglishSpeech();
              setMode(item.id);
              setIndex(0);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-base">{ENGLISH_KARAOKE_MODES.find((item) => item.id === mode)?.hint}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={secondaryBtn}
          onClick={() => {
            const next = toggleSavedSong(browserStore(), currentSong.id);
            setSaved(next.savedIds.includes(song.id));
          }}
        >
          {saved ? "Đã lưu" : "Lưu bài"}
        </button>
      </div>

      {line ? (
        <section className="en-panel mt-5 p-4">
          <p className="text-sm font-semibold text-[var(--en-leaf)]">
            Câu {index + 1} / {currentSong.lines.length}
          </p>
          <div className="mt-3">
            <HearPhrase text={line.en} size="display" />
          </div>
          {mode === "understand" || mode === "improve" || mode === "sing" ? (
            <p className="mt-3 text-xl">{line.vi}</p>
          ) : null}
          <p className="mt-2 text-base">Bấm từng từ để nghe.</p>
        </section>
      ) : null}
      {error ? <p className="mt-3">{error}</p> : null}

      {mode === "listen" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={primaryBtn} disabled={playing} onClick={() => void playAll()}>
            Nghe cả bài
          </button>
          <button type="button" className={secondaryBtn} disabled={playing} onClick={() => void playLine(true)}>
            Nghe chậm câu này
          </button>
        </div>
      ) : null}

      {mode === "sing" ? (
        <div className="mt-4 space-y-3">
          <p>Hát theo câu trên. App không chấm cao độ và chưa có nhạc đệm.</p>
          <button type="button" className={primaryBtn} disabled={playing} onClick={() => void playLine(false)}>
            Nghe câu rồi hát
          </button>
        </div>
      ) : null}

      {mode === "speak" && line ? (
        <div className="mt-4">
          <SpeakTake
            key={`${song.id}-${line.id}`}
            expected={line.en}
            lessonId={`karaoke-${currentSong.id}`}
            score={false}
            onContinue={() => {
              markKaraokeMode(browserStore(), currentSong.id, "speak");
              setIndex((value) => Math.min(value + 1, currentSong.lines.length - 1));
            }}
          />
        </div>
      ) : null}

      {mode === "improve" ? (
        <ul className="mt-4 space-y-3">
          {currentSong.lines.map((item, itemIndex) => (
            <li key={item.id} className="en-panel p-4">
              <HearPhrase text={item.en} />
              <p className="mt-2 text-lg">{item.vi}</p>
              <button type="button" className={`${secondaryBtn} mt-3`} onClick={() => setIndex(itemIndex)}>
                Chọn câu này
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {mode !== "speak" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={secondaryBtn} disabled={index === 0} onClick={() => setIndex(index - 1)}>
            Câu trước
          </button>
          <button
            type="button"
            className={secondaryBtn}
            disabled={index >= currentSong.lines.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            Câu sau
          </button>
          <button type="button" className={primaryBtn} onClick={finishMode}>
            Xong phần này
          </button>
        </div>
      ) : null}
    </EnShell>
  );
}
