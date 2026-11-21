"use client";

import { useId, useState } from "react";
import { speakVietnamese } from "@/lib/audio";
import { vocabNativePathForWord, type PackWord } from "@/lib/vocabulary";
import { gradeTypedVi } from "@/lib/vocabulary/mastery";

type Props = {
  word: PackWord;
  onResult: (correct: boolean) => void;
};

export function ListenAndType({ word, onResult }: Props) {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  function play() {
    void speakVietnamese(word.vi, { nativePath: vocabNativePathForWord(word) });
  }

  function submit() {
    if (locked) return;
    const grade = gradeTypedVi(value, word.vi);
    if (grade.ok) {
      setFeedback("Correct!");
      setLocked(true);
      onResult(true);
      return;
    }
    setFeedback(grade.hint);
    if (grade.reason === "wrong_base") {
      setLocked(true);
      onResult(false);
    }
  }

  return (
    <div className="rounded-2xl bg-soft px-4 py-5">
      <p className="quiet-label">Listen & Type</p>
      <p className="mt-1 text-sm text-ink/60">Hear the word, then type Vietnamese (tones matter).</p>
      <button type="button" className="teacher-btn-secondary mt-4" onClick={play}>
        Play audio
      </button>
      <label className="mt-4 block" htmlFor={inputId}>
        <span className="sr-only">Vietnamese spelling</span>
        <input
          id={inputId}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-lg text-ink outline-none focus:border-coral"
          lang="vi"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          disabled={locked}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Type what you hear…"
        />
      </label>
      <button type="button" className="teacher-btn-primary mt-3 w-full" disabled={locked} onClick={submit}>
        Check
      </button>
      {feedback ? (
        <p className={`mt-3 text-sm ${feedback === "Correct!" ? "text-coral" : "text-ink/65"}`} role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
