import type { SingSong } from "./types";
import { canShowCatalogCard } from "./rights";
import { SAMPLE_TIMED_LINE, timedLineToLyricLine } from "./timedLine";

/**
 * Catalog: original educational demo + licensed free-to-use ballads + rights metadata.
 * Unlicensed titles must stay pending with empty assets.
 */
export const SING_SONGS: SingSong[] = [
  {
    id: "xin-chao-moi-ngay",
    title: "Xin chào mỗi ngày",
    titleEn: "Hello Every Day",
    artist: "ÁMi Lingua Originals",
    songwriter: "ÁMi Lingua",
    language: "vi",
    genre: "Educational",
    style: "educational",
    vocalType: "mixed",
    difficulty: "beginner",
    dialect: "southern",
    durationSec: 30,
    estimatedLessonMin: 8,
    tags: ["greetings", "daily", "beginner", "original"],
    skills: ["Listening comprehension", "Pronunciation", "Greetings vocabulary"],
    summary: "A gentle 30-second greeting song for absolute beginners.",
    category: "Beginner Songs",
    audioUrl: "/sing/xin-chao-moi-ngay.wav",
    featured: true,
    source: "original",
    rights: {
      status: "approved",
      compositionOwner: "ÁMi Lingua",
      masterOwner: "ÁMi Lingua",
      territory: "WW",
      allowedUses: [
        "metadata",
        "audio_playback",
        "lyrics_display",
        "karaoke_instrumental",
        "synchronization",
        "ugc_recording",
        "commercial",
      ],
      effectiveDate: "2025-01-01",
      documentationRef: "original-in-house",
      note: "Original composition & lyrics © ÁMi Lingua — authorized for in-app learning.",
    },
    lines: [
      {
        id: "l1",
        start: 0,
        end: 2.5,
        translationEn: "Hello, dear friend",
        tokens: [
          {
            id: "t1",
            text: "Xin",
            start: 0.0,
            end: 0.55,
            meaningEn: "please / polite particle",
            note: "Often starts warm greetings.",
            toneHint: "level",
          },
          { id: "t2", text: "chào", start: 0.55, end: 1.1, meaningEn: "hello / greet", toneHint: "falling" },
          { id: "t3", text: "bạn", start: 1.1, end: 1.65, meaningEn: "friend / you (casual)", toneHint: "falling" },
          {
            id: "t4",
            text: "ơi",
            start: 1.65,
            end: 2.5,
            meaningEn: "hey (soft call)",
            note: "Friendly particle — softens the call.",
            toneHint: "level",
          },
        ],
      },
      {
        id: "l2",
        start: 2.6,
        end: 5.1,
        translationEn: "I am learning Vietnamese",
        tokens: [
          { id: "t5", text: "Tôi", start: 2.6, end: 3.15, meaningEn: "I", toneHint: "level" },
          { id: "t6", text: "học", start: 3.15, end: 3.7, meaningEn: "study / learn", toneHint: "falling" },
          { id: "t7", text: "tiếng", start: 3.7, end: 4.25, meaningEn: "language / tongue", toneHint: "rising" },
          {
            id: "t8",
            text: "Việt",
            start: 4.25,
            end: 5.1,
            meaningEn: "Vietnamese",
            note: "Together: tiếng Việt = Vietnamese language.",
            toneHint: "falling",
          },
        ],
      },
      {
        id: "l3",
        start: 5.2,
        end: 7.7,
        translationEn: "Every day is so joyful",
        tokens: [
          { id: "t9", text: "Mỗi", start: 5.2, end: 5.75, meaningEn: "each / every", toneHint: "falling" },
          { id: "t10", text: "ngày", start: 5.75, end: 6.3, meaningEn: "day", toneHint: "falling" },
          { id: "t11", text: "vui", start: 6.3, end: 6.85, meaningEn: "happy / fun", toneHint: "level" },
          {
            id: "t12",
            text: "quá",
            start: 6.85,
            end: 7.7,
            meaningEn: "so / very",
            note: "Intensifier after an adjective.",
            toneHint: "rising",
          },
        ],
      },
      {
        id: "l4",
        start: 7.8,
        end: 10.4,
        translationEn: "Together with ÁMi Lingua",
        tokens: [
          { id: "t13", text: "Cùng", start: 7.8, end: 8.35, meaningEn: "together / with", toneHint: "falling" },
          { id: "t14", text: "ÁMi", start: 8.35, end: 8.9, meaningEn: "ÁMi (brand)", toneHint: "level" },
          { id: "t15", text: "Lingua", start: 8.9, end: 10.4, meaningEn: "Lingua (brand)", toneHint: "level" },
        ],
      },
      {
        id: "l5",
        start: 10.6,
        end: 12.9,
        translationEn: "Hello, dear friend",
        tokens: [
          { id: "t16", text: "Xin", start: 10.6, end: 11.1, meaningEn: "please / polite particle", toneHint: "level" },
          { id: "t17", text: "chào", start: 11.1, end: 11.6, meaningEn: "hello / greet", toneHint: "falling" },
          { id: "t18", text: "bạn", start: 11.6, end: 12.1, meaningEn: "friend / you (casual)", toneHint: "falling" },
          { id: "t19", text: "ơi", start: 12.1, end: 12.9, meaningEn: "hey (soft call)", toneHint: "level" },
        ],
      },
      {
        id: "l6",
        start: 13.0,
        end: 15.3,
        translationEn: "Practice speaking clearly",
        tokens: [
          { id: "t20", text: "Học", start: 13.0, end: 13.5, meaningEn: "learn", toneHint: "falling" },
          { id: "t21", text: "nói", start: 13.5, end: 14.0, meaningEn: "speak / say", toneHint: "rising" },
          { id: "t22", text: "thật", start: 14.0, end: 14.5, meaningEn: "really / truly", toneHint: "falling" },
          { id: "t23", text: "rõ", start: 14.5, end: 15.3, meaningEn: "clear", toneHint: "falling" },
        ],
      },
      {
        id: "l7",
        start: 15.5,
        end: 17.8,
        translationEn: "Listen and understand too",
        tokens: [
          { id: "t24", text: "Nghe", start: 15.5, end: 16.0, meaningEn: "listen / hear", toneHint: "level" },
          { id: "t25", text: "và", start: 16.0, end: 16.5, meaningEn: "and", toneHint: "falling" },
          { id: "t26", text: "hiểu", start: 16.5, end: 17.0, meaningEn: "understand", toneHint: "falling" },
          { id: "t27", text: "nữa", start: 17.0, end: 17.8, meaningEn: "also / too", toneHint: "falling" },
        ],
      },
      {
        id: "l8",
        start: 18.0,
        end: 20.5,
        translationEn: "Sing happily every day",
        tokens: [
          { id: "t28", text: "Hát", start: 18.0, end: 18.5, meaningEn: "sing", toneHint: "rising" },
          { id: "t29", text: "vui", start: 18.5, end: 19.0, meaningEn: "happily / fun", toneHint: "level" },
          { id: "t30", text: "mỗi", start: 19.0, end: 19.5, meaningEn: "each / every", toneHint: "falling" },
          { id: "t31", text: "ngày", start: 19.5, end: 20.5, meaningEn: "day", toneHint: "falling" },
        ],
      },
      {
        id: "l9",
        start: 20.8,
        end: 23.6,
        translationEn: "Vietnamese sounds warm and kind",
        tokens: [
          { id: "t32", text: "Tiếng", start: 20.8, end: 21.35, meaningEn: "language", toneHint: "rising" },
          { id: "t33", text: "Việt", start: 21.35, end: 21.9, meaningEn: "Vietnamese", toneHint: "falling" },
          { id: "t34", text: "êm", start: 21.9, end: 22.45, meaningEn: "soft / gentle", toneHint: "level" },
          { id: "t35", text: "dịu", start: 22.45, end: 23.6, meaningEn: "mild / kind", toneHint: "falling" },
        ],
      },
      {
        id: "l10",
        start: 24.0,
        end: 26.8,
        translationEn: "See you again tomorrow",
        tokens: [
          { id: "t36", text: "Hẹn", start: 24.0, end: 24.6, meaningEn: "promise / see you", toneHint: "falling" },
          { id: "t37", text: "gặp", start: 24.6, end: 25.2, meaningEn: "meet", toneHint: "falling" },
          { id: "t38", text: "lại", start: 25.2, end: 26.8, meaningEn: "again", toneHint: "falling" },
        ],
      },
    ],
  },
  {
    id: "ngay-mai-nguoi-ta-lay-chong",
    title: "Ngày Mai Người Ta Lấy Chồng",
    titleEn: "Tomorrow Someone Gets Married",
    artist: "Nguyễn Thành Đạt",
    songwriter: "Đông Thiên Đức",
    language: "vi",
    genre: "Emotional Ballad",
    style: "ballad",
    vocalType: "male",
    difficulty: "intermediate",
    dialect: "southern",
    durationSec: 420,
    estimatedLessonMin: 25,
    tags: ["ballad", "male", "intermediate", "emotional", "licensed"],
    skills: [
      "Listening comprehension",
      "Pronunciation",
      "Emotional expressions",
      "Vietnamese vocabulary",
      "Sentence comprehension",
    ],
    summary:
      "Licensed & free to use for ÁMi Lingua. Full karaoke learning — time your own lyrics locally or use the timing editor.",
    category: "Male Vocals",
    featured: true,
    source: "licensed",
    audioUrl: "/sing/ngay-mai-nguoi-ta-lay-chong.mp3",
    rights: {
      status: "approved",
      compositionOwner: "Đông Thiên Đức",
      masterOwner: "Nguyễn Thành Đạt / authorized master",
      territory: "WW",
      allowedUses: [
        "metadata",
        "audio_playback",
        "lyrics_display",
        "karaoke_instrumental",
        "synchronization",
        "ugc_recording",
        "commercial",
      ],
      effectiveDate: "2026-11-14",
      documentationRef: "nicola-free-to-use-ngay-mai",
      note: "Licensed and free to use in ÁMi Lingua (Nicola). Demo master at /sing/; local import still supported.",
    },
    lines: [],
  },
  {
    id: "hat-mua-vuong-van",
    title: "Hạt Mưa Vương Vấn",
    titleEn: "Lingering Raindrops",
    artist: "Kiều Chi",
    songwriter: "Đinh Hoàng Quốc",
    language: "vi",
    genre: "Romantic Ballad",
    style: "ballad",
    vocalType: "female",
    difficulty: "elementary",
    dialect: "southern",
    durationSec: 273,
    estimatedLessonMin: 20,
    tags: ["ballad", "female", "elementary", "romantic", "licensed"],
    skills: [
      "Listening comprehension",
      "Pronunciation",
      "Word recognition",
      "Repetition",
      "Lyric comprehension",
    ],
    summary:
      "Licensed & free to use (Đinh Hoàng Quốc × Kiều Chi). Paste lyrics you supply into the local timing editor to sync.",
    category: "Female Vocals",
    featured: true,
    source: "licensed",
    audioUrl: "/sing/hat-mua-vuong-van.mp3",
    rights: {
      status: "approved",
      compositionOwner: "Đinh Hoàng Quốc",
      masterOwner: "Kiều Chi / authorized master",
      territory: "WW",
      allowedUses: [
        "metadata",
        "audio_playback",
        "lyrics_display",
        "karaoke_instrumental",
        "synchronization",
        "ugc_recording",
        "commercial",
      ],
      effectiveDate: "2026-11-14",
      documentationRef: "nicola-free-to-use-hat-mua",
      note: "Licensed and free to use in ÁMi Lingua (Nicola). Demo master at /sing/; local import still supported.",
    },
    lines: [],
  },
  {
    id: "practice_001",
    title: "Em yêu anh",
    titleEn: "I Love You (practice line)",
    artist: "ÁMi Lingua Practice",
    songwriter: "ÁMi Lingua",
    language: "vi",
    genre: "Educational",
    style: "educational",
    vocalType: "mixed",
    difficulty: "beginner",
    dialect: "southern",
    durationSec: 15,
    estimatedLessonMin: 5,
    tags: ["practice", "beginner", "romance", "original"],
    skills: ["Word recognition", "Pronunciation", "Tap-to-learn"],
    summary:
      "Short educational practice line with word-level timings (TimedLyricLine JSON). Use Speak / Understand without a commercial track.",
    category: "Beginner Songs",
    featured: true,
    source: "original",
    rights: {
      status: "approved",
      compositionOwner: "ÁMi Lingua",
      masterOwner: "ÁMi Lingua",
      territory: "WW",
      allowedUses: [
        "metadata",
        "audio_playback",
        "lyrics_display",
        "synchronization",
        "ugc_recording",
        "commercial",
      ],
      effectiveDate: "2026-11-14",
      documentationRef: "original-practice-001",
      note: "Original educational phrase. Timings follow the TimedLyricLine interchange format.",
    },
    lines: [timedLineToLyricLine(SAMPLE_TIMED_LINE, 0)],
  },
];

export function getSong(id: string): SingSong | undefined {
  return SING_SONGS.find((s) => s.id === id);
}

export function listCatalogSongs(): SingSong[] {
  return SING_SONGS.filter(canShowCatalogCard);
}

export function searchSongs(query: string): SingSong[] {
  const q = query.trim().toLowerCase();
  const base = listCatalogSongs();
  if (!q) return base;
  return base.filter((s) => {
    const hay = [s.title, s.titleEn, s.artist, s.summary, s.genre, ...s.tags, ...s.skills]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function lineAtTime(song: SingSong, t: number) {
  return song.lines.find((l) => t >= l.start && t < l.end) ?? null;
}

export function tokenAtTime(song: SingSong, t: number) {
  for (const line of song.lines) {
    const tok = line.tokens.find((x) => t >= x.start && t < x.end);
    if (tok) return { line, token: tok };
  }
  return null;
}

export function formatLessonDuration(song: SingSong): string {
  if (song.estimatedLessonMin > 0) return `~${song.estimatedLessonMin} min lesson`;
  return "Lesson length TBD";
}
