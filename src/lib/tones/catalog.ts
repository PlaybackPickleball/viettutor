/**
 * Dấu Thanh curriculum — six tone categories on the ma family.
 * Six tones ≠ five written marks (ngang has no mark).
 * Contours are teaching animations; mark shapes are mnemonics, not pitch graphs.
 * Southern hỏi/ngã often merge — never score a legitimate regional merge as wrong.
 */

import type { ToneCard, ToneId } from "./types";

export const TONE_MASTERY_THRESHOLD = 0.8;

export const TONE_IDS: ToneId[] = ["ngang", "sac", "huyen", "hoi", "nga", "nang"];

export const TONE_CARDS: ToneCard[] = [
  {
    id: "ngang",
    journeyLessonId: "u2-l01",
    order: 1,
    nameVi: "ngang",
    nameEn: "level",
    written: "ma",
    meaningEn: "ghost (training)",
    meaningVi: "ma (luyện)",
    utterance: "ma",
    markChar: "—",
    markNameEn: "no mark",
    strokeGuideEn: "Ngang has no written tone mark — leave the vowel unmarked.",
    contourHintEn: "Steady mid pitch — flat teaching line (not a scored measurement).",
    voiceCueEn: "Keep a level voice.",
    pitchPath: "M 4 50 H 96",
    markStrokePath: "",
    northernNoteEn: "Clear level mid pitch.",
    southernNoteEn: "Also level; stay steady — don’t add a fall.",
    rowClass: "bg-[#f3ebe0]",
    accentClass: "stroke-[#8a6b4a]",
    skillId: "tone-ngang",
  },
  {
    id: "sac",
    journeyLessonId: "u2-l02",
    order: 2,
    nameVi: "sắc",
    nameEn: "rising",
    written: "má",
    meaningEn: "mother (Southern usage)",
    meaningVi: "má",
    utterance: "má",
    markChar: "´",
    markNameEn: "acute (sắc)",
    strokeGuideEn: "Write a short diagonal stroke rising from left to right.",
    contourHintEn: "Teaching rise — mark shape is a mnemonic, not an exact pitch plot.",
    voiceCueEn: "Raise your voice (↗).",
    pitchPath: "M 8 78 L 92 18",
    markStrokePath: "M 28 72 L 72 28",
    northernNoteEn: "Sharp high rise.",
    southernNoteEn: "Rising; often a bit softer than Northern — still clearly up.",
    rowClass: "bg-[#fce8dc]",
    accentClass: "stroke-[#e07a4a]",
    skillId: "tone-sac",
  },
  {
    id: "huyen",
    journeyLessonId: "u2-l03",
    order: 3,
    nameVi: "huyền",
    nameEn: "falling",
    written: "mà",
    meaningEn: "but / which (connector)",
    meaningVi: "mà",
    utterance: "mà",
    markChar: "`",
    markNameEn: "grave (huyền)",
    strokeGuideEn: "Descending diagonal from upper left to lower right above the vowel.",
    contourHintEn: "Gentle fall — mnemonic grave mark, not a laboratory contour.",
    voiceCueEn: "Lower your voice (↘).",
    pitchPath: "M 8 22 L 92 78",
    markStrokePath: "M 28 28 L 72 72",
    northernNoteEn: "Smooth falling pitch.",
    southernNoteEn: "Falling; keep it continuous — not a hard stop.",
    rowClass: "bg-[#efe6dc]",
    accentClass: "stroke-[#c45c38]",
    skillId: "tone-huyen",
  },
  {
    id: "hoi",
    journeyLessonId: "u2-l05",
    order: 4,
    nameVi: "hỏi",
    nameEn: "dipping",
    written: "mả",
    meaningEn: "tomb / grave (training)",
    meaningVi: "mả",
    utterance: "mả",
    markChar: "̉",
    markNameEn: "hook above (hỏi)",
    strokeGuideEn: "Small curved hook above the vowel (◌̉).",
    contourHintEn: "Dip-then-lift teaching shape — Southern often merges with ngã.",
    voiceCueEn: "Dip down then go up (◌̉).",
    pitchPath: "M 8 36 Q 36 78 52 52 Q 72 22 92 28",
    markStrokePath: "M 42 30 Q 50 18 62 28 Q 58 48 50 58",
    northernNoteEn: "Clear dip then rise (distinct from ngã).",
    southernNoteEn:
      "Often merges with ngã in Southern speech — we never mark a legitimate merge as wrong.",
    rowClass: "bg-[#f6e9e0]",
    accentClass: "stroke-[#d9784f]",
    skillId: "tone-hoi",
  },
  {
    id: "nga",
    journeyLessonId: "u2-l06",
    order: 5,
    nameVi: "ngã",
    nameEn: "broken-rising",
    written: "mã",
    meaningEn: "code / horse (training)",
    meaningVi: "mã",
    utterance: "mã",
    markChar: "~",
    markNameEn: "tilde (ngã)",
    strokeGuideEn: "Tilde (~) above the vowel — wave left to right (◌̃).",
    contourHintEn: "Broken / glottal teaching bump — Southern may merge with hỏi.",
    voiceCueEn: "A short break then rise (◌̃).",
    pitchPath: "M 8 40 L 40 28 L 48 62 L 92 24",
    markStrokePath: "M 30 48 Q 42 28 50 48 Q 58 68 70 48",
    northernNoteEn: "Broken rise with a glottal catch (distinct from hỏi).",
    southernNoteEn:
      "Often merges with hỏi — listening quizzes accept either when dialect is Southern.",
    rowClass: "bg-[#f8ebe2]",
    accentClass: "stroke-[#e08a45]",
    skillId: "tone-nga",
  },
  {
    id: "nang",
    journeyLessonId: "u2-l07",
    order: 6,
    nameVi: "nặng",
    nameEn: "heavy / low",
    written: "mạ",
    meaningEn: "rice seedling (training)",
    meaningVi: "mạ",
    utterance: "mạ",
    markChar: ".",
    markNameEn: "dot below (nặng)",
    strokeGuideEn: "Single heavy dot below the vowel (◌̣) — never above.",
    contourHintEn: "Short low drop / constricted end — mnemonic is the under-dot.",
    voiceCueEn: "Say lower and end quickly (◌̣).",
    pitchPath: "M 8 28 L 55 70 L 92 78",
    markStrokePath: "M 50 78 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
    northernNoteEn: "Short, heavy, often constricted ending.",
    southernNoteEn: "Heavy low finish — keep it short.",
    rowClass: "bg-[#ebe4da]",
    accentClass: "stroke-[#3d2e24]",
    skillId: "tone-nang",
  },
];

export const TONE_PLACEMENT_NOTES = [
  "Tone marks sit on the nuclear vowel — not on every letter of a cluster.",
  "Vowel diacritics (ă â ê ô ơ ư) are not tone marks; tones stack with them (ắ ề ố…).",
  "In vowel clusters, place the tone on the main syllabic vowel (e.g. điều, người).",
  "Ngang = no tone mark; five written marks cover the other five tones.",
] as const;

/** Fundamentals taught before individual tone practice. */
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

/** Southern hỏi/ngã merger — listening discrimination only. */
export function southernListeningAccepts(target: ToneId): ToneId[] {
  if (target === "hoi" || target === "nga") return ["hoi", "nga"];
  return [target];
}
