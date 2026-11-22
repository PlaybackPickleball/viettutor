import { describe, expect, it } from "vitest";
import {
  ALPHABET_29_ORDER,
  ALPHABET_AUDIO_CATALOG,
  ALPHABET_LETTER_AUDIO_ENABLED,
  ALPHABET_LETTER_ID_BY_GRAPHEME,
  ALPHABET_SLUG_BY_GRAPHEME,
  alphabetClipForGrapheme,
  alphabetClipForLetterId,
  alphabetClipPathForSlug,
  alphabetNativePathForGrapheme,
  alphabetNativePathForLetter,
  alphabetPlaybackPathForGrapheme,
  alphabetPlaybackPathForLetter,
  suspectAlphabetClips,
} from "./alphabetAudio";
import { getLetter } from "./letters";

describe("alphabet audio catalog", () => {
  it("lists exactly 29 letters in traditional order", () => {
    expect(ALPHABET_29_ORDER).toHaveLength(29);
    expect(ALPHABET_AUDIO_CATALOG).toHaveLength(29);
    expect(ALPHABET_AUDIO_CATALOG.map((c) => c.grapheme).join(" ")).toBe(
      "a ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y",
    );
  });

  it("uses stable ASCII slugs and zero-padded filenames", () => {
    expect(ALPHABET_SLUG_BY_GRAPHEME["ă"]).toBe("aw");
    expect(ALPHABET_SLUG_BY_GRAPHEME["â"]).toBe("aa");
    expect(ALPHABET_SLUG_BY_GRAPHEME["đ"]).toBe("dd");
    expect(ALPHABET_SLUG_BY_GRAPHEME["ơ"]).toBe("ow");
    expect(ALPHABET_SLUG_BY_GRAPHEME["ư"]).toBe("uw");
    expect(alphabetClipPathForSlug("aw")).toBe("/audio/vi/alphabet/alphabet_02_aw.mp3");
    expect(alphabetClipPathForSlug("dd")).toBe("/audio/vi/alphabet/alphabet_07_dd.mp3");
    expect(alphabetClipPathForSlug("y")).toBe("/audio/vi/alphabet/alphabet_29_y.mp3");
  });

  it("maps studio letter ids for every clip that has a lesson", () => {
    for (const clip of ALPHABET_AUDIO_CATALOG) {
      if (!clip.letterId) {
        expect(clip.grapheme).toBe("q");
        continue;
      }
      const lesson = getLetter(clip.letterId);
      expect(lesson, clip.letterId).toBeDefined();
      expect(lesson!.grapheme).toBe(clip.grapheme);
      expect(alphabetClipForLetterId(clip.letterId)?.path).toBe(clip.path);
    }
  });

  it("maps đ → d-bar and ă → a-breve", () => {
    expect(ALPHABET_LETTER_ID_BY_GRAPHEME["đ"]).toBe("d-bar");
    expect(alphabetClipForLetterId("d-bar")?.grapheme).toBe("đ");
    expect(alphabetPlaybackPathForLetter("a-breve")).toBe(
      "/audio/vi/alphabet/alphabet_02_aw.mp3",
    );
    expect(alphabetPlaybackPathForGrapheme("đ")).toBe("/audio/vi/alphabet/alphabet_07_dd.mp3");
  });

  it("reuses q clip for digraph qu playback path", () => {
    expect(alphabetClipForLetterId("qu")?.grapheme).toBe("q");
    expect(alphabetPlaybackPathForLetter("qu")).toBe("/audio/vi/alphabet/alphabet_21_q.mp3");
  });

  it("does not invent clips for digraphs without a single-letter master", () => {
    expect(alphabetClipForLetterId("ph")).toBeUndefined();
    expect(alphabetClipForLetterId("ng")).toBeUndefined();
    expect(alphabetPlaybackPathForLetter("ch")).toBeNull();
  });

  it("exposes studio native paths when the approval flag is on", () => {
    expect(ALPHABET_LETTER_AUDIO_ENABLED).toBe(true);
    expect(alphabetNativePathForLetter("a")).toBe("/audio/vi/alphabet/alphabet_01_a.mp3");
    expect(alphabetNativePathForLetter("a-breve")).toBe("/audio/vi/alphabet/alphabet_02_aw.mp3");
    expect(alphabetNativePathForLetter("d-bar")).toBe("/audio/vi/alphabet/alphabet_07_dd.mp3");
    expect(alphabetNativePathForLetter("ph")).toBeNull();
    expect(alphabetPlaybackPathForLetter("a")).toBe("/audio/vi/alphabet/alphabet_01_a.mp3");
    expect(alphabetNativePathForGrapheme("â")).toBe("/audio/vi/alphabet/alphabet_03_aa.mp3");
    expect(alphabetNativePathForGrapheme("ba")).toBeNull();
  });

  it("flags short s and x segments from silence detect", () => {
    const suspects = suspectAlphabetClips();
    expect(suspects.map((c) => c.grapheme).sort()).toEqual(["s", "x"]);
    expect(alphabetClipForGrapheme("s")?.autoFlags).toContain("short");
    expect(alphabetClipForGrapheme("x")?.autoFlags).toContain("short");
  });
});
