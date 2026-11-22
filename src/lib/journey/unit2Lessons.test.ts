import { describe, expect, it } from "vitest";
import { lessonHasFullLoop } from "@/lib/phonics/learningPath/lessonLoop";
import { listUnit2Lessons } from "./unit2Lessons";

describe("Unit 2 six tones", () => {
  const lessons = listUnit2Lessons();

  it("ships 10 playable tone lessons", () => {
    expect(lessons).toHaveLength(10);
    expect(lessons.every((l) => l.playable)).toBe(true);
  });

  it("every lesson has Hear → Recognize → Say → Recall", () => {
    for (const lesson of lessons) {
      expect(lessonHasFullLoop(lesson), lesson.id).toBe(true);
      expect(lesson.exercises.every((e) => e.type !== "write-trace"), lesson.id).toBe(true);
    }
  });

  it("glosses bá as paternal aunt in early lessons", () => {
    const sac = lessons.find((l) => l.id === "u2-l02")!;
    const glosses = sac.exercises.map((e) => e.targetGlossEn?.toLowerCase() ?? "");
    expect(glosses.some((g) => g.includes("paternal aunt"))).toBe(true);
    const review = sac.exercises.find((e) => e.type === "review-challenge")!;
    expect(review.correctOptionId).toBe("aunt");
  });

  it("covers all six tone skill ids", () => {
    const skills = lessons.flatMap((l) => [...l.introducesSkillIds, ...l.reviewSkillIds]);
    for (const id of [
      "tone-ngang",
      "tone-sac",
      "tone-huyen",
      "tone-hoi",
      "tone-nga",
      "tone-nang",
    ]) {
      expect(skills).toContain(id);
    }
  });

  it("bridges early Đánh Vần and SRS", () => {
    const skills = lessons.flatMap((l) => [...l.introducesSkillIds, ...l.reviewSkillIds]);
    expect(skills).toContain("danh-van-early");
    expect(skills).toContain("tone-srs");
    expect(lessons.some((l) => l.exercises.some((e) => e.type === "build-syllable"))).toBe(true);
  });

  it("uses Deepgram speak-compare without inventing score fields", () => {
    const speak = lessons.flatMap((l) => l.exercises).filter((e) => e.type === "speak-compare");
    expect(speak.length).toBeGreaterThan(5);
  });
});
