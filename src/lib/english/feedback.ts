/**
 * English intelligibility feedback.
 * Transcript comparison never becomes a phoneme score or a made-up percentage.
 * Provider scores are copied only from a pronunciation service payload.
 */

export type FeedbackCategory = "needs_practice" | "fairly_good" | "very_good";

export const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  needs_practice: "Cần luyện thêm",
  fairly_good: "Khá tốt",
  very_good: "Rất tốt",
};

export type FeedbackSource = "transcript" | "provider" | "none";

export type EnglishFeedback = {
  source: FeedbackSource;
  phonemeScoringAvailable: boolean;
  category: FeedbackCategory | null;
  categoryLabel: string | null;
  observationVi: string;
  recognizedText: string | null;
  /** Whole-phrase score returned by a provider. Never computed from a transcript. */
  providerScore: number | null;
  failed: boolean;
  allowPraise: boolean;
};

export const ENGLISH_PRONUNCIATION = {
  id: "en-us-intelligibility",
  accent: "american",
  /** Deliberately not the Vietnamese tone scorer. */
  engine: "intelligibility",
  covers: ["phonemes", "final-consonants", "clusters", "vowels", "stress", "rhythm"],
  challengesNotedInLessons: ["θ", "ð", "ʃ", "tʃ", "ship/sheep", "final-consonants"],
  noteVi:
    "Không dùng máy chấm thanh điệu tiếng Việt. Mục tiêu là người nghe hiểu, không cần giọng bản ngữ.",
} as const;

function base(partial: Omit<EnglishFeedback, "categoryLabel" | "allowPraise"> & {
  category: FeedbackCategory | null;
}): EnglishFeedback {
  const categoryLabel = partial.category ? CATEGORY_LABEL[partial.category] : null;
  const allowPraise =
    !partial.failed &&
    (partial.category === "very_good" || partial.category === "fairly_good");
  return { ...partial, categoryLabel, allowPraise };
}

export function tokenizePhrase(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/'/g, ""))
    .filter(Boolean);
}

export function feedbackUnavailable(observationVi: string): EnglishFeedback {
  return base({
    source: "none",
    phonemeScoringAvailable: false,
    category: null,
    observationVi,
    recognizedText: null,
    providerScore: null,
    failed: true,
  });
}

export function feedbackFromServiceFailure(): EnglishFeedback {
  return feedbackUnavailable(
    "Không chấm được lúc này. Chấm từng âm chưa có kết quả. Không có điểm thay thế.",
  );
}

/**
 * Compare a real transcript to the expected phrase.
 * Categories describe whether the words were heard, not phoneme accuracy.
 */
export function assessFromTranscript(
  expected: string,
  heard: string | null | undefined,
): EnglishFeedback {
  const expectedTokens = tokenizePhrase(expected);
  const heardRaw = typeof heard === "string" ? heard.trim() : "";
  if (!heardRaw || expectedTokens.length === 0) {
    return feedbackUnavailable(
      "Máy không chép được lời bạn nói. Chấm từng âm chưa dùng được. Bạn vẫn nghe lại và đi tiếp được.",
    );
  }

  const heardTokens = tokenizePhrase(heardRaw);
  if (heardTokens.length === 0) {
    return feedbackUnavailable(
      "Không nghe rõ tiếng nói. Chưa có lời chép và chưa có điểm âm.",
    );
  }

  const pool = heardTokens.slice();
  const missing: string[] = [];
  for (const token of expectedTokens) {
    const index = pool.indexOf(token);
    if (index === -1) missing.push(token);
    else pool.splice(index, 1);
  }

  const ratio = (expectedTokens.length - missing.length) / expectedTokens.length;
  let category: FeedbackCategory;
  let observationVi: string;
  if (missing.length === 0) {
    category = "very_good";
    observationVi =
      "Nghe đủ các từ trong câu. Đây là so khớp lời nói, không phải điểm từng âm.";
  } else if (ratio >= 0.6) {
    category = "fairly_good";
    observationVi = `Nghe được một phần. Thiếu: ${missing.join(", ")}. Đây là so khớp lời nói, không phải điểm từng âm.`;
  } else {
    category = "needs_practice";
    observationVi = `Câu nghe chưa đủ. Thiếu: ${missing.join(", ")}. Nghe mẫu rồi nói lại. Chưa có điểm từng âm.`;
  }

  return base({
    source: "transcript",
    phonemeScoringAvailable: false,
    category,
    observationVi,
    recognizedText: heardRaw,
    providerScore: null,
    failed: false,
  });
}

type AzurePhoneme = {
  Phoneme?: string;
  PronunciationAssessment?: { AccuracyScore?: number };
};

type AzureWord = {
  Word?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
  Phonemes?: AzurePhoneme[];
};

type AzureNBest = {
  Display?: string;
  PronunciationAssessment?: {
    AccuracyScore?: number;
    FluencyScore?: number;
    PronScore?: number;
  };
  Words?: AzureWord[];
};

type AzureBody = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: AzureNBest[];
};

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

export function categoryFromProviderScore(score: number): FeedbackCategory {
  if (score < 60) return "needs_practice";
  if (score < 80) return "fairly_good";
  return "very_good";
}

function lowestPhoneme(words: AzureWord[]): { phoneme: string; word: string } | null {
  let best: { phoneme: string; word: string; score: number } | null = null;
  for (const word of words) {
    const label = word.Word?.trim();
    if (!label || !word.Phonemes?.length) continue;
    for (const phoneme of word.Phonemes) {
      const name = phoneme.Phoneme?.trim();
      const score = asNumber(phoneme.PronunciationAssessment?.AccuracyScore);
      if (!name || score == null) continue;
      if (!best || score < best.score) best = { phoneme: name, word: label, score };
    }
  }
  return best ? { phoneme: best.phoneme, word: best.word } : null;
}

/**
 * Read an Azure pronunciation-assessment JSON body.
 * If the body has no phoneme list, phoneme scoring stays unavailable.
 * If the body has no provider score, this does not invent one from the transcript.
 */
export function fromAzure(
  expected: string,
  httpOk: boolean,
  body: unknown,
): EnglishFeedback {
  if (!httpOk || !body || typeof body !== "object") {
    return feedbackFromServiceFailure();
  }
  const payload = body as AzureBody;
  if (payload.RecognitionStatus !== "Success") {
    return feedbackUnavailable(
      "Dịch vụ chấm âm không nhận ra câu nói. Không có điểm thay thế.",
    );
  }

  const best = payload.NBest?.[0];
  const assessment = best?.PronunciationAssessment;
  const providerScore =
    asNumber(assessment?.PronScore) ?? asNumber(assessment?.AccuracyScore);
  const words = best?.Words ?? [];
  const phonemeHit = lowestPhoneme(words);
  const heard = (best?.Display || payload.DisplayText || "").trim() || null;

  if (providerScore == null) {
    if (heard) {
      const fromText = assessFromTranscript(expected, heard);
      return {
        ...fromText,
        observationVi: `${fromText.observationVi} Dịch vụ không trả điểm âm.`,
      };
    }
    return feedbackUnavailable(
      "Dịch vụ không trả điểm và không có lời chép. Không có điểm giả.",
    );
  }

  const category = categoryFromProviderScore(providerScore);
  const observationVi = phonemeHit
    ? `Âm ${phonemeHit.phoneme} trong từ ${phonemeHit.word} cần chú ý hơn các âm khác. Nhận xét này lấy từ dịch vụ chấm âm.`
    : "Có điểm cả câu từ dịch vụ, nhưng chưa có điểm từng âm.";

  return base({
    source: "provider",
    phonemeScoringAvailable: Boolean(phonemeHit),
    category,
    observationVi,
    recognizedText: heard,
    providerScore,
    failed: false,
  });
}

export function isAzureAudioMime(mime: string): boolean {
  const value = mime.toLowerCase();
  return (
    value.includes("audio/wav") ||
    value.includes("audio/wave") ||
    value.includes("audio/ogg") ||
    value.includes("audio/opus")
  );
}

export type ResolveInput = {
  expected: string;
  transcript: string | null;
  mime?: string | null;
  phonemeConfigured: boolean;
  callProvider?: () => Promise<{ httpOk: boolean; body: unknown }>;
};

/**
 * Prefer a real provider result when audio can be sent.
 * Otherwise stay on transcription-level feedback, or an honest failure.
 */
export async function resolveEnglishAssessment(input: ResolveInput): Promise<EnglishFeedback> {
  const mime = input.mime ?? "";
  const canCall =
    input.phonemeConfigured &&
    Boolean(input.callProvider) &&
    mime.length > 0 &&
    isAzureAudioMime(mime);

  if (canCall && input.callProvider) {
    try {
      const result = await input.callProvider();
      const provider = fromAzure(input.expected, result.httpOk, result.body);
      if (!provider.failed || !input.transcript) return provider;
      const transcript = assessFromTranscript(input.expected, input.transcript);
      return {
        ...transcript,
        phonemeScoringAvailable: false,
        observationVi: `Dịch vụ chấm âm không dùng được. ${transcript.observationVi}`,
      };
    } catch {
      if (!input.transcript) return feedbackFromServiceFailure();
      const transcript = assessFromTranscript(input.expected, input.transcript);
      return {
        ...transcript,
        phonemeScoringAvailable: false,
        observationVi: `Dịch vụ chấm âm bị lỗi. ${transcript.observationVi}`,
      };
    }
  }

  if (input.phonemeConfigured && mime && !isAzureAudioMime(mime)) {
    const transcript = assessFromTranscript(input.expected, input.transcript);
    if (transcript.failed) {
      return feedbackUnavailable(
        "Trình duyệt đang ghi định dạng chưa gửi được tới dịch vụ chấm âm. Máy cũng không chép được lời. Không có điểm giả.",
      );
    }
    return {
      ...transcript,
      observationVi: `Chưa chấm từng âm vì bản ghi không phải WAV hoặc OGG. ${transcript.observationVi}`,
    };
  }

  return assessFromTranscript(input.expected, input.transcript);
}
