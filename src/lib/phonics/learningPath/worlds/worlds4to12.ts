import type { LearningLesson, LearningWorld } from "../types";

/**
 * Worlds 4–12 — structured curriculum definitions only.
 * Lessons are not playable in this MVP (no exercises; playable: false).
 */

type Stub = {
  id: string;
  order: number;
  titleEn: string;
  titleVi: string;
  summaryEn: string;
  badgeId: string;
  lessonTitles: { en: string; vi: string }[];
};

const STUBS: Stub[] = [
  {
    id: "w4",
    order: 4,
    titleEn: "Closed syllables — finals n / ng",
    titleVi: "Vần đóng — n / ng",
    summaryEn: "Introduce simple finals with known initials (authored only).",
    badgeId: "badge-w4",
    lessonTitles: [
      { en: "Meet final n", vi: "Gặp vần cuối n" },
      { en: "Build an / ăn", vi: "Ghép an / ăn" },
      { en: "Meet final ng", vi: "Gặp vần cuối ng" },
      { en: "Build ang forms", vi: "Ghép dạng ang" },
      { en: "n vs ng listen", vi: "Nghe n và ng" },
      { en: "Tones on an", vi: "Thanh trên an" },
      { en: "Meaningful ăn", vi: "Từ ăn" },
      { en: "Build with b/m/n", vi: "Ghép với b/m/n" },
      { en: "Read closed shorts", vi: "Đọc vần đóng ngắn" },
      { en: "Speak & compare finals", vi: "Nói và so sánh" },
      { en: "Mixed closed review", vi: "Ôn vần đóng" },
      { en: "World 4 challenge", vi: "Thử thách TG4" },
    ],
  },
  {
    id: "w5",
    order: 5,
    titleEn: "Digraphs nh / ch",
    titleVi: "Song tự nh / ch",
    summaryEn: "Multi-letter initials nh and ch with open vowels.",
    badgeId: "badge-w5",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `nh/ch lesson ${i + 1}`,
      vi: `Bài nh/ch ${i + 1}`,
    })),
  },
  {
    id: "w6",
    order: 6,
    titleEn: "Digraphs th / ph / kh",
    titleVi: "Song tự th / ph / kh",
    summaryEn: "Aspirated and fricative digraphs — authored sequences.",
    badgeId: "badge-w6",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `th/ph/kh lesson ${i + 1}`,
      vi: `Bài th/ph/kh ${i + 1}`,
    })),
  },
  {
    id: "w7",
    order: 7,
    titleEn: "ng / ngh / gh",
    titleVi: "ng / ngh / gh",
    summaryEn: "Velar digraph spelling patterns before vowels.",
    badgeId: "badge-w7",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `ng family lesson ${i + 1}`,
      vi: `Bài họ ng ${i + 1}`,
    })),
  },
  {
    id: "w8",
    order: 8,
    titleEn: "Special vowels ă / â / ê",
    titleVi: "Nguyên âm đặc biệt ă / â / ê",
    summaryEn: "New vowel letters with known consonants and tones.",
    badgeId: "badge-w8",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `special vowel lesson ${i + 1}`,
      vi: `Bài nguyên âm ${i + 1}`,
    })),
  },
  {
    id: "w9",
    order: 9,
    titleEn: "ô / ơ / ư",
    titleVi: "ô / ơ / ư",
    summaryEn: "Rounded and unrounded back vowels.",
    badgeId: "badge-w9",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `ô/ơ/ư lesson ${i + 1}`,
      vi: `Bài ô/ơ/ư ${i + 1}`,
    })),
  },
  {
    id: "w10",
    order: 10,
    titleEn: "Everyday Southern words",
    titleVi: "Từ Nam thường gặp",
    summaryEn: "Authored high-frequency Southern vocabulary packs.",
    badgeId: "badge-w10",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `everyday words ${i + 1}`,
      vi: `Từ thường ngày ${i + 1}`,
    })),
  },
  {
    id: "w11",
    order: 11,
    titleEn: "Read without spelling out",
    titleVi: "Đọc không đánh vần",
    summaryEn: "Fluency reading of previously mastered syllables.",
    badgeId: "badge-w11",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `reading fluency ${i + 1}`,
      vi: `Đọc trôi chảy ${i + 1}`,
    })),
  },
  {
    id: "w12",
    order: 12,
    titleEn: "Path mastery & karaoke bridge",
    titleVi: "Tổng ôn & cầu karaoke",
    summaryEn: "Spaced review + optional Learn the Lyrics bridges.",
    badgeId: "badge-w12",
    lessonTitles: Array.from({ length: 12 }, (_, i) => ({
      en: `mastery bridge ${i + 1}`,
      vi: `Cầu làm chủ ${i + 1}`,
    })),
  },
];

function stubLessons(stub: Stub): LearningLesson[] {
  return stub.lessonTitles.map((t, i) => ({
    id: `${stub.id}-l${String(i + 1).padStart(2, "0")}`,
    worldId: stub.id,
    order: i + 1,
    titleEn: t.en,
    titleVi: t.vi,
    summaryEn: `${stub.summaryEn} — definition only (not playable in MVP).`,
    durationMin: 3,
    playable: false,
    prerequisiteSkillIds: [],
    introducesSkillIds: [],
    reviewSkillIds: [],
    targetSyllableIds: [],
    exercises: [],
    starThresholds: { two: 0.7, three: 0.9 },
  }));
}

export const WORLDS_4_TO_12: LearningWorld[] = STUBS.map((s) => ({
  id: s.id,
  order: s.order,
  titleEn: s.titleEn,
  titleVi: s.titleVi,
  summaryEn: s.summaryEn,
  playable: false,
  badgeId: s.badgeId,
  lessonIds: s.lessonTitles.map((_, i) => `${s.id}-l${String(i + 1).padStart(2, "0")}`),
}));

export const LESSONS_4_TO_12: LearningLesson[] = STUBS.flatMap(stubLessons);
