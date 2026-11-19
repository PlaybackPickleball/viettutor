import type { PhonicsStep } from "../types";
import type { SyllableDef, VocabularyEntry } from "./types";
import { PATH_SYLLABLES_EXTRA } from "./syllablesExtra";

function step(
  display: string,
  utterance: string,
  kind: PhonicsStep["kind"],
  glossEn?: string,
): PhonicsStep {
  return { display, utterance, kind, glossEn };
}

function vocab(
  id: string,
  written: string,
  glossEn: string,
  conversational: boolean,
  noteEn?: string,
): VocabularyEntry {
  return { id, written, glossEn, conversational, noteEn };
}

/** Authored open-CV sequences used by Worlds 1–3. */
export const PATH_SYLLABLES: SyllableDef[] = [
  {
    id: "ba",
    written: "ba",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("b", "bờ", "initial", "teaching sound for b"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ba", "ba", "syllable", "three / dad (Southern context)"),
    ],
    vocab: vocab("v-ba", "ba", "three / dad (Southern context)", true),
  },
  {
    id: "ba-sac",
    written: "bá",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("b", "bờ", "initial", "teaching sound for b"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ba", "ba", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("bá", "bá", "syllable", "paternal aunt (regional)"),
    ],
    vocab: vocab(
      "v-ba-sac",
      "bá",
      "paternal aunt (regional)",
      true,
      "Southern/regional kinship usage",
    ),
  },
  {
    id: "ma",
    written: "ma",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "syllable", "ghost / but (training · context)"),
    ],
    vocab: vocab(
      "v-ma",
      "ma",
      "ghost / but (training · context)",
      false,
      "Often a tone-training base — not essential beginner vocab",
    ),
  },
  {
    id: "ma-sac",
    written: "má",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("má", "má", "syllable", "mother (Southern)"),
    ],
    vocab: vocab("v-ma-sac", "má", "mother (Southern)", true),
  },
  {
    id: "ma-huyen",
    written: "mà",
    tone: "huyen",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "combine", "combined before tone"),
      step("`", "huyền", "tone", "falling tone name"),
      step("mà", "mà", "syllable", "but / which"),
    ],
    vocab: vocab("v-ma-huyen", "mà", "but / which", true),
  },
  {
    id: "ma-hoi",
    written: "mả",
    tone: "hoi",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "combine", "combined before tone"),
      step("̉", "hỏi", "tone", "asking tone name"),
      step("mả", "mả", "syllable", "tomb (training)"),
    ],
    vocab: vocab(
      "v-ma-hoi",
      "mả",
      "tomb (training example)",
      false,
      "Sound-training — not essential beginner vocab",
    ),
  },
  {
    id: "ma-nga",
    written: "mã",
    tone: "nga",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "combine", "combined before tone"),
      step("~", "ngã", "tone", "broken tone name"),
      step("mã", "mã", "syllable", "code / horse (context)"),
    ],
    vocab: vocab(
      "v-ma-nga",
      "mã",
      "code / horse (context)",
      false,
      "Sound-training — Southern hỏi/ngã often merge in speech",
    ),
  },
  {
    id: "ma-nang",
    written: "mạ",
    tone: "nang",
    dialect: "southern",
    sequence: [
      step("m", "mờ", "initial", "teaching sound for m"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ma", "ma", "combine", "combined before tone"),
      step(".", "nặng", "tone", "heavy tone name"),
      step("mạ", "mạ", "syllable", "rice seedling (training)"),
    ],
    vocab: vocab(
      "v-ma-nang",
      "mạ",
      "rice seedling (training)",
      false,
      "Sound-training — not essential beginner vocab",
    ),
  },
  {
    id: "na",
    written: "na",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("n", "nờ", "initial", "teaching sound for n"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("na", "na", "syllable", "that / take (context)"),
    ],
    vocab: vocab("v-na", "na", "that / take (context)", false),
  },
  {
    id: "ta",
    written: "ta",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("t", "tờ", "initial", "teaching sound for t"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ta", "ta", "syllable", "we / I (context)"),
    ],
    vocab: vocab("v-ta", "ta", "we / I (context)", true),
  },
  {
    id: "ha",
    written: "ha",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("h", "hờ", "initial", "teaching sound for h"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ha", "ha", "syllable", "laugh sound (context)"),
    ],
    vocab: vocab("v-ha", "ha", "laugh sound (context)", false),
  },
  {
    id: "la",
    written: "la",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("l", "lờ", "initial", "teaching sound for l"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("la", "la", "syllable", "to be / leaf (context)"),
    ],
    vocab: vocab("v-la", "la", "to be / leaf (context)", true),
  },
  {
    id: "ca",
    written: "ca",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("c", "cờ", "initial", "teaching sound for c"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ca", "ca", "syllable", "to sing (context)"),
    ],
    vocab: vocab("v-ca", "ca", "to sing (context)", true),
  },
  {
    id: "ka",
    written: "ka",
    tone: "ngang",
    dialect: "southern",
    sequence: [
      step("k", "ca", "initial", "teaching name for k (same /k/ feel)"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ka", "ka", "syllable", "loan / training form"),
    ],
    vocab: vocab(
      "v-ka",
      "ka",
      "loan / training form",
      false,
      "Shows k spelling — rare as native open syllable",
    ),
  },
  {
    id: "ba-huyen",
    written: "bà",
    tone: "huyen",
    dialect: "southern",
    sequence: [
      step("b", "bờ", "initial", "teaching sound for b"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ba", "ba", "combine", "combined before tone"),
      step("`", "huyền", "tone", "falling tone name"),
      step("bà", "bà", "syllable", "grandmother"),
    ],
    vocab: vocab("v-ba-huyen", "bà", "grandmother", true),
  },
  {
    id: "na-sac",
    written: "ná",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("n", "nờ", "initial", "teaching sound for n"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("na", "na", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("ná", "ná", "syllable", "training tone form"),
    ],
    vocab: vocab("v-na-sac", "ná", "training tone form", false),
  },
  {
    id: "ta-huyen",
    written: "tà",
    tone: "huyen",
    dialect: "southern",
    sequence: [
      step("t", "tờ", "initial", "teaching sound for t"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ta", "ta", "combine", "combined before tone"),
      step("`", "huyền", "tone", "falling tone name"),
      step("tà", "tà", "syllable", "evil / training (context)"),
    ],
    vocab: vocab("v-ta-huyen", "tà", "evil / training (context)", false),
  },
  {
    id: "ha-sac",
    written: "há",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("h", "hờ", "initial", "teaching sound for h"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ha", "ha", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("há", "há", "syllable", "open mouth / gasp (context)"),
    ],
    vocab: vocab("v-ha-sac", "há", "open mouth / gasp (context)", false),
  },
  {
    id: "la-sac",
    written: "lá",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("l", "lờ", "initial", "teaching sound for l"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("la", "la", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("lá", "lá", "syllable", "leaf"),
    ],
    vocab: vocab("v-la-sac", "lá", "leaf", true),
  },
  {
    id: "ca-sac",
    written: "cá",
    tone: "sac",
    dialect: "southern",
    sequence: [
      step("c", "cờ", "initial", "teaching sound for c"),
      step("a", "a", "vowel", "open “ah” vowel"),
      step("ca", "ca", "combine", "combined before tone"),
      step("´", "sắc", "tone", "rising tone name"),
      step("cá", "cá", "syllable", "fish"),
    ],
    vocab: vocab("v-ca-sac", "cá", "fish", true),
  },
  ...PATH_SYLLABLES_EXTRA,
];

export function getSyllable(id: string): SyllableDef | undefined {
  return PATH_SYLLABLES.find((s) => s.id === id);
}

export function getSyllableByWritten(written: string): SyllableDef | undefined {
  return PATH_SYLLABLES.find((s) => s.written === written);
}
