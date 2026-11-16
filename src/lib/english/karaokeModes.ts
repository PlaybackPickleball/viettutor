import { SING_MODES } from "@/lib/sing/modes";
import type { SingMode } from "@/lib/sing/types";

/** Same five practice options as ÁMi Sing, labeled for the English course. */
export const ENGLISH_KARAOKE_MODES: { id: SingMode; label: string; hint: string }[] = [
  { id: "listen", label: "Nghe", hint: "Nghe từng câu. Bấm từ để nghe lại." },
  { id: "understand", label: "Hiểu", hint: "Xem nghĩa tiếng Việt của câu." },
  { id: "sing", label: "Hát", hint: "Hát theo lời. Chưa có nhạc đệm. Không chấm cao độ." },
  { id: "speak", label: "Nói", hint: "Nói câu này rõ. Giọng máy chỉ là mẫu." },
  { id: "improve", label: "Ôn", hint: "Ôn lại các câu trong bài." },
];

export function englishKaraokeModeIds(): SingMode[] {
  return ENGLISH_KARAOKE_MODES.map((mode) => mode.id);
}

export function sameModeIdsAsVietnameseSing(): boolean {
  return englishKaraokeModeIds().join(",") === SING_MODES.map((mode) => mode.id).join(",");
}
