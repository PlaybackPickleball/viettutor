import { describe, expect, it } from "vitest";
import { HAT_MUA_KARAOKE, NGAY_MAI_KARAOKE } from "./fixtures/loadFixture";
import { XIN_CHAO_BILINGUAL } from "./fixtures/xin-chao-bilingual";
import { vocalsStartAudioSec } from "./engine";
import {
  LICENSED_DEMO_GLOBAL_OFFSET_MS,
  withLicensedDemoOffset,
} from "./demoOffsets";

describe("licensed demo globalOffsetMs", () => {
  it("seeds every licensed demo song id", () => {
    expect(Object.keys(LICENSED_DEMO_GLOBAL_OFFSET_MS).sort()).toEqual([
      "hat-mua-vuong-van",
      "ngay-mai-nguoi-ta-lay-chong",
      "xin-chao-moi-ngay",
    ]);
  });

  it("applies Hat Mưa advance so skip-intro lands nearer first sung onset", () => {
    const seeded = withLicensedDemoOffset(HAT_MUA_KARAOKE);
    expect(seeded.globalOffsetMs).toBe(-500);
    const audioSec = vocalsStartAudioSec(seeded);
    expect(audioSec).toBeCloseTo((31340 - 500) / 1000, 5);
  });

  it("keeps Ngày Mai at an explicit 0 seed", () => {
    expect(withLicensedDemoOffset(NGAY_MAI_KARAOKE).globalOffsetMs).toBe(0);
  });

  it("keeps Xin chào on the audio clock after hand-tune", () => {
    expect(XIN_CHAO_BILINGUAL.globalOffsetMs).toBe(0);
    expect(XIN_CHAO_BILINGUAL.pipelineVersion).toBe("hand-tune-v1");
    expect(vocalsStartAudioSec(XIN_CHAO_BILINGUAL)).toBeCloseTo(0.1, 5);
  });
});
