/**
 * Original beginner lyric. No borrowed melody and no word-level sync.
 * Lines are spoken on demand. Timing is not claimed.
 */

export type BeginnerSongLine = {
  id: string;
  en: string;
  vi: string;
};

export type EnglishSongTopic = "greetings" | "food" | "family" | "daily";

export type BeginnerSong = {
  id: string;
  titleEn: string;
  titleVi: string;
  topic: EnglishSongTopic;
  summaryVi: string;
  original: true;
  copyrighted: false;
  wordSync: {
    claimed: boolean;
    tested: boolean;
    noteVi: string;
  };
  lines: BeginnerSongLine[];
};

const NO_SYNC = {
  claimed: false,
  tested: false,
  noteVi: "Chưa có file nhạc đã căn giờ. Mỗi câu hiện khi bạn bấm nghe. Chưa khớp từng từ với nhạc.",
} as const;

export const BEGINNER_SONG: BeginnerSong = {
  id: "hello-how-are-you",
  titleEn: "Hello, How Are You",
  titleVi: "Xin chào, bạn khỏe không",
  topic: "greetings",
  summaryVi: "Chào, hỏi thăm, giới thiệu tên, cảm ơn và tạm biệt.",
  original: true,
  copyrighted: false,
  wordSync: NO_SYNC,
  lines: [
    { id: "s1", en: "Hello, hello", vi: "Xin chào" },
    { id: "s2", en: "How are you?", vi: "Bạn khỏe không?" },
    { id: "s3", en: "My name is Lan", vi: "Tôi tên là Lan" },
    { id: "s4", en: "Thank you", vi: "Cảm ơn" },
    { id: "s5", en: "Goodbye", vi: "Tạm biệt" },
  ],
};

export const ENGLISH_SONGS: BeginnerSong[] = [
  BEGINNER_SONG,
  {
    id: "please-and-thank-you",
    titleEn: "Please and Thank You",
    titleVi: "Làm ơn và cảm ơn",
    topic: "greetings",
    summaryVi: "Xin phép, cảm ơn và xin lỗi trong câu ngắn.",
    original: true,
    copyrighted: false,
    wordSync: NO_SYNC,
    lines: [
      { id: "p1", en: "Please", vi: "Làm ơn" },
      { id: "p2", en: "Thank you very much", vi: "Cảm ơn nhiều" },
      { id: "p3", en: "Yes, please", vi: "Vâng, làm ơn" },
      { id: "p4", en: "No, thank you", vi: "Không, cảm ơn" },
      { id: "p5", en: "I am sorry", vi: "Tôi xin lỗi" },
    ],
  },
  {
    id: "a-cup-of-coffee",
    titleEn: "A Cup of Coffee",
    titleVi: "Một ly cà phê",
    topic: "food",
    summaryVi: "Gọi đồ uống và nói giá đơn giản.",
    original: true,
    copyrighted: false,
    wordSync: NO_SYNC,
    lines: [
      { id: "c1", en: "I want coffee", vi: "Tôi muốn cà phê" },
      { id: "c2", en: "A cup of tea", vi: "Một ly trà" },
      { id: "c3", en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { id: "c4", en: "Water, please", vi: "Cho tôi nước" },
      { id: "c5", en: "Thank you", vi: "Cảm ơn" },
    ],
  },
  {
    id: "my-family",
    titleEn: "My Family",
    titleVi: "Gia đình tôi",
    topic: "family",
    summaryVi: "Nói về mẹ, bố và con.",
    original: true,
    copyrighted: false,
    wordSync: NO_SYNC,
    lines: [
      { id: "f1", en: "This is my family", vi: "Đây là gia đình tôi" },
      { id: "f2", en: "My mother", vi: "Mẹ tôi" },
      { id: "f3", en: "My father", vi: "Bố tôi" },
      { id: "f4", en: "I love my family", vi: "Tôi yêu gia đình tôi" },
    ],
  },
  {
    id: "where-are-you-going",
    titleEn: "Where Are You Going",
    titleVi: "Bạn đi đâu",
    topic: "daily",
    summaryVi: "Hỏi đường và nói việc trong ngày.",
    original: true,
    copyrighted: false,
    wordSync: NO_SYNC,
    lines: [
      { id: "d1", en: "Where are you going?", vi: "Bạn đi đâu?" },
      { id: "d2", en: "I am going home", vi: "Tôi về nhà" },
      { id: "d3", en: "Turn left", vi: "Rẽ trái" },
      { id: "d4", en: "Turn right", vi: "Rẽ phải" },
      { id: "d5", en: "See you tomorrow", vi: "Hẹn gặp ngày mai" },
    ],
  },
];

export const ENGLISH_SONG_TOPICS: { id: EnglishSongTopic | "all"; label: string }[] = [
  { id: "all", label: "Mọi chủ đề" },
  { id: "greetings", label: "Chào hỏi" },
  { id: "food", label: "Ăn uống" },
  { id: "family", label: "Gia đình" },
  { id: "daily", label: "Hằng ngày" },
];

export function wordSyncClaimed(song: BeginnerSong): boolean {
  return song.wordSync.claimed === true && song.wordSync.tested === true;
}

export function getEnglishSong(id: string): BeginnerSong | undefined {
  return ENGLISH_SONGS.find((song) => song.id === id);
}
