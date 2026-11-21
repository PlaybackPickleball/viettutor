import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { listPackWords } from "./catalog";
import {
  VOCAB_AUDIO_CATALOG,
  VOCAB_MALE_PACK_IDS,
  VOCAB_PACK_AUDIO_ENABLED,
  suspectVocabClips,
  vocabAudioClipForPackId,
  vocabAudioPathForPackId,
  vocabAudioVoiceForPackId,
  vocabNativePathForWord,
  vocabPlaybackPathForWordId,
} from "./audio";

describe("vocabulary pack audio", () => {
  it("lists exactly 100 clips mapped to pack IDs 1–100", () => {
    expect(VOCAB_AUDIO_CATALOG).toHaveLength(100);
    expect(VOCAB_AUDIO_CATALOG.map((c) => c.packId)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
    expect(VOCAB_AUDIO_CATALOG.map((c) => c.wordId)).toEqual(
      listPackWords().map((w) => w.id),
    );
  });

  it("maps male spoken order to original IDs 1,3,5,6,8,11,15,51,52,59", () => {
    expect([...VOCAB_MALE_PACK_IDS]).toEqual([1, 3, 5, 6, 8, 11, 15, 51, 52, 59]);
    for (const id of VOCAB_MALE_PACK_IDS) {
      expect(vocabAudioVoiceForPackId(id)).toBe("male");
      expect(vocabAudioClipForPackId(id)?.voice).toBe("male");
    }
    const female = VOCAB_AUDIO_CATALOG.filter((c) => c.voice === "female");
    expect(female).toHaveLength(90);
    expect(female.every((c) => !VOCAB_MALE_PACK_IDS.includes(c.packId as (typeof VOCAB_MALE_PACK_IDS)[number]))).toBe(
      true,
    );
  });

  it("uses stable public paths by original ID", () => {
    expect(vocabAudioPathForPackId(1)).toBe("/audio/vi/vocabulary/v001.mp3");
    expect(vocabAudioPathForPackId(59)).toBe("/audio/vi/vocabulary/v059.mp3");
    expect(vocabPlaybackPathForWordId("v092")).toBe("/audio/vi/vocabulary/v092.mp3");
    expect(vocabAudioClipForPackId(1)?.vi).toBe("tôi");
    expect(vocabAudioClipForPackId(59)?.vi).toBe("làm");
  });

  it("gates learner native paths behind the approval flag", () => {
    expect(VOCAB_PACK_AUDIO_ENABLED).toBe(false);
    const first = listPackWords()[0]!;
    expect(vocabNativePathForWord(first)).toBeNull();
    expect(vocabPlaybackPathForWordId(first.id)).toBe("/audio/vi/vocabulary/v001.mp3");
  });

  it("flags short / overlap suspects from silence detect", () => {
    const suspects = suspectVocabClips();
    const ids = suspects.map((c) => c.wordId).sort();
    expect(ids).toContain("v036");
    expect(ids).toContain("v078");
    expect(ids).toContain("v092");
    expect(vocabAudioClipForPackId(78)?.autoFlags).toContain("overlap");
    expect(vocabAudioClipForPackId(92)?.autoFlags).toContain("short");
  });

  it("has every clip file on disk", () => {
    const root = join(process.cwd(), "public");
    const missing = VOCAB_AUDIO_CATALOG.filter((c) => !existsSync(join(root, c.path.slice(1))));
    expect(missing.map((c) => c.filename)).toEqual([]);
    expect(existsSync(join(root, "audio/vi/vocabulary/source/male-10.mp3"))).toBe(true);
    expect(existsSync(join(root, "audio/vi/vocabulary/source/female-90.mp3"))).toBe(true);
  });
});
