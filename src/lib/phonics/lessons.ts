import type { PhonicsLesson, ToneCard } from "./types";

/** Southern-first ma tone family — authored, dialect-locked. */
export const MA_TONE_FAMILY: ToneCard[] = [
  {
    id: "ngang",
    written: "ma",
    nameVi: "ngang",
    nameEn: "level",
    contourHint: "Steady mid",
    utterance: "ma",
  },
  {
    id: "sac",
    written: "má",
    nameVi: "sắc",
    nameEn: "rising",
    contourHint: "Sharp rise",
    utterance: "má",
  },
  {
    id: "huyen",
    written: "mà",
    nameVi: "huyền",
    nameEn: "falling",
    contourHint: "Gentle fall",
    utterance: "mà",
  },
  {
    id: "hoi",
    written: "mả",
    nameVi: "hỏi",
    nameEn: "asking / dip-rise",
    contourHint: "Dip then lift (Southern)",
    utterance: "mả",
  },
  {
    id: "nga",
    written: "mã",
    nameVi: "ngã",
    nameEn: "broken / glottal",
    contourHint: "Break mid (Southern softer)",
    utterance: "mã",
  },
  {
    id: "nang",
    written: "mạ",
    nameVi: "nặng",
    nameEn: "heavy",
    contourHint: "Short low drop",
    utterance: "mạ",
  },
];

const BA_TONE_FAMILY: ToneCard[] = [
  { id: "ngang", written: "ba", nameVi: "ngang", nameEn: "level", contourHint: "Steady mid", utterance: "ba" },
  { id: "sac", written: "bá", nameVi: "sắc", nameEn: "rising", contourHint: "Sharp rise", utterance: "bá" },
  { id: "huyen", written: "bà", nameVi: "huyền", nameEn: "falling", contourHint: "Gentle fall", utterance: "bà" },
  { id: "hoi", written: "bả", nameVi: "hỏi", nameEn: "asking / dip-rise", contourHint: "Dip then lift (Southern)", utterance: "bả" },
  { id: "nga", written: "bã", nameVi: "ngã", nameEn: "broken / glottal", contourHint: "Break mid (Southern softer)", utterance: "bã" },
  { id: "nang", written: "bạ", nameVi: "nặng", nameEn: "heavy", contourHint: "Short low drop", utterance: "bạ" },
];

/**
 * First MVP pack (12) — every build sequence is authored and verified.
 * Example (Nicola): bờ → a → ba → sắc → bá
 */
export const PHONICS_LESSONS: PhonicsLesson[] = [
  {
    id: "ba-open",
    order: 1,
    kind: "build",
    titleEn: "b + a → ba",
    titleVi: "bờ + a → ba",
    explanationEn: "Hear the teaching sound for b, then a, then the open syllable ba.",
    explanationVi: "Nghe âm dạy của b (bờ), rồi a, rồi ghép thành ba.",
    target: "ba",
    meaningEn: "three / father (context)",
    dialect: "southern",
    steps: [
      { display: "b", utterance: "bờ", kind: "initial", glossEn: "teaching sound for b" },
      { display: "a", utterance: "a", kind: "vowel" },
      { display: "ba", utterance: "ba", kind: "syllable", glossEn: "combined syllable" },
    ],
  },
  {
    id: "ba-sac",
    order: 2,
    kind: "build",
    titleEn: "b + a + sắc → bá",
    titleVi: "bờ + a + sắc → bá",
    explanationEn: "Same build as ba, then add the sắc tone mark to make bá.",
    explanationVi: "Ghép như ba, rồi thêm thanh sắc thành bá.",
    target: "bá",
    meaningEn: "governor / embrace (context)",
    dialect: "southern",
    steps: [
      { display: "b", utterance: "bờ", kind: "initial", glossEn: "teaching sound for b" },
      { display: "a", utterance: "a", kind: "vowel" },
      { display: "ba", utterance: "ba", kind: "combine" },
      { display: "´", utterance: "sắc", kind: "tone", glossEn: "rising tone name" },
      { display: "bá", utterance: "bá", kind: "syllable", glossEn: "natural pronunciation" },
    ],
  },
  {
    id: "ba-six-tones",
    order: 3,
    kind: "tone-family",
    titleEn: "ba with six tones",
    titleVi: "ba với sáu thanh",
    explanationEn: "Listen to the ba family across all six Southern tones.",
    explanationVi: "Nghe họ ba qua sáu thanh giọng Nam.",
    target: "ba",
    dialect: "southern",
    toneFamily: BA_TONE_FAMILY,
  },
  {
    id: "ma-open",
    order: 4,
    kind: "build",
    titleEn: "m + a → ma",
    titleVi: "mờ + a → ma",
    explanationEn: "Build the open syllable ma from m and a.",
    explanationVi: "Ghép mờ và a thành ma.",
    target: "ma",
    meaningEn: "ghost / but (context)",
    dialect: "southern",
    steps: [
      { display: "m", utterance: "mờ", kind: "initial" },
      { display: "a", utterance: "a", kind: "vowel" },
      { display: "ma", utterance: "ma", kind: "syllable" },
    ],
  },
  {
    id: "ma-six-tones",
    order: 5,
    kind: "tone-family",
    titleEn: "ma with six tones",
    titleVi: "ma với sáu thanh",
    explanationEn: "The classic ma – má – mà – mả – mã – mạ tone set (Southern first).",
    explanationVi: "Bộ thanh cổ điển ma – má – mà – mả – mã – mạ (giọng Nam trước).",
    target: "ma",
    dialect: "southern",
    toneFamily: MA_TONE_FAMILY,
  },
  {
    id: "na-open",
    order: 6,
    kind: "build",
    titleEn: "n + a → na",
    titleVi: "nờ + a → na",
    explanationEn: "Build na from the teaching sound nờ and a.",
    explanationVi: "Ghép nờ và a thành na.",
    target: "na",
    meaningEn: "that / take (context)",
    dialect: "southern",
    steps: [
      { display: "n", utterance: "nờ", kind: "initial" },
      { display: "a", utterance: "a", kind: "vowel" },
      { display: "na", utterance: "na", kind: "syllable" },
    ],
  },
  {
    id: "ca-open",
    order: 7,
    kind: "build",
    titleEn: "c + a → ca",
    titleVi: "cờ + a → ca",
    explanationEn: "Build ca from cờ and a.",
    explanationVi: "Ghép cờ và a thành ca.",
    target: "ca",
    meaningEn: "to sing / fish sauce context varies",
    dialect: "southern",
    steps: [
      { display: "c", utterance: "cờ", kind: "initial" },
      { display: "a", utterance: "a", kind: "vowel" },
      { display: "ca", utterance: "ca", kind: "syllable" },
    ],
  },
  {
    id: "initial-recog",
    order: 8,
    kind: "recognition",
    titleEn: "Initial consonant recognition",
    titleVi: "Nhận diện phụ âm đầu",
    explanationEn: "Hear the teaching sound and pick the matching letter.",
    explanationVi: "Nghe âm dạy và chọn chữ cái đúng.",
    dialect: "southern",
    options: ["b", "m", "n", "c"],
    steps: [
      { display: "b", utterance: "bờ", kind: "initial" },
      { display: "m", utterance: "mờ", kind: "initial" },
      { display: "n", utterance: "nờ", kind: "initial" },
      { display: "c", utterance: "cờ", kind: "initial" },
    ],
  },
  {
    id: "tone-listen",
    order: 9,
    kind: "listen-tone",
    titleEn: "Tone recognition by listening",
    titleVi: "Nhận thanh bằng cách nghe",
    explanationEn: "Listen to a ma-family syllable and choose the matching tone name.",
    explanationVi: "Nghe một tiếng họ ma và chọn tên thanh đúng.",
    dialect: "southern",
    toneFamily: MA_TONE_FAMILY,
  },
  {
    id: "free-build",
    order: 10,
    kind: "free-build",
    titleEn: "Build syllables independently",
    titleVi: "Tự ghép vần",
    explanationEn: "Replay any authored build from this pack — sequences stay verified.",
    explanationVi: "Phát lại bài ghép đã soạn trong gói này — không tự bịa chuỗi.",
    dialect: "southern",
    reviewOf: ["ba-open", "ba-sac", "ma-open", "na-open", "ca-open"],
  },
  {
    id: "read-familiar",
    order: 11,
    kind: "read",
    titleEn: "Read short familiar words",
    titleVi: "Đọc từ ngắn quen",
    explanationEn: "Read without spelling out — recognition, not vocabulary drill.",
    explanationVi: "Đọc không đánh vần — nhận diện, không phải học từ mới.",
    dialect: "southern",
    readWords: [
      { vi: "ba", en: "three / dad (context)" },
      { vi: "bá", en: "tone practice" },
      { vi: "ma", en: "tone practice" },
      { vi: "má", en: "mother (Southern)" },
      { vi: "na", en: "familiar syllable" },
      { vi: "ca", en: "familiar syllable" },
    ],
  },
  {
    id: "mixed-review",
    order: 12,
    kind: "review",
    titleEn: "Mixed review and assessment",
    titleVi: "Ôn tập tổng hợp",
    explanationEn: "Replay builds, tones, and reading. Progress is completion + attempts — not AI scores.",
    explanationVi: "Ôn ghép, thanh và đọc. Tiến độ = hoàn thành + số lần thử — không phải điểm AI.",
    dialect: "southern",
    reviewOf: [
      "ba-open",
      "ba-sac",
      "ba-six-tones",
      "ma-open",
      "ma-six-tones",
      "na-open",
      "ca-open",
      "read-familiar",
    ],
  },
];

export function getPhonicsLesson(id: string): PhonicsLesson | undefined {
  return PHONICS_LESSONS.find((l) => l.id === id);
}

export function getNextPhonicsLesson(id: string): PhonicsLesson | undefined {
  const current = getPhonicsLesson(id);
  if (!current) return undefined;
  return PHONICS_LESSONS.find((l) => l.order === current.order + 1);
}

export function getIntroLesson(): PhonicsLesson {
  return PHONICS_LESSONS[1] ?? PHONICS_LESSONS[0];
}
