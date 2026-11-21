import type { LearningLesson } from "@/lib/phonics/learningPath/types";
import { getUnit1Lesson, listUnit1Lessons } from "./unit1Lessons";
import { getUnit2Lesson, listUnit2Lessons } from "./unit2Lessons";

/** Playable journey lessons backed by the reusable path exercise engine. */
export function getJourneyPlayableLesson(id: string): LearningLesson | undefined {
  return getUnit1Lesson(id) ?? getUnit2Lesson(id);
}

export function listJourneyPlayableLessons(): LearningLesson[] {
  return [...listUnit1Lessons(), ...listUnit2Lessons()];
}

export function isJourneyEngineLesson(id: string): boolean {
  return Boolean(getJourneyPlayableLesson(id));
}

export function journeyUnitIdFromWorld(worldId: string): string {
  if (worldId === "journey-u2") return "u2";
  if (worldId === "journey-u1") return "u1";
  return worldId.replace(/^journey-/, "") || "u1";
}

export function nextJourneyEngineLesson(lessonId: string): LearningLesson | undefined {
  const all = listJourneyPlayableLessons();
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx < 0) return undefined;
  return all[idx + 1];
}
