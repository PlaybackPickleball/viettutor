/**
 * Local pitch helpers — illustrative teaching + optional calibration / compare.
 * Autocorrelation (YIN-lite). No paid APIs. No fabricated % accuracy scores.
 */

export type PitchSample = { t: number; hz: number };

export type PitchContour = {
  samples: PitchSample[];
  /** Median voiced Hz used as baseline when available. */
  baselineHz: number | null;
  voicedRatio: number;
};

const MIN_HZ = 70;
const MAX_HZ = 400;

/** Estimate F0 for one analysis frame via autocorrelation. */
export function estimateFramePitch(
  samples: Float32Array,
  sampleRate: number,
): number | null {
  if (samples.length < 64) return null;
  let rms = 0;
  for (let i = 0; i < samples.length; i++) rms += samples[i]! * samples[i]!;
  rms = Math.sqrt(rms / samples.length);
  if (rms < 0.01) return null;

  const minLag = Math.floor(sampleRate / MAX_HZ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), samples.length - 1);
  if (maxLag <= minLag) return null;

  let bestLag = 0;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let normA = 0;
    let normB = 0;
    const n = samples.length - lag;
    for (let i = 0; i < n; i++) {
      const a = samples[i]!;
      const b = samples[i + lag]!;
      corr += a * b;
      normA += a * a;
      normB += b * b;
    }
    const denom = Math.sqrt(normA * normB) || 1;
    const r = corr / denom;
    if (r > bestCorr) {
      bestCorr = r;
      bestLag = lag;
    }
  }
  if (bestCorr < 0.4 || bestLag === 0) return null;
  return sampleRate / bestLag;
}

export function extractPitchContour(
  channel: Float32Array,
  sampleRate: number,
  hopMs = 20,
): PitchContour {
  const hop = Math.max(1, Math.floor((sampleRate * hopMs) / 1000));
  const win = Math.min(channel.length, Math.floor(sampleRate * 0.04));
  const samples: PitchSample[] = [];
  let voiced = 0;
  let frames = 0;
  for (let i = 0; i + win < channel.length; i += hop) {
    frames += 1;
    const slice = channel.subarray(i, i + win);
    const hz = estimateFramePitch(slice, sampleRate);
    const t = i / sampleRate;
    if (hz != null) {
      voiced += 1;
      samples.push({ t, hz });
    }
  }
  const voicedRatio = frames === 0 ? 0 : voiced / frames;
  const hzList = samples.map((s) => s.hz).sort((a, b) => a - b);
  const baselineHz =
    hzList.length >= 3 ? hzList[Math.floor(hzList.length / 2)]! : hzList[0] ?? null;
  return { samples, baselineHz, voicedRatio };
}

/** Normalize Hz samples to 0..1 relative to baseline (0.5 = natural pitch). */
export function normalizeToBaseline(
  samples: PitchSample[],
  baselineHz: number,
  semitoneRange = 8,
): { t: number; y: number }[] {
  if (!baselineHz || samples.length === 0) return [];
  const t0 = samples[0]!.t;
  const t1 = samples[samples.length - 1]!.t;
  const dur = Math.max(0.05, t1 - t0);
  return samples.map((s) => {
    const semis = (12 * Math.log2(s.hz / baselineHz)) / semitoneRange;
    const y = Math.max(0, Math.min(1, 0.5 - semis * 0.5));
    return { t: (s.t - t0) / dur, y };
  });
}

/** SVG path from normalized {t,y} points in viewBox 0..100. */
export function contourToSvgPath(points: { t: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => {
      const x = 4 + p.t * 92;
      const y = 8 + p.y * 84;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function medianBaseline(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (v.length === 0) return null;
  return v[Math.floor(v.length / 2)]!;
}
