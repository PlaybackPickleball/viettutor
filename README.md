# ÁMi Lingua (repo: viettutor)

Level 1 Vietnamese Learning Studio MVP — Southern Vietnamese first. Hear → Say → Write → Sound–object, with simulated why-wrong pronunciation feedback.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo script (~75 seconds) — letter **a**

For a live walkthrough (also shown on the in-app dashboard):

1. **Dashboard** → tap **Begin Level 1 · a**.
2. **Hear** → tap **Listen** (teacher model; TTS may vary by browser). Then **Next: Say it**.
3. **Say** → Listen once. Tap **Record**, say “a” for ~1 second, **Stop**. Read the **Simulated scoring** why-wrong tip. Tap **Demo practice take** (or Record again) for a solid take → **Next: Write it** unlocks.
   - If the mic is denied / not HTTPS: use **Demo practice take (no mic)** — same simulated feedback.
4. **Write** → **Play demo**, optionally trace, or tap **Mark written & continue** → **Next: Sound & picture**.
5. **Link** → show the shirt for **áo** / shirt, tap to re-hear, then **Next sound · ă**.

### Demo caveats
- Pronunciation feedback is labeled **Simulated scoring** (mock modular scorer, not live ASR).
- Reference audio uses browser **Web Speech TTS** (`vi-VN`); Southern voice only if the OS provides one.
- Microphone needs a **secure context** (HTTPS or localhost) and permission; otherwise use the demo practice take.

Optional Supabase (app works without it; progress uses `localStorage`):

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Schema stub: `src/lib/supabase/schema.sql`.

## Stack

Next.js (App Router) · TypeScript · Tailwind · modular mock pronunciation scorer · MediaRecorder · Web Speech TTS
