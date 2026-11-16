import type { EnglishLesson, LessonSpec, LessonStage } from "./lessonTypes";

const COMPLETION =
  "Xong bài khi bạn đã đi qua từng bước: nghe, nhận ra, nói theo, và phần ôn. Nói chưa rõ vẫn được đi tiếp. Không cần giọng bản ngữ.";

export function lessonId(day: number): string {
  return `d${String(day).padStart(2, "0")}`;
}

export function buildLesson(spec: LessonSpec): EnglishLesson {
  const id = lessonId(spec.day);
  const stages: LessonStage[] = [
    {
      id: `${id}-listen`,
      kind: "listen",
      instruction: "Nghe mẫu trước. Bạn chưa cần nói.",
      en: spec.focus.en,
      vi: spec.focus.vi,
      ipa: spec.focus.ipa,
      coach: spec.focus.coach,
    },
    {
      id: `${id}-recognize`,
      kind: "recognize",
      instruction: spec.recognize.instruction,
      en: spec.recognize.en,
      choices: spec.recognize.choices,
      answerId: spec.recognize.answerId,
    },
    {
      id: `${id}-repeat`,
      kind: "repeat",
      instruction: "Nghe lại, rồi nói theo. Bước này chưa chấm điểm.",
      en: spec.focus.en,
      vi: spec.focus.vi,
    },
    {
      id: `${id}-pronounce`,
      kind: "pronounce",
      instruction: "Nghe mẫu một lần nữa, rồi ghi âm. Bạn có thể thử lại hoặc đi tiếp.",
      en: spec.focus.en,
      vi: spec.focus.vi,
      ipa: spec.focus.ipa,
      coach: spec.focus.coach,
      target: spec.focus.en,
    },
    {
      id: `${id}-understand`,
      kind: "understand",
      instruction: spec.understand.instruction,
      choices: spec.understand.choices,
      answerId: spec.understand.answerId,
    },
  ];

  spec.alts?.forEach((alt, index) => {
    stages.push({
      id: `${id}-alt-${index + 1}`,
      kind: "listen",
      instruction: "Nghe thêm cụm này. Chưa cần nói.",
      en: alt.en,
      vi: alt.vi,
      ipa: alt.ipa,
      coach: alt.coach,
    });
  });

  stages.push(
    {
      id: `${id}-listen-sentence`,
      kind: "listen",
      instruction: "Nghe cả câu trước khi ghép.",
      en: spec.combine.tokens.join(" "),
      vi: spec.combine.vi,
    },
    {
      id: `${id}-combine`,
      kind: "combine",
      instruction: spec.combine.instruction,
      tokens: spec.combine.tokens,
      vi: spec.combine.vi,
    },
    {
      id: `${id}-converse`,
      kind: "converse",
      instruction: spec.converse.instruction,
      lines: spec.converse.lines,
    },
    {
      id: `${id}-review`,
      kind: "review",
      instruction: "Nghe lại những câu của bài. Bấm từng câu.",
      items: spec.review,
    },
  );

  return {
    id,
    day: spec.day,
    week: spec.week,
    titleEn: spec.titleEn,
    titleVi: spec.titleVi,
    objectives: spec.objectives,
    vocabulary: spec.vocabulary,
    targets: spec.targets,
    accent: "american",
    audio: "browser-en-US",
    stages,
    completionVi: COMPLETION,
  };
}

/** Stable shuffle so chip order is not already the answer. */
export function displayOrder(tokens: string[], seed: string): string[] {
  const copy = tokens.slice();
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  if (copy.join(" ") === tokens.join(" ") && copy.length > 1) {
    const first = copy[0];
    copy[0] = copy[1];
    copy[1] = first;
  }
  return copy;
}

export function combineCorrect(tokens: string[], picked: string[]): boolean {
  return picked.join(" ") === tokens.join(" ");
}
