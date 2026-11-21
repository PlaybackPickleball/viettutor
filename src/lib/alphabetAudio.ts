/**
 * ElevenLabs alphabet letter clips (29 traditional letters).
 * Splitting is mechanical — not linguistic validation. Studio playback is
 * gated by ALPHABET_LETTER_AUDIO_ENABLED until Nicola approves the review page.
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
 * Flip to true only after Nicola approves `/review/alphabet-audio`.
 * Review page always plays clips; Hear/Say use native files only when enabled.
 */
export const ALPHABET_LETTER_AUDIO_ENABLED = false;

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

/** Timing from the checked-in silence-detect pass (noise=-35dB, d=0.08). */
export const ALPHABET_AUDIO_DEFAULT_BOUNDS: ReadonlyArray<{
  speechStart: number;
  speechEnd: number;
  autoFlags: AlphabetAudioFlag[];
}> = [
  { speechStart: 0.0, speechEnd: 0.4365, autoFlags: [] },
  { speechStart: 0.5423, speechEnd: 0.9313, autoFlags: [] },
  { speechStart: 1.2119, speechEnd: 1.6028, autoFlags: [] },
  { speechStart: 1.9823, speechEnd: 2.4291, autoFlags: [] },
  { speechStart: 2.6738, speechEnd: 3.2279, autoFlags: [] },
  { speechStart: 3.4955, speechEnd: 3.9688, autoFlags: [] },
  { speechStart: 4.2143, speechEnd: 4.6629, autoFlags: [] },
  { speechStart: 4.9819, speechEnd: 5.3487, autoFlags: [] },
  { speechStart: 5.6031, speechEnd: 5.9793, autoFlags: [] },
  { speechStart: 6.2325, speechEnd: 6.7402, autoFlags: [] },
  { speechStart: 7.0162, speechEnd: 7.2537, autoFlags: [] },
  { speechStart: 7.742, speechEnd: 8.0867, autoFlags: [] },
  { speechStart: 8.3395, speechEnd: 8.7228, autoFlags: [] },
  { speechStart: 9.0172, speechEnd: 9.596, autoFlags: [] },
  { speechStart: 9.8474, speechEnd: 10.5073, autoFlags: [] },
  { speechStart: 10.7356, speechEnd: 11.3992, autoFlags: [] },
  { speechStart: 11.6659, speechEnd: 12.035, autoFlags: [] },
  { speechStart: 12.2675, speechEnd: 12.6341, autoFlags: [] },
  { speechStart: 12.8811, speechEnd: 13.2451, autoFlags: [] },
  { speechStart: 13.5506, speechEnd: 13.9079, autoFlags: [] },
  { speechStart: 14.1666, speechEnd: 14.5408, autoFlags: [] },
  { speechStart: 14.8118, speechEnd: 15.3969, autoFlags: [] },
  { speechStart: 15.5859, speechEnd: 15.752, autoFlags: ["short"] },
  { speechStart: 16.2018, speechEnd: 16.5668, autoFlags: [] },
  { speechStart: 16.8811, speechEnd: 17.2205, autoFlags: [] },
  { speechStart: 17.4778, speechEnd: 17.8084, autoFlags: [] },
  { speechStart: 18.0428, speechEnd: 18.532, autoFlags: [] },
  { speechStart: 18.735, speechEnd: 18.8334, autoFlags: ["short"] },
  { speechStart: 19.2943, speechEnd: 19.8629, autoFlags: [] },
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

export function isAlphabet29Grapheme(value: string): value is Alphabet29Grapheme {
  return (ALPHABET_29_ORDER as readonly string[]).includes(value.normalize("NFC"));
}

export function suspectAlphabetClips(
  clips: AlphabetAudioClip[] = ALPHABET_AUDIO_CATALOG,
): AlphabetAudioClip[] {
  return clips.filter((c) => c.autoFlags.length > 0);
}
