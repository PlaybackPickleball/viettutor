export type ScenarioStep = {
  who: "teacher" | "learner";
  en: string;
  vi: string;
};

export type Scenario = {
  id: string;
  titleVi: string;
  introVi: string;
  steps: ScenarioStep[];
  suggestedEn: string;
  suggestedVi: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "greet-customer",
    titleVi: "Chào một vị khách",
    introVi: "Bạn là người chào khách. Nói từng câu theo mẫu. Chưa cần nói tự do.",
    steps: [
      { who: "teacher", en: "A customer walks in.", vi: "Một vị khách bước vào." },
      { who: "learner", en: "Hello. Welcome.", vi: "Xin chào. Mời bạn." },
      { who: "teacher", en: "Hello.", vi: "Xin chào." },
      { who: "learner", en: "How can I help you?", vi: "Tôi giúp gì được cho bạn?" },
      { who: "teacher", en: "I am just looking.", vi: "Tôi chỉ xem thôi." },
      { who: "learner", en: "Please. Take your time.", vi: "Mời bạn xem thoải mái." },
    ],
    suggestedEn: "Hello. Welcome.",
    suggestedVi: "Xin chào. Mời bạn.",
  },
  {
    id: "sell-coffee",
    titleVi: "Bán cà phê",
    introVi: "Bạn bán một ly cà phê. Giá mẫu là năm đô. Nói chậm theo câu gợi ý.",
    steps: [
      { who: "teacher", en: "Hello. What is this?", vi: "Xin chào. Đây là gì?" },
      { who: "learner", en: "This is coffee.", vi: "Đây là cà phê." },
      { who: "teacher", en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { who: "learner", en: "It's five dollars.", vi: "Năm đô la." },
      { who: "teacher", en: "I would like one, please.", vi: "Tôi muốn một ly, làm ơn." },
      { who: "learner", en: "Thank you.", vi: "Cảm ơn." },
    ],
    suggestedEn: "This is coffee. It's five dollars.",
    suggestedVi: "Đây là cà phê. Năm đô la.",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((item) => item.id === id);
}
