"use client";

import { useMemo, useState } from "react";
import { ListenControls } from "@/components/ListenControls";
import {
  buildToneLessonQuiz,
  getToneCard,
  gradeToneChoice,
  southernListeningAccepts,
  TONE_CARDS,
  type ToneDialect,
} from "@/lib/tones";

type Props = {
  dialect: ToneDialect;
  onComplete?: (correct: number, total: number) => void;
};

/** Exercise A — listen and choose the tone / syllable. */
export function ToneListeningQuiz({ dialect, onComplete }: Props) {
  const items = useMemo(() => {
    const picks = [...TONE_CARDS].sort(() => Math.random() - 0.5).slice(0, 6);
    return picks.map((card) => {
      const accept =
        dialect === "southern" ? southernListeningAccepts(card.id) : [card.id];
      const options = [...TONE_CARDS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => ({ id: c.id, label: c.written, glossEn: c.nameVi }));
      if (!options.some((o) => o.id === card.id)) {
        options[0] = { id: card.id, label: card.written, glossEn: card.nameVi };
      }
      return {
        id: card.id,
        utterance: card.utterance,
        options: options.sort(() => Math.random() - 0.5),
        accept,
        hint: card.nameVi,
      };
    });
  }, [dialect]);

  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const item = items[i];

  if (!item) return null;

  return (
    <section className="space-y-3">
      <p className="quiet-label">
        Exercise A · Listen & choose · {i + 1} / {items.length}
      </p>
      <ListenControls text={item.utterance} />
      <div className="grid grid-cols-1 gap-2">
        {item.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={Boolean(feedback)}
            className="ami-card px-4 py-3 text-left"
            onClick={() => {
              const q = {
                id: "a",
                kind: "listen-choose" as const,
                promptEn: "",
                toneId: item.id,
                correctOptionId: item.id,
                acceptOptionIds: item.accept,
                hintEn: item.hint,
              };
              const { ok, note } = gradeToneChoice(q, opt.id);
              setCorrect((c) => c + (ok ? 1 : 0));
              setFeedback(ok ? note ?? "Correct." : `Not quite — ${item.hint}.`);
            }}
          >
            <span className="font-hand text-2xl" lang="vi">
              {opt.label}
            </span>
            <span className="mt-0.5 block text-xs text-ink/45">{opt.glossEn}</span>
          </button>
        ))}
      </div>
      {feedback ? (
        <>
          <p className="text-sm text-ink/70">{feedback}</p>
          <button
            type="button"
            className="teacher-btn-primary w-full"
            onClick={() => {
              setFeedback(null);
              if (i + 1 >= items.length) {
                onComplete?.(correct, items.length);
                return;
              }
              setI((n) => n + 1);
            }}
          >
            {i + 1 >= items.length ? "Done" : "Next"}
          </button>
        </>
      ) : null}
    </section>
  );
}

/** Tiny helper export so lesson quizzes can reuse grading — silence unused warn. */
export function toneLessonQuizPreview(toneId: string, dialect: ToneDialect) {
  const card = getToneCard(toneId);
  if (!card) return [];
  return buildToneLessonQuiz(card.id, dialect);
}
