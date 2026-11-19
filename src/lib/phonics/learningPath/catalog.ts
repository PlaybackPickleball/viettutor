import { WORLD_1, WORLD_1_LESSONS } from "./worlds/world1";
import { WORLD_2, WORLD_2_LESSONS } from "./worlds/world2";
import { WORLD_3, WORLD_3_LESSONS } from "./worlds/world3";
import { LESSONS_4_TO_12, WORLDS_4_TO_12 } from "./worlds/worlds4to12";
import type { LearningLesson, LearningWorld } from "./types";

export const LEARNING_WORLDS: LearningWorld[] = [
  WORLD_1,
  WORLD_2,
  WORLD_3,
  ...WORLDS_4_TO_12,
];

export const LEARNING_LESSONS: LearningLesson[] = [
  ...WORLD_1_LESSONS,
  ...WORLD_2_LESSONS,
  ...WORLD_3_LESSONS,
  ...LESSONS_4_TO_12,
];

export function getWorld(id: string): LearningWorld | undefined {
  return LEARNING_WORLDS.find((w) => w.id === id);
}

export function getPathLesson(id: string): LearningLesson | undefined {
  return LEARNING_LESSONS.find((l) => l.id === id);
}

export function getWorldLessons(worldId: string): LearningLesson[] {
  return LEARNING_LESSONS.filter((l) => l.worldId === worldId).sort((a, b) => a.order - b.order);
}

export function getPlayableLessons(): LearningLesson[] {
  return LEARNING_LESSONS.filter((l) => l.playable);
}

export function getNextPathLesson(lessonId: string): LearningLesson | undefined {
  const current = getPathLesson(lessonId);
  if (!current) return undefined;
  const siblings = getWorldLessons(current.worldId);
  const nextInWorld = siblings.find((l) => l.order === current.order + 1 && l.playable);
  if (nextInWorld) return nextInWorld;
  const world = getWorld(current.worldId);
  if (!world) return undefined;
  const nextWorld = LEARNING_WORLDS.find((w) => w.order === world.order + 1 && w.playable);
  if (!nextWorld) return undefined;
  return getWorldLessons(nextWorld.id).find((l) => l.playable && l.order === 1);
}

export function getFirstPlayableLesson(): LearningLesson {
  return getPlayableLessons()[0]!;
}
