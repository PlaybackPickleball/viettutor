/**
 * Dấu Thanh curriculum — six tone categories on the ma family.
 * Six tones ≠ five written marks (ngang has no mark).
 * Contours are teaching animations; mark shapes are mnemonics, not pitch graphs.
 * Southern hỏi/ngã often merge — never score a legitimate regional merge as wrong.
 */

import type { ToneCard, ToneChapterId, ToneDialect, ToneId } from "./types";

export const TONE_MASTERY_THRESHOLD = 0.8;

export const TONE_IDS: ToneId[] = ["ngang", "sac", "huyen", "hoi", "nga", "nang"];

export const TONE_CHAPTERS: {
  id: ToneChapterId;
  order: number;
  titleEn: string;
  blurbEn: string;
}[] = [
  {
    id: "intro",
    order: 1,
    titleEn: "The 6 Vietnamese tones",
    blurbEn: "Same letters. Different tones. Different meanings.",
  },
  {
    id: "pitch",
    order: 2,
    titleEn: "Your natural speaking pitch",
    blurbEn: "Tones move relative to your voice — not a fixed frequency.",
  },
  {
    id: "tones",
    order: 3,
    titleEn: "Learn each tone",
    blurbEn: "Listen, see the curve, write the mark, and say it.",
  },
  {
    id: "regional",
    order: 4,
    titleEn: "Southern & Northern",
    blurbEn: "Six written categories — some accents merge hỏi and ngã.",
  },
  {
    id: "diacritics",
    order: 5,
    titleEn: "Tone marks vs vowel marks",
    blurbEn: "ă â ê ô ơ ư change the vowel; ´ ` ̉ ~ . change the tone.",
  },
  {
    id: "practice",
    order: 6,
    titleEn: "Practice & mastery",
    blurbEn: "Listen, match graphs, write, pronounce, then quiz ≥80%.",
  },
];

export const TONE_CARDS: ToneCard[] = [
  {
    id: "ngang",
    journeyLessonId: "u2-l01",
    order: 1,
    nameVi: "ngang",
    nameEn: "level",
    written: "ma",
    meaningEn: "ghost",
    meaningVi: "ma",
    utterance: "ma",
    markChar: "—",
    markNameEn: "no mark",
    strokeGuideEn: "Ngang has no written tone mark — leave the vowel unmarked.",
    contourHintEn: "Stay level around your natural speaking pitch.",
    voiceCueEn: "Keep a level voice.",
    teachEn:
      "Ngang has no written tone mark. Keep your voice relatively level around your natural speaking pitch — not higher or lower than usual.",
    pitchPath: "M 12 50 H 88",
    markStrokePath: "",
    northernNoteEn: "Clear level mid pitch.",
    southernNoteEn: "Also level; stay steady — don’t add a fall.",
    rowClass: "bg-[#e8f4f1]",
    accentStroke: "#2a9d8f",
    skillId: "tone-ngang",
  },
  {
    id: "sac",
    journeyLessonId: "u2-l02",
    order: 2,
    nameVi: "sắc",
    nameEn: "rising",
    written: "má",
    meaningEn: "mother (Southern Vietnamese)",
    meaningVi: "má",
    utterance: "má",
    markChar: "´",
    markNameEn: "acute (sắc)",
    strokeGuideEn: "Write a short diagonal stroke rising from left to right.",
    contourHintEn: "Rise toward a higher pitch by the end.",
    voiceCueEn: "Raise your voice (↗).",
    teachEn:
      "Sắc is a rising tone. Start near your natural pitch and let your voice rise toward a higher pitch. The written mark is a short diagonal stroke rising left to right.",
    pitchPath: "M 12 62 Q 48 48 88 18",
    markStrokePath: "M 28 72 L 72 28",
    northernNoteEn: "Sharp high rise.",
    southernNoteEn: "Rising; often a bit softer than Northern — still clearly up.",
    rowClass: "bg-[#fce8dc]",
    accentStroke: "#e07a4a",
    skillId: "tone-sac",
  },
  {
    id: "huyen",
    journeyLessonId: "u2-l03",
    order: 3,
    nameVi: "huyền",
    nameEn: "falling",
    written: "mà",
    meaningEn: "but",
    meaningVi: "mà",
    utterance: "mà",
    markChar: "`",
    markNameEn: "grave (huyền)",
    strokeGuideEn: "Descending diagonal from upper left to lower right above the vowel.",
    contourHintEn: "Gently fall toward a lower pitch.",
    voiceCueEn: "Lower your voice (↘).",
    teachEn:
      "Huyền gently falls toward a lower pitch. Keep the fall smooth and continuous — not a hard stop. Write a short diagonal stroke from upper left to lower right.",
    pitchPath: "M 12 38 Q 48 55 88 78",
    markStrokePath: "M 28 28 L 72 72",
    northernNoteEn: "Smooth falling pitch.",
    southernNoteEn: "Falling; keep it continuous — not a hard stop.",
    rowClass: "bg-[#e8eef5]",
    accentStroke: "#457b9d",
    skillId: "tone-huyen",
  },
  {
    id: "hoi",
    journeyLessonId: "u2-l05",
    order: 4,
    nameVi: "hỏi",
    nameEn: "dipping",
    written: "mả",
    meaningEn: "grave",
    meaningVi: "mả",
    utterance: "mả",
    markChar: "̉",
    markNameEn: "hook above (hỏi)",
    strokeGuideEn: "Small curved hook above the vowel (◌̉).",
    contourHintEn: "Dip down, then rise again.",
    voiceCueEn: "Dip down then go up (◌̉).",
    teachEn:
      "Hỏi dips down and then rises. Pronunciation varies by region — Southern speech often merges hỏi with ngã. The written mark is a small curved hook above the vowel.",
    pitchPath: "M 10 42 Q 28 78 50 55 Q 72 22 90 30",
    pitchPathNorthern: "M 10 40 Q 30 82 52 50 Q 74 20 90 28",
    markStrokePath: "M 42 30 Q 50 18 62 28 Q 58 48 50 58",
    northernNoteEn: "Clear dip then rise (distinct from ngã).",
    southernNoteEn:
      "Often merges with ngã in Southern speech — we never mark a legitimate merge as wrong.",
    rowClass: "bg-[#f3e8ef]",
    accentStroke: "#a85a7a",
    skillId: "tone-hoi",
  },
  {
    id: "nga",
    journeyLessonId: "u2-l06",
    order: 5,
    nameVi: "ngã",
    nameEn: "broken-rising",
    written: "mã",
    meaningEn: "code",
    meaningVi: "mã",
    utterance: "mã",
    markChar: "~",
    markNameEn: "tilde (ngã)",
    strokeGuideEn: "Tilde (~) above the vowel — wave left to right (◌̃).",
    contourHintEn: "Rise with a brief break or glottal catch (Northern teaching shape).",
    voiceCueEn: "A short break then rise (◌̃).",
    teachEn:
      "Ngã often has a brief constriction or interruption then rises (especially Northern). Southern pronunciation often merges with hỏi — we never score a legitimate regional merge as wrong. Write a small tilde above the vowel.",
    pitchPath: "M 10 48 L 36 36 L 48 62 L 88 16",
    pitchPathNorthern: "M 10 48 L 34 34 L 46 68 L 88 14",
    markStrokePath: "M 30 48 Q 42 28 50 48 Q 58 68 70 48",
    northernNoteEn: "Broken rise with a glottal catch (distinct from hỏi).",
    southernNoteEn:
      "Often merges with hỏi — listening quizzes accept either when dialect is Southern.",
    rowClass: "bg-[#f8ebe2]",
    accentStroke: "#e08a45",
    skillId: "tone-nga",
  },
  {
    id: "nang",
    journeyLessonId: "u2-l07",
    order: 6,
    nameVi: "nặng",
    nameEn: "heavy",
    written: "mạ",
    meaningEn: "rice seedling",
    meaningVi: "mạ",
    utterance: "mạ",
    markChar: ".",
    markNameEn: "dot below (nặng)",
    strokeGuideEn: "Single heavy dot below the vowel (◌̣) — never above.",
    contourHintEn: "Short, low, often constricted ending.",
    voiceCueEn: "Say lower and end quickly (◌̣).",
    teachEn:
      "Nặng is low and often short, with a heavier or constricted quality. The written mark is a single heavy dot below the vowel — never above.",
    pitchPath: "M 20 55 L 55 78 L 72 82",
    markStrokePath: "M 50 78 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
    northernNoteEn: "Short, heavy, often constricted ending.",
    southernNoteEn: "Heavy low finish — keep it short.",
    rowClass: "bg-[#ebe4da]",
    accentStroke: "#5c6b73",
    skillId: "tone-nang",
  },
];

export const TONE_PLACEMENT_NOTES = [
  "Tone marks sit on the nuclear vowel — not on every letter of a cluster.",
  "Vowel diacritics (ă â ê ô ơ ư) are not tone marks; tones stack with them (ắ ề ố…).",
  "In vowel clusters, place the tone on the main syllabic vowel (e.g. điều, người).",
  "Ngang = no tone mark; five written marks cover the other five tones.",
] as const;

/** Fundamentals taught before individual tone practice (legacy + intro). */
export const TONE_FUNDAMENTALS = [
  {
    title: "What is Dấu Thanh?",
    body: "Vietnamese tones (thanh điệu) change both sound and meaning. The same letters with a different tone are different words — ma vs má vs mà.",
  },
  {
    title: "Six tones, five marks",
    body: "There are 6 tone categories, but only 5 written marks. Ngang (level) has no mark. The marks are voice-direction guides — not exact pitch graphs.",
  },
  {
    title: "Marks vs vowel diacritics",
    body: "ă â ê ô ơ ư change the vowel quality. ´ ` ̉ ~ . are tone marks. They can appear together (ắ, ề, ố…).",
  },
  {
    title: "Where the mark goes",
    body: "Place the tone on the main syllabic vowel in a cluster — not on every letter. Practice placement before you race through listening drills.",
  },
] as const;

export function getToneCard(id: string): ToneCard | undefined {
  return TONE_CARDS.find((c) => c.id === id);
}

export function toneLabel(id: ToneId): string {
  return getToneCard(id)?.nameVi ?? id;
}

export function pitchPathFor(card: ToneCard, dialect: ToneDialect): string {
  if (dialect === "northern" && card.pitchPathNorthern) return card.pitchPathNorthern;
  return card.pitchPath;
}

/** Southern hỏi/ngã merger — listening discrimination only. */
export function southernListeningAccepts(target: ToneId): ToneId[] {
  if (target === "hoi" || target === "nga") return ["hoi", "nga"];
  return [target];
}
