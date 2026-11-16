"use client";

import { useState } from "react";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { getLatinLetter, LATIN_LETTERS } from "@/lib/english/alphabet";
import { speakEnglish } from "@/lib/english/speakClient";
import { HearPhrase } from "./HearPhrase";
import { EnShell, secondaryBtn } from "./EnShell";

export function EnglishWrite() {
  const [grapheme, setGrapheme] = useState("a");
  const letter = getLatinLetter(grapheme) ?? LATIN_LETTERS[0];

  return (
    <EnShell title="Chữ cái tiếng Anh">
      <p className="text-lg">
        Tên chữ và âm trong từ không phải lúc nào cũng giống nhau. Phần này là luyện tay, không chấm chữ.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {LATIN_LETTERS.map((item) => (
          <button
            key={item.grapheme}
            type="button"
            className={item.grapheme === letter.grapheme ? "en-btn en-btn-primary px-3" : "en-btn en-btn-secondary px-3"}
            onClick={() => {
              setGrapheme(item.grapheme);
              void speakEnglish(item.nameEn, true);
            }}
          >
            {item.grapheme.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        <p className="en-instruction">{letter.nameVi}</p>
        <p>
          Ví dụ: <HearPhrase text={letter.exampleEn} /> — {letter.exampleVi}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(letter.nameEn, true)}>
            Nghe tên chữ
          </button>
          <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(letter.exampleEn, true)}>
            Nghe từ ví dụ
          </button>
        </div>
      </div>
      <div className="mt-5">
        <LetterTraceCanvas
          grapheme={letter.grapheme}
          strokes={letter.strokes}
          praiseMode="unrecognized"
          clearLabel="Xóa"
          idleHint="Tô theo mẫu bằng ngón tay hoặc chuột. Ứng dụng chưa nhận dạng chữ."
        />
      </div>
    </EnShell>
  );
}
