/**
 * Cross-surface "already studied" checks for Đánh Vần 2.0 Phase 5.
 * Honest mastery only — no pronunciation scores.
 */

import { getPathLesson } from "./catalog";
import { getSkill } from "./skills";
import { getSyllable, getSyllableByWritten } from "./syllables";
import type { PathProgressState, SkillMasteryLevel } from "./types";

export type PathItemLearnStatus = {
  level: SkillMasteryLevel | "unseen";
  labelEn: string;
  skillId?: string;
  /** True when a completed path lesson targeted this written form. */
  onPath: boolean;
};

/** Map common single letters to path skill ids. */
const LETTER_SKILL: Record<string, string> = {
  a: "letter-a",
  b: "letter-b",
  o: "letter-o",
  m: "letter-m",
  n: "letter-n",
  t: "letter-t",
  h: "letter-h",
  l: "letter-l",
  c: "letter-c",
  k: "letter-k",
  v: "letter-v",
  g: "letter-g",
};

const LEVEL_RANK: Record<SkillMasteryLevel | "unseen", number> = {
  unseen: 0,
  new: 1,
  learning: 2,
  familiar: 3,
  mastered: 4,
};

function candidateSkillIds(written: string): string[] {
  const key = written.trim();
  const letterSkillId = LETTER_SKILL[key.toLowerCase()];
  const syl = getSyllableByWritten(key);
  const ids = [
    letterSkillId,
    key === "ba" || key === "má" || key === "bá" || key === "bà" ? "vocab-ba-ma" : undefined,
    key === "bo" || key === "bò" ? "vocab-bo" : undefined,
  ].filter(Boolean) as string[];

  if (syl?.vocab?.conversational) {
    if (syl.written === "ba" || syl.written.startsWith("b") && syl.id.startsWith("ba")) {
      ids.push("vocab-ba-ma");
    }
    if (syl.id.startsWith("bo")) ids.push("vocab-bo");
  }
  return [...new Set(ids)];
}

export function pathStatusForWritten(
  state: PathProgressState,
  written: string,
): PathItemLearnStatus {
  const key = written.trim();
  if (!key) return { level: "unseen", labelEn: "Not studied yet", onPath: false };

  let onPath = false;
  for (const [lessonId, rec] of Object.entries(state.lessons)) {
    if (!rec.completed) continue;
    const lesson = getPathLesson(lessonId);
    if (!lesson) continue;
    if (lesson.targetSyllableIds.some((id) => getSyllable(id)?.written === key)) {
      onPath = true;
    }
    const letterSkill = LETTER_SKILL[key.toLowerCase()];
    if (letterSkill && lesson.introducesSkillIds.includes(letterSkill)) {
      onPath = true;
    }
  }

  let best: SkillMasteryLevel | "unseen" = "unseen";
  let bestSkill: string | undefined;
  for (const id of candidateSkillIds(key)) {
    const rec = state.skills[id];
    if (!rec) continue;
    if (LEVEL_RANK[rec.level] > LEVEL_RANK[best]) {
      best = rec.level;
      bestSkill = id;
    }
  }

  if (onPath && best === "unseen") best = "learning";

  const skill = bestSkill ? getSkill(bestSkill) : undefined;
  const labelEn =
    best === "unseen"
      ? "Not studied yet"
      : best === "mastered"
        ? `Mastered${skill ? ` · ${skill.labelEn}` : ""}`
        : best === "familiar"
          ? `Familiar${skill ? ` · ${skill.labelEn}` : ""}`
          : `Studied on path${skill ? ` · ${skill.labelEn}` : ""}`;

  return { level: best, labelEn, skillId: bestSkill, onPath };
}

export function masteredSkillSummaries(
  state: PathProgressState,
  limit = 8,
): { id: string; labelEn: string; level: SkillMasteryLevel }[] {
  const order = { mastered: 0, familiar: 1, learning: 2, new: 3 } as const;
  return Object.entries(state.skills)
    .filter(([, rec]) => rec.level === "familiar" || rec.level === "mastered")
    .sort(
      (a, b) =>
        order[a[1].level] - order[b[1].level] || b[1].correct - a[1].correct,
    )
    .slice(0, limit)
    .map(([id, rec]) => ({
      id,
      labelEn: getSkill(id)?.labelEn ?? id,
      level: rec.level,
    }));
}
