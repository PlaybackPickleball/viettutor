import { afterEach, describe, expect, it, vi } from "vitest";
import type { SingProgress } from "./types";
import {
  KARAOKE_MODE_COUNT,
  MODE_COUNT,
  isSongModesComplete,
  karaokeModesCompletedCount,
  modeSlotCountForSong,
  modesCompletedDisplayCount,
} from "./progress";

function install() {
  const mem = new Map<string, string>();
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("karaoke-aware mode slots", () => {
  it("uses 3 slots for karaoke fixtures and 5 for legacy-only songs", () => {
    install();
    expect(modeSlotCountForSong("xin-chao-moi-ngay")).toBe(KARAOKE_MODE_COUNT);
    expect(modeSlotCountForSong("hat-mua-vuong-van")).toBe(KARAOKE_MODE_COUNT);
    expect(modeSlotCountForSong("practice_001")).toBe(MODE_COUNT);
  });

  it("counts only Learn/Sing/Practice stamps toward karaoke completion", () => {
    const partial: SingProgress = {
      songId: "xin-chao-moi-ngay",
      modesCompleted: ["listen", "understand", "sing"],
      vocabSaved: 0,
      updatedAt: new Date().toISOString(),
    };
    expect(karaokeModesCompletedCount(partial)).toBe(2);
    expect(modesCompletedDisplayCount("xin-chao-moi-ngay", partial)).toBe(2);
    expect(isSongModesComplete("xin-chao-moi-ngay", partial)).toBe(false);

    const done: SingProgress = {
      ...partial,
      modesCompleted: ["understand", "sing", "speak", "listen"],
    };
    expect(karaokeModesCompletedCount(done)).toBe(3);
    expect(isSongModesComplete("xin-chao-moi-ngay", done)).toBe(true);
  });
});
