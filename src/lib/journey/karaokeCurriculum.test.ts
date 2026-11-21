import { describe, expect, it } from "vitest";
import {
  isCurriculumKaraokeEligible,
  listKaraokeCurriculumHooks,
} from "./karaokeCurriculum";

describe("karaoke curriculum hooks", () => {
  it("only lists rights-approved karaoke songs", () => {
    const hooks = listKaraokeCurriculumHooks();
    expect(hooks.length).toBeGreaterThanOrEqual(2);
    for (const hook of hooks) {
      expect(isCurriculumKaraokeEligible(hook.songId)).toBe(true);
      expect(hook.href).toBe(`/sing/${hook.songId}`);
      expect(["licensed", "original"]).toContain(hook.source);
    }
  });

  it("includes licensed ballads and ÁMi original greeting song", () => {
    const ids = listKaraokeCurriculumHooks().map((h) => h.songId);
    expect(ids).toContain("xin-chao-moi-ngay");
    expect(ids).toContain("hat-mua-vuong-van");
    expect(ids).toContain("ngay-mai-nguoi-ta-lay-chong");
  });

  it("rejects unknown / unapproved song ids", () => {
    expect(isCurriculumKaraokeEligible("not-a-real-song")).toBe(false);
  });
});
