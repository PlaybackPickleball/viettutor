import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { stageInteraction } from "./a11y";
import { combineCorrect, displayOrder } from "./buildLesson";
import { canOpenLesson, ENGLISH_LESSONS, getEnglishLesson, glossaryEntries } from "./curriculum";
import { ENGLISH_PRONUNCIATION } from "./feedback";
import { GOALS, suggestedLessonIds } from "./onboarding";
import { shouldScore } from "./recording";
import { getScenario } from "./scenarios";

const KINDS = [
  "listen",
  "recognize",
  "repeat",
  "pronounce",
  "understand",
  "combine",
  "converse",
  "review",
] as const;

describe("English curriculum", () => {
  it("loads 30 real lessons with content, not title placeholders", () => {
    expect(ENGLISH_LESSONS).toHaveLength(30);
    const ids = ENGLISH_LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(30);
    expect(ids[0]).toBe("d01");
    expect(ids[29]).toBe("d30");
    for (const lesson of ENGLISH_LESSONS) {
      expect(lesson.objectives.length).toBeGreaterThan(0);
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
      expect(lesson.targets.length).toBeGreaterThan(0);
      expect(lesson.stages.length).toBeGreaterThan(1);
      expect(lesson.completionVi.length).toBeGreaterThan(20);
      expect(lesson.accent).toBe("american");
      expect(lesson.audio).toBe("browser-en-US");
      expect(lesson.titleVi).not.toMatch(/^bài\s+\d+$/i);
      for (const vocab of lesson.vocabulary) {
        expect(vocab.en.trim().length).toBeGreaterThan(0);
        expect(vocab.vi.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("teaches Hello, then the name sentence, on day 1", () => {
    const lesson = getEnglishLesson("d01");
    expect(lesson).toBeTruthy();
    const spoken = lesson!.stages
      .map((stage) => ("en" in stage ? stage.en : ""))
      .join(" | ");
    expect(spoken).toMatch(/Hello/);
    expect(spoken).toMatch(/Hello my name is Lan/);
    expect(lesson!.stages.some((stage) => stage.kind === "pronounce" && "en" in stage && stage.en === "Hello")).toBe(
      true,
    );
    expect(lesson!.stages.some((stage) => stage.kind === "converse")).toBe(true);
  });

  it("gives days 1–28 the full beginner path and keeps day 29–30 special", () => {
    for (const lesson of ENGLISH_LESSONS.filter((item) => item.day <= 28)) {
      const kinds = new Set(lesson.stages.map((stage) => stage.kind));
      for (const kind of KINDS) expect(kinds.has(kind), lesson.id).toBe(true);
    }
    expect(getEnglishLesson("d29")?.stages.some((stage) => stage.kind === "scenario")).toBe(true);
    expect(getScenario("greet-customer")?.steps.length).toBeGreaterThan(2);
    expect(getScenario("sell-coffee")?.suggestedEn).toMatch(/coffee/i);
    const summary = getEnglishLesson("d30")?.stages.find((stage) => stage.kind === "summary");
    expect(summary && "phrases" in summary ? summary.phrases : []).toHaveLength(5);
  });

  it("opens the intro lesson for a guest", () => {
    expect(canOpenLesson("d01", { signedIn: false })).toEqual({ ok: true, reason: "local-guest" });
    expect(canOpenLesson("missing", { signedIn: true }).ok).toBe(false);
  });

  it("points goal shortcuts at real lessons", () => {
    for (const goal of GOALS) {
      for (const id of goal.lessons) expect(getEnglishLesson(id)).toBeTruthy();
    }
    expect(suggestedLessonIds(["business"])).toEqual(["d09", "d24"]);
  });

  it("shuffles sentence chips without dropping words", () => {
    const tokens = ["Hello", "my", "name", "is", "Lan"];
    const shown = displayOrder(tokens, "d01-combine");
    expect(shown.slice().sort()).toEqual(tokens.slice().sort());
    expect(shown.join(" ")).not.toBe(tokens.join(" "));
    expect(combineCorrect(tokens, tokens)).toBe(true);
    expect(combineCorrect(tokens, shown)).toBe(false);
  });

  it("does not use the Vietnamese tone engine", () => {
    expect(ENGLISH_PRONUNCIATION.engine).toBe("intelligibility");
    const source = readFileSync("src/lib/english/feedback.ts", "utf8");
    expect(source).not.toMatch(/mockScorer/);
    expect(shouldScore("pronounce")).toBe(true);
    expect(shouldScore("repeat")).toBe(false);
  });

  it("builds a glossary learners can tap", () => {
    const gloss = glossaryEntries();
    expect(gloss.some((item) => item.en.toLowerCase() === "hello" && item.vi.includes("Xin chào"))).toBe(true);
  });

  it("keeps every stage keyboard-friendly", () => {
    for (const lesson of ENGLISH_LESSONS) {
      for (const stage of lesson.stages) {
        const interaction = stageInteraction(stage.kind);
        expect(interaction.replay).toBe(true);
        expect(interaction.countdown).toBe(false);
        expect(interaction.swipeOnly).toBe(false);
        expect(interaction.typingRequired).toBe(false);
        expect(interaction.primaryLabel).toBe("Tiếp tục");
      }
    }
  });
});
