/**
 * Original beginner lyric. No borrowed melody and no word-level sync.
 * Lines are spoken on demand. Timing is not claimed.
 */

export type BeginnerSongLine = {
  id: string;
  en: string;
  vi: string;
};

export type BeginnerSong = {
  id: string;
  titleEn: string;
  titleVi: string;
  original: true;
  copyrighted: false;
  wordSync: {
    claimed: boolean;
    tested: boolean;
    noteVi: string;
  };
  lines: BeginnerSongLine[];
};

export const BEGINNER_SONG: BeginnerSong = {
  id: "hello-how-are-you",
  titleEn: "Hello, How Are You",
  titleVi: "Xin chào, bạn khỏe không",
  original: true,
  copyrighted: false,
  wordSync: {
    claimed: false,
    tested: false,
    noteVi:
      "Chưa có file nhạc đã căn giờ. Mỗi câu hiện khi bạn bấm nghe. Chưa khớp từng từ với nhạc.",
  },
  lines: [
    { id: "s1", en: "Hello, hello", vi: "Xin chào" },
    { id: "s2", en: "How are you?", vi: "Bạn khỏe không?" },
    { id: "s3", en: "My name is Lan", vi: "Tôi tên là Lan" },
    { id: "s4", en: "Thank you", vi: "Cảm ơn" },
    { id: "s5", en: "Goodbye", vi: "Tạm biệt" },
  ],
};

export function wordSyncClaimed(song: BeginnerSong): boolean {
  return song.wordSync.claimed === true && song.wordSync.tested === true;
}
