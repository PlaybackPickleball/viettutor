export type Dialect = "southern" | "northern";

export type OcrResult = {
  text: string;
  provider: "tesseract" | "google-vision" | "openai-vision" | "demo";
  confidence?: number;
  note?: string;
  translation?: string | null;
  segments?: { text: string; meaningEn: string; note?: string }[];
};

export type SegmentKind = "word" | "syllable" | "punct";

export type TextSegment = {
  id: string;
  text: string;
  kind: SegmentKind;
  /** Lexical expression this syllable belongs to (may equal text) */
  expression: string;
  start: number;
  end: number;
};

export type TutorExplanation = {
  expression: string;
  meaningEn: string;
  inContext?: string;
  note?: string;
  toneHint?: string;
  source: "lexicon" | "llm" | "fallback";
};

export type SpeechAssessmentRequest = {
  expectedText: string;
  audioBlob?: Blob;
  durationMs: number;
  lessonId?: string;
  userId?: string;
  dialect: Dialect;
  attemptNumber: number;
};

export type SpeechAssessmentResult = {
  provider: "azure" | "unavailable" | "playback-only";
  scoringAvailable: boolean;
  recognizedText?: string;
  pronunciationScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  wordFeedback?: { word: string; tip: string }[];
  confidence?: number;
  suitableForAutoGrade: boolean;
  practiceTip: string;
  experimentalLabel?: string;
};
