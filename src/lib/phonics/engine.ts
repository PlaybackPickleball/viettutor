/**
 * Deterministic syllable helpers for authored Đánh Vần lessons.
 * Never invents a spelling sequence — only looks up verified lessons / rules.
 */

import { getPhonicsLesson, PHONICS_LESSONS } from "./lessons";
import type { PhonicsLesson, PhonicsStep, ToneId } from "./types";

/** Multi-letter initials supported when matching authored content. */
export const MULTI_LETTER_INITIALS = [
  "ngh",
  "ng",
  "nh",
  "ch",
  "th",
  "ph",
  "kh",
  "gh",
  "tr",
  "qu",
  "gi",
] as const;

const TONE_MARKS: Record<ToneId, string> = {
  ngang: "",
  sac: "´",
  huyen: "`",
  hoi: "̉",
  nga: "~",
  nang: ".",
};

const TONE_NAMES_VI: Record<ToneId, string> = {
  ngang: "ngang",
  sac: "sắc",
  huyen: "huyền",
  hoi: "hỏi",
  nga: "ngã",
  nang: "nặng",
};

const VOWEL_BASE =
  "aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ";

function stripToneChar(ch: string): string {
  const map: Record<string, string> = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ằ: "ă",
    ắ: "ă",
    ẳ: "ă",
    ẵ: "ă",
    ặ: "ă",
    ầ: "â",
    ấ: "â",
    ẩ: "â",
    ẫ: "â",
    ậ: "â",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ề: "ê",
    ế: "ê",
    ể: "ê",
    ễ: "ê",
    ệ: "ê",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ồ: "ô",
    ố: "ô",
    ổ: "ô",
    ỗ: "ô",
    ộ: "ô",
    ờ: "ơ",
    ớ: "ơ",
    ở: "ơ",
    ỡ: "ơ",
    ợ: "ơ",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ừ: "ư",
    ứ: "ư",
    ử: "ư",
    ữ: "ư",
    ự: "ư",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
  };
  return map[ch] ?? ch;
}

export function detectToneId(syllable: string): ToneId {
  const s = syllable.normalize("NFC");
  if (/[áắấéếíóốớúứý]/.test(s)) return "sac";
  if (/[àằầèềìòồờùừỳ]/.test(s)) return "huyen";
  if (/[ảẳẩẻểỉỏổởủửỷ]/.test(s)) return "hoi";
  if (/[ãẵẫẽễĩõỗỡũữỹ]/.test(s)) return "nga";
  if (/[ạặậẹệịọộợụựỵ]/.test(s)) return "nang";
  return "ngang";
}

export function toneMarkFor(id: ToneId): string {
  return TONE_MARKS[id];
}

export function toneNameVi(id: ToneId): string {
  return TONE_NAMES_VI[id];
}

export function stripTones(syllable: string): string {
  return [...syllable.normalize("NFC")].map(stripToneChar).join("");
}

/**
 * Split a simple open CV syllable into initial + vowel when the pattern is known.
 * Returns null when the syllable is not covered — callers must fall back to authored lessons.
 */
export function parseOpenSyllable(
  syllable: string,
): { initial: string; vowel: string; tone: ToneId } | null {
  const raw = syllable.trim().normalize("NFC").toLowerCase();
  if (!raw) return null;
  const tone = detectToneId(raw);
  const base = stripTones(raw);

  let initial = "";
  let rest = base;
  for (const digraph of MULTI_LETTER_INITIALS) {
    if (base.startsWith(digraph)) {
      initial = digraph;
      rest = base.slice(digraph.length);
      break;
    }
  }
  if (!initial && base.length > 0) {
    const first = base[0];
    if (!VOWEL_BASE.includes(first) && first !== "đ") {
      // single consonant or đ
      if (first === "đ" || /[bcdghklmnpqrstvx]/.test(first)) {
        initial = first;
        rest = base.slice(1);
      }
    }
  }

  if (!rest || ![...rest].every((ch) => VOWEL_BASE.includes(ch) || "ăâêôơư".includes(ch))) {
    // Only trust simple open syllables in this Phase 1 helper
    if (!rest || rest.length > 3) return null;
  }

  // Phase 1: only open syllables without coda
  if (/[bcdghklmnpqrstvxđ]$/i.test(rest)) return null;

  return { initial, vowel: rest, tone };
}

/** Teaching sound for a single initial — authored list only. */
const INITIAL_UTTERANCE: Record<string, string> = {
  b: "bờ",
  c: "cờ",
  d: "dờ",
  đ: "đờ",
  g: "gờ",
  gh: "gờ",
  h: "hờ",
  k: "cờ",
  kh: "khờ",
  l: "lờ",
  m: "mờ",
  n: "nờ",
  ng: "ngờ",
  ngh: "ngờ",
  nh: "nhờ",
  p: "pờ",
  ph: "phờ",
  qu: "quờ",
  r: "rờ",
  s: "sờ",
  t: "tờ",
  th: "thờ",
  tr: "trờ",
  v: "vờ",
  x: "xờ",
  ch: "chờ",
  gi: "giờ",
};

export function initialUtterance(initial: string): string | null {
  if (!initial) return null;
  return INITIAL_UTTERANCE[initial] ?? null;
}

/**
 * Resolve a verified step sequence for a syllable.
 * 1) Prefer an authored lesson that targets this exact written form.
 * 2) Else build from parseOpenSyllable only when every piece is in the verified maps.
 * 3) Else return null — never invent.
 */
export function resolveSequence(syllable: string): PhonicsStep[] | null {
  const target = syllable.trim().normalize("NFC");
  const authored = PHONICS_LESSONS.find(
    (l) => l.kind === "build" && l.target === target && l.steps?.length,
  );
  if (authored?.steps) return authored.steps;

  const bare = stripTones(target);
  const bareLesson = PHONICS_LESSONS.find(
    (l) => l.kind === "build" && l.target === bare && l.steps?.length,
  );
  const parsed = parseOpenSyllable(target);
  if (!parsed) return bareLesson?.steps ?? null;

  const initSay = parsed.initial ? initialUtterance(parsed.initial) : null;
  if (parsed.initial && !initSay) return bareLesson?.steps ?? null;

  const tone = parsed.tone;
  const steps: PhonicsStep[] = [];
  if (parsed.initial && initSay) {
    steps.push({ display: parsed.initial, utterance: initSay, kind: "initial" });
  }
  steps.push({ display: parsed.vowel, utterance: parsed.vowel, kind: "vowel" });
  steps.push({ display: bare, utterance: bare, kind: "combine" });
  if (tone !== "ngang") {
    steps.push({
      display: toneMarkFor(tone) || toneNameVi(tone),
      utterance: toneNameVi(tone),
      kind: "tone",
    });
    steps.push({ display: target, utterance: target, kind: "syllable" });
  } else {
    steps[steps.length - 1] = { display: target, utterance: target, kind: "syllable" };
  }
  return steps;
}

export function sequenceLabel(steps: PhonicsStep[]): string {
  return steps.map((s) => s.utterance).join(" – ");
}

export function lessonHasAudio(lesson: PhonicsLesson): boolean {
  return Boolean(
    lesson.steps?.length ||
      lesson.toneFamily?.length ||
      lesson.readWords?.length ||
      lesson.options?.length,
  );
}

export function getVerifiedBuildLessons(): PhonicsLesson[] {
  return PHONICS_LESSONS.filter((l) => l.kind === "build");
}

export function requireLesson(id: string): PhonicsLesson {
  const lesson = getPhonicsLesson(id);
  if (!lesson) throw new Error(`Unknown phonics lesson: ${id}`);
  return lesson;
}
