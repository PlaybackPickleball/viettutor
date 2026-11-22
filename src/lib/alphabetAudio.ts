/**
 * Alphabet letter clips (29 traditional letters).
 * Twenty letters (a–q set excluding l) use individual uploads; the rest still
 * come from the Thanh Ngọc ElevenLabs master silence-detect split.
 * Studio Hear/Say prefer these clips when ALPHABET_LETTER_AUDIO_ENABLED is true.
 */

export type AlphabetAudioFlag = "short" | "silent" | "overlap" | "overlap-risk" | "wrong-sound";

export type AlphabetAudioClip = {
  index: number;
  grapheme: string;
  /** ASCII filename slug (ă→aw, â→aa, đ→dd, ê→ee, ô→oo, ơ→ow, ư→uw). */
  slug: string;
  filename: string;
  path: string;
  speechStart: number;
  speechEnd: number;
  clipStart: number;
  clipEnd: number;
  speechDuration: number;
  autoFlags: AlphabetAudioFlag[];
  /** Studio letter id when the grapheme is on the alphabet path. */
  letterId: string | null;
};

/**
 * Enabled after Nicola approved `/review/alphabet-audio` (VLA-109).
 * Review page always plays clips; Hear/Say use native files when this is true.
 */
export const ALPHABET_LETTER_AUDIO_ENABLED = true;

export const ALPHABET_AUDIO_SOURCE_PATH = "/audio/vi/alphabet/source/elevenlabs-alphabet-29.mp3";

export const ALPHABET_AUDIO_MANIFEST_PATH = "/audio/vi/alphabet/manifest.json";

/** Exact traditional order for the ElevenLabs master. */
export const ALPHABET_29_ORDER = [
  "a",
  "ă",
  "â",
  "b",
  "c",
  "d",
  "đ",
  "e",
  "ê",
  "g",
  "h",
  "i",
  "k",
  "l",
  "m",
  "n",
  "o",
  "ô",
  "ơ",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "ư",
  "v",
  "x",
  "y",
] as const;

export type Alphabet29Grapheme = (typeof ALPHABET_29_ORDER)[number];

/** ASCII slugs used in filenames. */
export const ALPHABET_SLUG_BY_GRAPHEME: Record<Alphabet29Grapheme, string> = {
  a: "a",
  ă: "aw",
  â: "aa",
  b: "b",
  c: "c",
  d: "d",
  đ: "dd",
  e: "e",
  ê: "ee",
  g: "g",
  h: "h",
  i: "i",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  ô: "oo",
  ơ: "ow",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  ư: "uw",
  v: "v",
  x: "x",
  y: "y",
};

/**
 * Map traditional grapheme → studio `LetterLesson.id`.
 * `q` has no standalone lesson (curriculum uses digraph `qu`).
 */
export const ALPHABET_LETTER_ID_BY_GRAPHEME: Record<Alphabet29Grapheme, string | null> = {
  a: "a",
  ă: "a-breve",
  â: "a-circumflex",
  b: "b",
  c: "c",
  d: "d",
  đ: "d-bar",
  e: "e",
  ê: "e-circumflex",
  g: "g",
  h: "h",
  i: "i",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  ô: "o-circumflex",
  ơ: "o-horn",
  p: "p",
  q: null,
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  ư: "u-horn",
  v: "v",
  x: "x",
  y: "y",
};

/** Digraphs that may reuse a single-letter clip where appropriate. */
const DIGRAPH_CLIP_GRAPHEME: Record<string, Alphabet29Grapheme> = {
  qu: "q",
};

function filenameFor(index: number, slug: string): string {
  return `alphabet_${String(index).padStart(2, "0")}_${slug}.mp3`;
}

function pathFor(filename: string): string {
  return `/audio/vi/alphabet/${filename}`;
}

/**
 * Canonical clip inventory (paths + mapping). Timing defaults match the
 * silence-detect split of the Thanh Ngọc ElevenLabs master; review UI may nudge.
 */
export const ALPHABET_AUDIO_CLIPS: AlphabetAudioClip[] = ALPHABET_29_ORDER.map((grapheme, i) => {
  const index = i + 1;
  const slug = ALPHABET_SLUG_BY_GRAPHEME[grapheme];
  const filename = filenameFor(index, slug);
  return {
    index,
    grapheme,
    slug,
    filename,
    path: pathFor(filename),
    speechStart: 0,
    speechEnd: 0,
    clipStart: 0,
    clipEnd: 0,
    speechDuration: 0,
    autoFlags: [],
    letterId: ALPHABET_LETTER_ID_BY_GRAPHEME[grapheme],
  };
});

/**
 * Per-clip speech windows for the review UI.
 * Individual uploads are full-file (0 → duration); remaining master-split letters
 * keep silence-detect offsets from elevenlabs-alphabet-29.mp3.
 */
export const ALPHABET_AUDIO_DEFAULT_BOUNDS: ReadonlyArray<{
  speechStart: number;
  speechEnd: number;
  autoFlags: AlphabetAudioFlag[];
}> = [
  { speechStart: 0.0, speechEnd: 0.5486, autoFlags: [] }, // a (individual)
  { speechStart: 0.0, speechEnd: 0.6792, autoFlags: [] }, // ă (individual)
  { speechStart: 0.0, speechEnd: 0.7576, autoFlags: [] }, // â (individual)
  { speechStart: 0.0, speechEnd: 0.9143, autoFlags: [] }, // b (individual)
  { speechStart: 0.0, speechEnd: 0.8882, autoFlags: [] }, // c (individual)
  { speechStart: 0.0, speechEnd: 0.7576, autoFlags: [] }, // d (individual)
  { speechStart: 0.0, speechEnd: 0.7837, autoFlags: [] }, // đ (individual)
  { speechStart: 0.0, speechEnd: 0.7837, autoFlags: [] }, // e (individual)
  { speechStart: 0.0, speechEnd: 0.7576, autoFlags: [] }, // ê (individual)
  { speechStart: 0.0, speechEnd: 0.7837, autoFlags: [] }, // g (individual)
  { speechStart: 0.0, speechEnd: 0.6792, autoFlags: [] }, // h (individual)
  { speechStart: 0.0, speechEnd: 0.862, autoFlags: [] }, // i (individual)
  { speechStart: 0.0, speechEnd: 0.7837, autoFlags: [] }, // k (individual)
  { speechStart: 9.0172, speechEnd: 9.596, autoFlags: [] }, // l (master split)
  { speechStart: 0.0, speechEnd: 0.9927, autoFlags: [] }, // m (individual)
  { speechStart: 0.0, speechEnd: 0.9665, autoFlags: [] }, // n (individual)
  { speechStart: 0.0, speechEnd: 0.7576, autoFlags: [] }, // o (individual)
  { speechStart: 0.0, speechEnd: 0.7314, autoFlags: [] }, // ô (individual)
  { speechStart: 0.0, speechEnd: 0.7314, autoFlags: [] }, // ơ (individual)
  { speechStart: 0.0, speechEnd: 0.6792, autoFlags: [] }, // p (individual)
  { speechStart: 0.0, speechEnd: 0.7576, autoFlags: [] }, // q (individual)
  { speechStart: 14.8118, speechEnd: 15.3969, autoFlags: [] }, // r (master split)
  { speechStart: 15.5859, speechEnd: 15.752, autoFlags: ["short"] }, // s
  { speechStart: 16.2018, speechEnd: 16.5668, autoFlags: [] }, // t
  { speechStart: 16.8811, speechEnd: 17.2205, autoFlags: [] }, // u
  { speechStart: 17.4778, speechEnd: 17.8084, autoFlags: [] }, // ư
  { speechStart: 18.0428, speechEnd: 18.532, autoFlags: [] }, // v
  { speechStart: 18.735, speechEnd: 18.8334, autoFlags: ["short"] }, // x
  { speechStart: 19.2943, speechEnd: 19.8629, autoFlags: [] }, // y
];

export function buildAlphabetAudioClips(
  bounds: typeof ALPHABET_AUDIO_DEFAULT_BOUNDS = ALPHABET_AUDIO_DEFAULT_BOUNDS,
): AlphabetAudioClip[] {
  return ALPHABET_29_ORDER.map((grapheme, i) => {
    const index = i + 1;
    const slug = ALPHABET_SLUG_BY_GRAPHEME[grapheme];
    const filename = filenameFor(index, slug);
    const b = bounds[i]!;
    const speechDuration = Number((b.speechEnd - b.speechStart).toFixed(4));
    return {
      index,
      grapheme,
      slug,
      filename,
      path: pathFor(filename),
      speechStart: b.speechStart,
      speechEnd: b.speechEnd,
      clipStart: b.speechStart,
      clipEnd: b.speechEnd,
      speechDuration,
      autoFlags: [...b.autoFlags],
      letterId: ALPHABET_LETTER_ID_BY_GRAPHEME[grapheme],
    };
  });
}

export const ALPHABET_AUDIO_CATALOG = buildAlphabetAudioClips();

export function alphabetClipPathForSlug(slug: string): string {
  const clip = ALPHABET_AUDIO_CATALOG.find((c) => c.slug === slug);
  if (!clip) throw new Error(`Unknown alphabet audio slug: ${slug}`);
  return clip.path;
}

export function alphabetClipForGrapheme(grapheme: string): AlphabetAudioClip | undefined {
  const g = grapheme.trim().normalize("NFC");
  return ALPHABET_AUDIO_CATALOG.find((c) => c.grapheme === g);
}

export function alphabetClipForLetterId(letterId: string): AlphabetAudioClip | undefined {
  const id = letterId.trim();
  const direct = ALPHABET_AUDIO_CATALOG.find((c) => c.letterId === id);
  if (direct) return direct;
  const viaDigraph = DIGRAPH_CLIP_GRAPHEME[id];
  if (viaDigraph) return alphabetClipForGrapheme(viaDigraph);
  return undefined;
}

/**
 * Public path for studio Hear/Say when native alphabet audio is enabled.
 * Returns null when disabled, unknown, or no clip (digraphs without a letter).
 */
export function alphabetNativePathForLetter(letterId: string): string | null {
  if (!ALPHABET_LETTER_AUDIO_ENABLED) return null;
  return alphabetClipForLetterId(letterId)?.path ?? null;
}

/** Always resolve path for review / tests (ignores enable flag). */
export function alphabetPlaybackPathForLetter(letterId: string): string | null {
  return alphabetClipForLetterId(letterId)?.path ?? null;
}

export function alphabetPlaybackPathForGrapheme(grapheme: string): string | null {
  return alphabetClipForGrapheme(grapheme)?.path ?? null;
}

/** Native path for a single alphabet grapheme when the feature flag is on. */
export function alphabetNativePathForGrapheme(grapheme: string): string | null {
  if (!ALPHABET_LETTER_AUDIO_ENABLED) return null;
  return alphabetPlaybackPathForGrapheme(grapheme);
}

export function isAlphabet29Grapheme(value: string): value is Alphabet29Grapheme {
  return (ALPHABET_29_ORDER as readonly string[]).includes(value.normalize("NFC"));
}

export function suspectAlphabetClips(
  clips: AlphabetAudioClip[] = ALPHABET_AUDIO_CATALOG,
): AlphabetAudioClip[] {
  return clips.filter((c) => c.autoFlags.length > 0);
}
