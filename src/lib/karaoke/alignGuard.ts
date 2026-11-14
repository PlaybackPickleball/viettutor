/** Simple process-local guards for expensive alignment jobs. */

const COOLDOWN_MS = 60_000;
let running = false;
const lastBySub = new Map<string, number>();

export function beginAlignJob(sub: string): { ok: true } | { ok: false; error: string } {
  if (running) {
    return { ok: false, error: "align_busy" };
  }
  const last = lastBySub.get(sub) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) {
    return { ok: false, error: "align_rate_limited" };
  }
  running = true;
  lastBySub.set(sub, Date.now());
  return { ok: true };
}

export function endAlignJob(): void {
  running = false;
}

export const MAX_ALIGN_UPLOAD_BYTES = 25 * 1024 * 1024;
