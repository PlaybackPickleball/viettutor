import { describe, expect, it } from "vitest";
import { lessonHasFullLoop } from "@/lib/phonics/learningPath/lessonLoop";
import { listUnit1Lessons } from "./unit1Lessons";

describe("Unit 1 Discover lessons", () => {
  const lessons = listUnit1Lessons();

  it("ships exactly 8 playable lessons", () => {
    expect(lessons).toHaveLength(8);
    expect(lessons.every((l) => l.playable)).toBe(true);
  });

  it("every lesson has Hear → Write → Say → Review", () => {
    for (const lesson of lessons) {
      expect(lessonHasFullLoop(lesson), lesson.id).toBe(true);
    }
  });

  it("introduces early communicative phrases before unit end", () => {
    const early = lessons.filter((l) => l.order <= 5);
    const skills = early.flatMap((l) => l.introducesSkillIds);
    expect(skills).toContain("phrase-xin-chao");
    expect(skills).toContain("phrase-toi-ten-la");
    expect(skills).toContain("phrase-mot-ca-phe");
  });

  it("includes question phrases in Unit 1", () => {
    const skills = lessons.flatMap((l) => [...l.introducesSkillIds, ...l.reviewSkillIds]);
    expect(skills).toContain("phrase-ban-khoe");
    expect(skills).toContain("phrase-bao-nhieu");
  });

  it("uses speak-compare (Deepgram path) without inventing score fields", () => {
    const speak = lessons.flatMap((l) => l.exercises).filter((e) => e.type === "speak-compare");
    expect(speak.length).toBeGreaterThan(5);
    for (const ex of speak) {
      expect(ex.hintEn?.toLowerCase()).toMatch(/deepgram|match|score/);
    }
  });
});
