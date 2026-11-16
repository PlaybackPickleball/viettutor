"use client";

import { useState } from "react";
import { BEGINNER_SONG } from "@/lib/english/song";
import { speakEnglish } from "@/lib/english/speakClient";
import { REPLAY_LABEL, SLOW_LABEL } from "@/lib/english/a11y";
import { HearPhrase } from "./HearPhrase";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";

export function EnglishSing() {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const line = BEGINNER_SONG.lines[index];

  async function play(slow: boolean) {
    setError(null);
    try {
      await speakEnglish(line.en, slow);
    } catch {
      setError("Máy này chưa đọc được câu hát. Bạn vẫn xem lời được.");
    }
  }

  return (
    <EnShell title={BEGINNER_SONG.titleVi}>
      <p className="text-lg">{BEGINNER_SONG.titleEn}</p>
      <p className="mt-3 text-lg">{BEGINNER_SONG.wordSync.noteVi}</p>
      <p className="mt-2 text-base">Bài hát gốc của lớp học. Không dùng bài có bản quyền.</p>
      <div className="en-panel mt-6 p-4">
        <HearPhrase text={line.en} size="display" />
        <p className="mt-2 text-base">Bấm từng từ để nghe.</p>
      </div>
      <p className="mt-2 text-xl">{line.vi}</p>
      <p className="mt-3 text-base">
        Câu {index + 1} / {BEGINNER_SONG.lines.length}
      </p>
      {error ? <p className="mt-2">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className={primaryBtn} onClick={() => void play(false)}>
          {REPLAY_LABEL}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => void play(true)}>
          {SLOW_LABEL}
        </button>
        <button type="button" className={secondaryBtn} disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Câu trước
        </button>
        <button
          type="button"
          className={secondaryBtn}
          disabled={index === BEGINNER_SONG.lines.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Câu sau
        </button>
      </div>
    </EnShell>
  );
}
