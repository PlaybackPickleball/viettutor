import { describe, expect, it } from "vitest";
import {
  detectToneId,
  parseOpenSyllable,
  resolveSequence,
  sequenceLabel,
  stripTones,
} from "./engine";
import { getIntroLesson, getPhonicsLesson, PHONICS_LESSONS } from "./lessons";
import { defaultPhonicsProgress, isLessonUnlocked } from "./progress";

describe("phonics engine", () => {
  it("detects six tones on ma family", () => {
    expect(detectToneId("ma")).toBe("ngang");
    expect(detectToneId("má")).toBe("sac");
    expect(detectToneId("mà")).toBe("huyen");
    expect(detectToneId("mả")).toBe("hoi");
    expect(detectToneId("mã")).toBe("nga");
    expect(detectToneId("mạ")).toBe("nang");
  });

  it("strips tones without inventing letters", () => {
    expect(stripTones("bá")).toBe("ba");
    expect(stripTones("mả")).toBe("ma");
  });

  it("parses open CV syllables including multi-letter initials", () => {
    expect(parseOpenSyllable("ba")).toEqual({ initial: "b", vowel: "a", tone: "ngang" });
    expect(parseOpenSyllable("bá")).toEqual({ initial: "b", vowel: "a", tone: "sac" });
    expect(parseOpenSyllable("nhà")).toEqual({ initial: "nh", vowel: "a", tone: "huyen" });
  });

  it("returns authored ba-sac sequence bờ – a – ba – sắc – bá", () => {
    const steps = resolveSequence("bá");
    expect(steps).not.toBeNull();
    expect(sequenceLabel(steps!)).toBe("bờ – a – ba – sắc – bá");
    const lesson = getPhonicsLesson("ba-sac");
    expect(lesson?.steps?.map((s) => s.utterance)).toEqual(["bờ", "a", "ba", "sắc", "bá"]);
  });

  it("ships exactly 12 intro lessons", () => {
    expect(PHONICS_LESSONS).toHaveLength(12);
    expect(PHONICS_LESSONS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("does not invent sequences for unknown closed syllables", () => {
    expect(resolveSequence("bánh")).toBeNull();
  });

  it("keeps intro bá lesson unlocked for fresh learners", () => {
    const fresh = defaultPhonicsProgress();
    expect(getIntroLesson().id).toBe("ba-sac");
    expect(isLessonUnlocked(fresh, "ba-open")).toBe(true);
    expect(isLessonUnlocked(fresh, "ba-sac")).toBe(true);
    expect(isLessonUnlocked(fresh, "ma-six-tones")).toBe(false);
  });
});
