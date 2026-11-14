import type { MusicStudioDraft } from "./types";

const KEY = "ami-lingua.music-studio.v1";
const AUDIT_KEY = "ami-lingua.rights-audit.v1";

export function loadStudioDrafts(): MusicStudioDraft[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as MusicStudioDraft[];
  } catch {
    return [];
  }
}

export function saveStudioDraft(draft: MusicStudioDraft) {
  if (typeof window === "undefined") return;
  const all = loadStudioDrafts().filter((d) => d.id !== draft.id);
  all.unshift(draft);
  localStorage.setItem(KEY, JSON.stringify(all));
  pushRightsAudit({
    songId: draft.id,
    action: "studio_draft_saved",
    status: draft.rightsStatus,
    at: new Date().toISOString(),
    note: draft.topic,
  });
}

export type RightsAuditEntry = {
  songId: string;
  action: string;
  status: string;
  at: string;
  note?: string;
};

export function pushRightsAudit(entry: RightsAuditEntry) {
  if (typeof window === "undefined") return;
  const list = loadRightsAudit();
  list.unshift(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, 100)));
}

export function loadRightsAudit(): RightsAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]") as RightsAuditEntry[];
  } catch {
    return [];
  }
}

/** Propose beginner-friendly original lyrics for a topic (no existing-song imitation). */
export function proposeOriginalLyrics(topic: string): { vi: string; en: string } {
  const t = topic.toLowerCase();
  if (t.includes("food") || t.includes("drink") || t.includes("café") || t.includes("cafe")) {
    return {
      vi: "Xin chào.\nTôi muốn uống nước.\nCho tôi một ly trà đá.\nCảm ơn bạn nhiều.",
      en: "Hello.\nI want to drink water.\nPlease give me an iced tea.\nThank you so much.",
    };
  }
  if (t.includes("greet") || t.includes("hello")) {
    return {
      vi: "Xin chào bạn.\nHôm nay bạn khỏe không?\nTôi khỏe, cảm ơn.\nHẹn gặp lại.",
      en: "Hello friend.\nHow are you today?\nI am well, thank you.\nSee you again.",
    };
  }
  if (t.includes("family")) {
    return {
      vi: "Đây là mẹ tôi.\nĐây là bố tôi.\nGia đình tôi vui.\nTôi yêu gia đình.",
      en: "This is my mother.\nThis is my father.\nMy family is happy.\nI love my family.",
    };
  }
  return {
    vi: "Hôm nay trời đẹp quá.\nTôi đi học tiếng Việt.\nTừng chữ thật rõ ràng.\nMỗi ngày một bước tiến.",
    en: "The weather is beautiful today.\nI go to learn Vietnamese.\nEach word is very clear.\nEvery day one step forward.",
  };
}
