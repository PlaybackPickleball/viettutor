/** Helpers for reliable MediaRecorder capture + simple voice activity. */

export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export function rmsFromAnalyser(
  analyser: AnalyserNode,
  buffer: Uint8Array<ArrayBuffer>,
): number {
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    const v = (buffer[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buffer.length);
}

export type VadConfig = {
  /** RMS above this counts as speech */
  speechThreshold?: number;
  /** Silence after speech before auto-stop (ms) */
  silenceMs?: number;
  /** Max recording length (ms) */
  maxMs?: number;
  /** Ignore leading silence until this much time passes (ms) */
  leadInMs?: number;
};

export type VadController = {
  stop: () => void;
};

/**
 * Watch a live mic stream. Calls onAutoStop after speech + silence,
 * or at maxMs. Calls onLevel with 0–1 for UI metering.
 */
export function watchVoiceActivity(
  stream: MediaStream,
  onAutoStop: (reason: "silence" | "max" | "no-speech") => void,
  onLevel: (level: number) => void,
  config: VadConfig = {},
): VadController {
  const speechThreshold = config.speechThreshold ?? 0.045;
  const silenceMs = config.silenceMs ?? 1600;
  const maxMs = config.maxMs ?? 4000;
  const leadInMs = config.leadInMs ?? 350;

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;
  source.connect(analyser);

  const buffer = new Uint8Array(new ArrayBuffer(analyser.fftSize));
  const startedAt = performance.now();
  let heardSpeech = false;
  let silenceStarted: number | null = null;
  let raf = 0;
  let stopped = false;

  const finish = (reason: "silence" | "max" | "no-speech") => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    void audioCtx.close().catch(() => undefined);
    onAutoStop(reason);
  };

  const tick = () => {
    if (stopped) return;
    const now = performance.now();
    const elapsed = now - startedAt;
    const rms = rmsFromAnalyser(analyser, buffer);
    // Soft normalize for meter (speech often ~0.05–0.3)
    onLevel(Math.min(1, rms * 4.5));

    if (elapsed > leadInMs) {
      if (rms >= speechThreshold) {
        heardSpeech = true;
        silenceStarted = null;
      } else if (heardSpeech) {
        if (silenceStarted == null) silenceStarted = now;
        else if (now - silenceStarted >= silenceMs) {
          finish("silence");
          return;
        }
      }
    }

    if (elapsed >= maxMs) {
      finish(heardSpeech ? "max" : "no-speech");
      return;
    }

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      void audioCtx.close().catch(() => undefined);
    },
  };
}
