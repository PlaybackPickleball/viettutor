import { buildLesson } from "./buildLesson";
import type { EnglishLesson, LessonStage } from "./lessonTypes";
import { LESSON_SPECS } from "./specs";
import { LESSON_SPECS_REST } from "./specsRest";

const COMPLETION =
  "Xong bài khi bạn đã nghe và đã thử nói, hoặc chọn học bằng cách nghe. Không có điểm tổng. Không cần giọng bản ngữ.";

function shipSheepStage(): LessonStage {
  return {
    id: "d26-ship-sheep",
    kind: "listen",
    instruction: "Nghe hai từ khác nhau. Bạn không cần nói ở bước này.",
    en: "ship. sheep.",
    vi: "ship là tàu. sheep là con cừu. Hai từ khác nguyên âm.",
    coach: "Đây là cặp dễ nhầm. Bài không giả định bạn nói sai cặp này.",
  };
}

function capstone(): EnglishLesson[] {
  const guided: EnglishLesson = {
    id: "d29",
    day: 29,
    week: 5,
    titleEn: "Guided conversation",
    titleVi: "Hội thoại có hướng dẫn",
    objectives: [
      "Chào một vị khách theo mẫu.",
      "Bán một ly cà phê theo mẫu, trước khi nói tự do.",
    ],
    vocabulary: [
      { en: "Welcome", vi: "Xin chào, mời vào" },
      { en: "How can I help you?", vi: "Tôi giúp gì được cho bạn?" },
      { en: "I would like coffee", vi: "Tôi muốn cà phê" },
      { en: "It's five dollars", vi: "Năm đô la" },
    ],
    targets: ["Welcome", "I would like coffee", "It's five dollars"],
    accent: "american",
    audio: "browser-en-US",
    completionVi: COMPLETION,
    stages: [
      {
        id: "d29-listen",
        kind: "listen",
        instruction: "Hôm nay nói theo tình huống. Nghe câu mở đầu trước.",
        en: "Hello. Welcome.",
        vi: "Xin chào. Mời bạn.",
      },
      {
        id: "d29-greet",
        kind: "scenario",
        instruction: "Tình huống 1: chào một vị khách. Nói câu của bạn khi tới lượt.",
        scenarioId: "greet-customer",
      },
      {
        id: "d29-sell",
        kind: "scenario",
        instruction: "Tình huống 2: bán cà phê. Vẫn nói theo mẫu.",
        scenarioId: "sell-coffee",
      },
      {
        id: "d29-review",
        kind: "review",
        instruction: "Nghe lại các câu vừa dùng.",
        items: [
          { en: "Hello. Welcome.", vi: "Xin chào. Mời bạn." },
          { en: "How can I help you?", vi: "Tôi giúp gì được cho bạn?" },
          { en: "I would like coffee, please.", vi: "Tôi muốn cà phê, làm ơn." },
          { en: "It's five dollars.", vi: "Năm đô la." },
          { en: "Thank you. Goodbye.", vi: "Cảm ơn. Tạm biệt." },
        ],
      },
    ],
  };

  const phrases = [
    { en: "Hello", vi: "Xin chào" },
    { en: "My name is Lan.", vi: "Tôi tên là Lan." },
    { en: "Thank you.", vi: "Cảm ơn." },
    { en: "How much is it?", vi: "Bao nhiêu tiền?" },
    { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
  ];

  const assessment: EnglishLesson = {
    id: "d30",
    day: 30,
    week: 5,
    titleEn: "Beginner speaking check",
    titleVi: "Kiểm tra nói sơ cấp",
    objectives: [
      "Nói năm câu đã học.",
      "Xem lại từng câu. Không có điểm trung bình.",
    ],
    vocabulary: phrases,
    targets: phrases.map((item) => item.en),
    accent: "american",
    audio: "browser-en-US",
    completionVi:
      "Xong khi mỗi câu đã được nghe và bạn đã ghi âm hoặc chọn học bằng cách nghe. Không có một điểm tổng.",
    stages: [
      ...phrases.map(
        (item, index): LessonStage => ({
          id: `d30-say-${index + 1}`,
          kind: "pronounce",
          instruction: `Câu ${index + 1} / ${phrases.length}. Nghe mẫu, rồi nói. Chưa rõ vẫn đi tiếp được.`,
          en: item.en,
          vi: item.vi,
          target: item.en,
        }),
      ),
      {
        id: "d30-summary",
        kind: "summary",
        instruction:
          "Từng câu một. Nếu máy không chấm được, dòng đó ghi là chưa chấm. Không có điểm trung bình.",
        phrases: phrases.map((item) => item.en),
      },
    ],
  };

  return [guided, assessment];
}

function withExtras(lesson: EnglishLesson): EnglishLesson {
  if (lesson.id !== "d26") return lesson;
  const reviewAt = lesson.stages.findIndex((stage) => stage.kind === "review");
  const stages = lesson.stages.slice();
  stages.splice(reviewAt === -1 ? stages.length : reviewAt, 0, shipSheepStage());
  return { ...lesson, stages };
}

export const ENGLISH_LESSONS: EnglishLesson[] = [
  ...LESSON_SPECS.map(buildLesson),
  ...LESSON_SPECS_REST.map(buildLesson),
  ...capstone(),
].map(withExtras);

export function getEnglishLesson(id: string): EnglishLesson | undefined {
  return ENGLISH_LESSONS.find((lesson) => lesson.id === id);
}

export function lessonCount(): number {
  return ENGLISH_LESSONS.length;
}

/** No registration wall in this build. Guest work stays on the device. */
export function canOpenLesson(
  lessonId: string,
  _opts: { signedIn: boolean },
): { ok: boolean; reason: "local-guest" | "missing" } {
  if (!getEnglishLesson(lessonId)) return { ok: false, reason: "missing" };
  return { ok: true, reason: "local-guest" };
}

export function glossaryEntries(): { en: string; vi: string }[] {
  const map = new Map<string, string>();
  for (const lesson of ENGLISH_LESSONS) {
    for (const item of lesson.vocabulary) {
      map.set(item.en.toLowerCase(), item.vi);
    }
    for (const stage of lesson.stages) {
      if (stage.kind === "listen" || stage.kind === "pronounce" || stage.kind === "repeat") {
        map.set(stage.en.toLowerCase(), stage.vi);
      }
      if (stage.kind === "review") {
        for (const item of stage.items) map.set(item.en.toLowerCase(), item.vi);
      }
    }
  }
  return [...map.entries()].map(([en, vi]) => ({ en, vi }));
}

export function lookupGloss(text: string): string | null {
  const key = text.trim().toLowerCase().replace(/[.?!,]/g, "");
  if (!key) return null;
  const entries = glossaryEntries();
  const exact = entries.find((item) => item.en.replace(/[.?!,]/g, "") === key);
  if (exact) return exact.vi;
  const word = entries.find((item) => item.en.replace(/[.?!,]/g, "") === key);
  return word ? word.vi : null;
}
