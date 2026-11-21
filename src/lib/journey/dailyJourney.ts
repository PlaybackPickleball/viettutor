/**
 * Personalized Daily Journey (~10 min) — assembled from learner progress.
 * Not a fixed routine: warm-up · learn · speak · fun challenge.
 */

import {
  continuePathHref,
  loadPathProgress,
  skillsDueForReview,
} from "@/lib/phonics/learningPath";
import { loadProgress } from "@/lib/progress";
import { loadVocab } from "@/lib/vocab/store";
import { nextUntouchedKaraokeHook } from "./karaokeCurriculum";
import { resolveContinueLearning, loadJourneyProgress } from "./progress";

export type DailyJourneyPhase = "warmup" | "learn" | "speak" | "fun";

export type DailyJourneyBlock = {
  phase: DailyJourneyPhase;
  titleEn: string;
  blurb: string;
  durationMin: number;
  href: string;
};

export type DailyJourneyPlan = {
  totalMin: number;
  blocks: DailyJourneyBlock[];
  assembledAt: string;
};

export function assembleDailyJourney(): DailyJourneyPlan {
  const path = loadPathProgress();
  const journey = loadJourneyProgress();
  const alphabet = loadProgress();
  const continueTarget = resolveContinueLearning(journey, alphabet, path);
  const due = skillsDueForReview(path, 3);
  const vocab = loadVocab();
  const recentVocab = vocab.slice(0, 3).map((v) => v.expression);

  const warmup: DailyJourneyBlock =
    due.length > 0
      ? {
          phase: "warmup",
          titleEn: `Warm up · ${Math.min(3, due.length)} skills due`,
          blurb: "Spaced revisit from Đánh Vần (~2 min).",
          durationMin: 2,
          href: "/danh-van/review",
        }
      : recentVocab.length > 0
        ? {
            phase: "warmup",
            titleEn: `Warm up · ${recentVocab.join(", ")}`,
            blurb: "About 3 words from your saved list (~2 min).",
            durationMin: 2,
            href: "/vocab",
          }
        : {
            phase: "warmup",
            titleEn: "Warm up · listen again",
            blurb: "Replay yesterday’s greeting or sound (~2 min).",
            durationMin: 2,
            href: continueTarget.href,
          };

  const learn: DailyJourneyBlock = {
    phase: "learn",
    titleEn: `Learn · ${continueTarget.lessonTitle}`,
    blurb: `${continueTarget.unitTitle} — new sound or phrase (~4 min).`,
    durationMin: 4,
    href: continueTarget.href,
  };

  const letter = alphabet.currentLetterId || "a";
  const speak: DailyJourneyBlock = {
    phase: "speak",
    titleEn: "Speak & listen",
    blurb: "Deepgram Vietnamese match — never an invented score (~2 min).",
    durationMin: 2,
    href: continueTarget.href.startsWith("/learn/")
      ? continueTarget.href
      : `/studio/${letter}/say`,
  };

  const karaokeHook = nextUntouchedKaraokeHook();

  const fun: DailyJourneyBlock = karaokeHook
    ? {
        phase: "fun",
        titleEn: `Fun · ${karaokeHook.titleVi}`,
        blurb: `${karaokeHook.focusEn} — karaoke lyric (~2 min).`,
        durationMin: 2,
        href: karaokeHook.href,
      }
    : {
        phase: "fun",
        titleEn: "Fun · path challenge",
        blurb: "A short Đánh Vần challenge (~2 min).",
        durationMin: 2,
        href: continuePathHref(path) || "/danh-van",
      };

  const blocks = [warmup, learn, speak, fun];
  return {
    totalMin: blocks.reduce((n, b) => n + b.durationMin, 0),
    blocks,
    assembledAt: new Date().toISOString(),
  };
}
