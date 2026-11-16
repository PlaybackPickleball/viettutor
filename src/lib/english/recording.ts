/** Recording phase machine. UI maps browser events onto these. No timers. */

export type RecPhase =
  | "idle"
  | "requesting"
  | "recording"
  | "no_speech"
  | "assessing"
  | "result"
  | "denied"
  | "listening_only"
  | "service_failed";

export type RecEvent =
  | { type: "ask" }
  | { type: "granted" }
  | { type: "denied" }
  | { type: "no_speech" }
  | { type: "captured" }
  | { type: "assessed" }
  | { type: "assess_failed" }
  | { type: "use_listen_only" }
  | { type: "reset" };

export function reduceRecording(phase: RecPhase, event: RecEvent): RecPhase {
  if (event.type === "reset") return "idle";
  if (event.type === "use_listen_only") return "listening_only";

  switch (phase) {
    case "idle":
    case "no_speech":
    case "result":
    case "service_failed":
    case "listening_only":
      if (event.type === "ask") return "requesting";
      return phase;
    case "requesting":
      if (event.type === "granted") return "recording";
      if (event.type === "denied") return "denied";
      return phase;
    case "recording":
      if (event.type === "no_speech") return "no_speech";
      if (event.type === "captured") return "assessing";
      return phase;
    case "assessing":
      if (event.type === "assessed") return "result";
      if (event.type === "assess_failed") return "service_failed";
      return phase;
    case "denied":
      return phase;
    default:
      return phase;
  }
}

/** Record stays locked until the learner has played the model for this step. */
export function recordUnlocked(heardModel: boolean): boolean {
  return heardModel;
}

export function shouldScore(kind: string): boolean {
  return kind === "pronounce";
}
