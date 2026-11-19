import type { PhonicsSkill } from "./types";

/** Shared skill registry — mastery tracked separately from lesson completion. */
export const PHONICS_SKILLS: PhonicsSkill[] = [
  { id: "letter-b", labelEn: "Letter b (bờ)", labelVi: "Chữ b (bờ)", kind: "letter" },
  { id: "letter-m", labelEn: "Letter m (mờ)", labelVi: "Chữ m (mờ)", kind: "letter" },
  { id: "letter-a", labelEn: "Vowel a", labelVi: "Nguyên âm a", kind: "letter" },
  { id: "letter-n", labelEn: "Letter n (nờ)", labelVi: "Chữ n (nờ)", kind: "letter" },
  { id: "letter-t", labelEn: "Letter t (tờ)", labelVi: "Chữ t (tờ)", kind: "letter" },
  { id: "letter-h", labelEn: "Letter h (hờ)", labelVi: "Chữ h (hờ)", kind: "letter" },
  { id: "letter-l", labelEn: "Letter l (lờ)", labelVi: "Chữ l (lờ)", kind: "letter" },
  { id: "letter-c", labelEn: "Letter c (cờ)", labelVi: "Chữ c (cờ)", kind: "letter" },
  { id: "letter-k", labelEn: "Letter k (ca)", labelVi: "Chữ k (ca)", kind: "letter" },
  { id: "build-open-cv", labelEn: "Build open CV syllables", labelVi: "Ghép vần mở CV", kind: "pattern" },
  { id: "tone-ngang", labelEn: "Tone ngang (level)", labelVi: "Thanh ngang", kind: "tone" },
  { id: "tone-sac", labelEn: "Tone sắc (rising)", labelVi: "Thanh sắc", kind: "tone" },
  { id: "tone-huyen", labelEn: "Tone huyền (falling)", labelVi: "Thanh huyền", kind: "tone" },
  { id: "tone-hoi", labelEn: "Tone hỏi", labelVi: "Thanh hỏi", kind: "tone" },
  { id: "tone-nga", labelEn: "Tone ngã", labelVi: "Thanh ngã", kind: "tone" },
  { id: "tone-nang", labelEn: "Tone nặng", labelVi: "Thanh nặng", kind: "tone" },
  { id: "tone-six-ma", labelEn: "Six tones on ma family", labelVi: "Sáu thanh họ ma", kind: "tone" },
  { id: "listen-discriminate", labelEn: "Listen & discriminate", labelVi: "Nghe phân biệt", kind: "listening" },
  { id: "read-familiar", labelEn: "Read familiar syllables", labelVi: "Đọc tiếng quen", kind: "pattern" },
  { id: "speak-compare", labelEn: "Speak & compare by ear", labelVi: "Nói và so sánh", kind: "listening" },
  { id: "vocab-ba-ma", labelEn: "ba / má meaningful words", labelVi: "Từ ba / má", kind: "vocab" },
  { id: "ck-spelling", labelEn: "c / k spelling pattern", labelVi: "Chính tả c / k", kind: "pattern" },
];

export function getSkill(id: string): PhonicsSkill | undefined {
  return PHONICS_SKILLS.find((s) => s.id === id);
}
