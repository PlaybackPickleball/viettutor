export type StageKind =
  | "listen"
  | "recognize"
  | "repeat"
  | "pronounce"
  | "understand"
  | "combine"
  | "converse"
  | "scenario"
  | "review"
  | "summary";

export type Choice = { id: string; label: string };

export type SpokenLine = {
  who: "teacher" | "learner";
  en: string;
  vi: string;
};

export type VocabItem = { en: string; vi: string; ipa?: string };

export type LessonStage =
  | {
      id: string;
      kind: "listen";
      instruction: string;
      en: string;
      vi: string;
      ipa?: string;
      coach?: string;
    }
  | {
      id: string;
      kind: "recognize";
      instruction: string;
      en: string;
      choices: Choice[];
      answerId: string;
    }
  | {
      id: string;
      kind: "repeat";
      instruction: string;
      en: string;
      vi: string;
    }
  | {
      id: string;
      kind: "pronounce";
      instruction: string;
      en: string;
      vi: string;
      ipa?: string;
      coach?: string;
      target: string;
    }
  | {
      id: string;
      kind: "understand";
      instruction: string;
      choices: Choice[];
      answerId: string;
    }
  | {
      id: string;
      kind: "combine";
      instruction: string;
      tokens: string[];
      vi: string;
    }
  | {
      id: string;
      kind: "converse";
      instruction: string;
      lines: SpokenLine[];
    }
  | {
      id: string;
      kind: "scenario";
      instruction: string;
      scenarioId: string;
    }
  | {
      id: string;
      kind: "review";
      instruction: string;
      items: { en: string; vi: string }[];
    }
  | {
      id: string;
      kind: "summary";
      instruction: string;
      phrases: string[];
    };

export type EnglishLesson = {
  id: string;
  day: number;
  week: number;
  titleEn: string;
  titleVi: string;
  objectives: string[];
  vocabulary: VocabItem[];
  /** Phrases the pronounce step is aiming at. American English. */
  targets: string[];
  accent: "american";
  /** Model audio is spoken in the browser. There is no studio file. */
  audio: "browser-en-US";
  stages: LessonStage[];
  completionVi: string;
};

export type Phrase = { en: string; vi: string; ipa?: string; coach?: string };

export type LessonSpec = {
  day: number;
  week: number;
  titleEn: string;
  titleVi: string;
  objectives: string[];
  vocabulary: VocabItem[];
  targets: string[];
  focus: Phrase;
  alts?: Phrase[];
  recognize: { instruction: string; en: string; choices: Choice[]; answerId: string };
  understand: { instruction: string; choices: Choice[]; answerId: string };
  combine: { instruction: string; tokens: string[]; vi: string };
  converse: { instruction: string; lines: SpokenLine[] };
  review: { en: string; vi: string }[];
};
