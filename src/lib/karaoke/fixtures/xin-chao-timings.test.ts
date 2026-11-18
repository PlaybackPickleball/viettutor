import { describe, expect, it } from "vitest";
import { XIN_CHAO_BILINGUAL } from "./xin-chao-bilingual";

describe("xin-chao hand-tuned timings", () => {
  it("is marked hand-tune-v1 with audio-clock offset 0", () => {
    expect(XIN_CHAO_BILINGUAL.pipelineVersion).toBe("hand-tune-v1");
    expect(XIN_CHAO_BILINGUAL.globalOffsetMs).toBe(0);
  });

  it("uses uneven token spans (not equal even-split)", () => {
    const spans = XIN_CHAO_BILINGUAL.lines.flatMap((line) =>
      line.tokens.map((t) => t.endMs - t.startMs),
    );
    expect(new Set(spans).size).toBeGreaterThan(1);
    // Lingua holds longer than ÁMi
    const ami = XIN_CHAO_BILINGUAL.lines[3]?.tokens.find((t) => t.text === "ÁMi");
    const lingua = XIN_CHAO_BILINGUAL.lines[3]?.tokens.find((t) => t.text === "Lingua");
    expect((lingua?.endMs ?? 0) - (lingua?.startMs ?? 0)).toBeGreaterThan(
      (ami?.endMs ?? 0) - (ami?.startMs ?? 0),
    );
  });

  it("keeps tokens contiguous within each line", () => {
    for (const line of XIN_CHAO_BILINGUAL.lines) {
      expect(line.tokens[0]?.startMs).toBe(line.startMs);
      expect(line.tokens.at(-1)?.endMs).toBe(line.endMs);
      for (let i = 1; i < line.tokens.length; i += 1) {
        expect(line.tokens[i]?.startMs).toBe(line.tokens[i - 1]?.endMs);
      }
    }
  });
});
