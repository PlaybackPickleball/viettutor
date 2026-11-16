import type { StageKind } from "./lessonTypes";

export const REPLAY_LABEL = "Nghe lại";
export const SLOW_LABEL = "Nghe chậm";
export const CONTINUE_LABEL = "Tiếp tục";
export const RETRY_LABEL = "Thử lại";
export const RECORD_LABEL = "Ghi âm";
export const HEARD_LABEL = "Tôi đã nghe";
export const PREVIOUS_LABEL = "Bài trước";

export type StageInteraction = {
  mode: "listen" | "choices" | "record" | "build" | "read" | "scenario";
  replay: true;
  countdown: false;
  swipeOnly: false;
  typingRequired: false;
  /** One primary action after the task control. Choices themselves are the task. */
  primaryLabel: string;
};

const MODES: Record<StageKind, StageInteraction["mode"]> = {
  listen: "listen",
  recognize: "choices",
  repeat: "record",
  pronounce: "record",
  understand: "choices",
  combine: "build",
  converse: "record",
  scenario: "scenario",
  review: "read",
  summary: "read",
};

export function stageInteraction(kind: StageKind): StageInteraction {
  return {
    mode: MODES[kind],
    replay: true,
    countdown: false,
    swipeOnly: false,
    typingRequired: false,
    primaryLabel: kind === "listen" || kind === "review" ? CONTINUE_LABEL : CONTINUE_LABEL,
  };
}

export function replayRate(slow: boolean): number {
  return slow ? 0.68 : 0.85;
}
