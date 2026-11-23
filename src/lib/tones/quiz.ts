import { southernListeningAccepts, TONE_CARDS, getToneCard } from "./catalog";
import type { ToneDialect, ToneId, ToneQuizQuestion } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function distractorTones(target: ToneId, n: number): ToneId[] {
  return shuffle(TONE_CARDS.map((c) => c.id).filter((id) => id !== target)).slice(0, n);
}

/** 4–5 short items for a single-tone lesson mini-quiz. */
export function buildToneLessonQuiz(toneId: ToneId, dialect: ToneDialect): ToneQuizQuestion[] {
  const card = getToneCard(toneId);
  if (!card) return [];
  const others = distractorTones(toneId, 2);
  const listenAccept =
    dialect === "southern" ? southernListeningAccepts(toneId) : [toneId];

  const listenChoices = shuffle([
    { id: toneId, label: card.nameVi, glossEn: card.nameEn },
    ...others.map((id) => {
      const c = getToneCard(id)!;
      return { id, label: c.nameVi, glossEn: c.nameEn };
    }),
  ]);

  const markChoices = shuffle([
    { id: toneId, label: card.markChar === "—" ? "(none)" : card.markChar, glossEn: card.markNameEn },
    ...others.map((id) => {
      const c = getToneCard(id)!;
      return {
        id,
        label: c.markChar === "—" ? "(none)" : c.markChar,
        glossEn: c.markNameEn,
      };
    }),
  ]);

  const formChoices = shuffle([
    { id: toneId, label: card.written, glossEn: card.meaningEn },
    ...others.map((id) => {
      const c = getToneCard(id)!;
      return { id, label: c.written, glossEn: c.meaningEn };
    }),
  ]);

  const qs: ToneQuizQuestion[] = [
    {
      id: `${toneId}-listen`,
      kind: "listen-choose",
      promptEn: `Listen — which tone is this?`,
      toneId,
      audioUtterance: card.utterance,
      options: listenChoices,
      correctOptionId: toneId,
      acceptOptionIds: listenAccept,
      hintEn:
        dialect === "southern" && (toneId === "hoi" || toneId === "nga")
          ? "Southern hỏi/ngã often merge — either is accepted when listening."
          : `That was ${card.nameVi} (${card.written}).`,
    },
    {
      id: `${toneId}-mark`,
      kind: "select-mark",
      promptEn: `Which written mark is ${card.nameVi}?`,
      toneId,
      options: markChoices,
      correctOptionId: toneId,
      hintEn: card.strokeGuideEn,
    },
    {
      id: `${toneId}-type`,
      kind: "type-form",
      promptEn: `Type the ${card.nameVi} form (with diacritics).`,
      toneId,
      expectedWritten: card.written,
      hintEn: `Answer: ${card.written} — ${card.meaningEn}`,
    },
    {
      id: `${toneId}-form`,
      kind: "listen-choose",
      promptEn: `Which writing matches ${card.nameVi}?`,
      toneId,
      audioUtterance: card.utterance,
      options: formChoices,
      correctOptionId: toneId,
      hintEn: `${card.written} · ${card.meaningEn}`,
    },
    {
      id: `${toneId}-trace`,
      kind: "trace-stamp",
      promptEn: `Trace the ${card.nameVi} mark (shape practice — not scored for accuracy).`,
      toneId,
      hintEn: card.strokeGuideEn,
    },
  ];
  return qs;
}

/** Final mastery test — five listening/select items across the six tones. */
export function buildMasteryQuiz(dialect: ToneDialect): ToneQuizQuestion[] {
  const picks = shuffle(TONE_CARDS).slice(0, 5);
  return picks.map((card, i) => {
    const others = distractorTones(card.id, 2);
    const accept =
      dialect === "southern" ? southernListeningAccepts(card.id) : [card.id];
    return {
      id: `mastery-${i}-${card.id}`,
      kind: "listen-choose" as const,
      promptEn: "Listen — identify the tone.",
      toneId: card.id,
      audioUtterance: card.utterance,
      options: shuffle([
        { id: card.id, label: card.nameVi, glossEn: card.written },
        ...others.map((id) => {
          const c = getToneCard(id)!;
          return { id, label: c.nameVi, glossEn: c.written };
        }),
      ]),
      correctOptionId: card.id,
      acceptOptionIds: accept,
      hintEn: `${card.written} · ${card.nameVi}`,
    };
  });
}

export function gradeToneChoice(
  question: ToneQuizQuestion,
  optionId: string,
): { ok: boolean; note?: string } {
  if (question.acceptOptionIds?.includes(optionId)) {
    const exact = optionId === question.correctOptionId;
    return {
      ok: true,
      note: exact
        ? undefined
        : "Accepted — Southern hỏi/ngã often merge; writing still differs.",
    };
  }
  return { ok: optionId === question.correctOptionId };
}
