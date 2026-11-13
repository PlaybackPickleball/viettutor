# ÁMi Lingua (repo: viettutor)

Level 1 Vietnamese Learning Studio MVP — Southern Vietnamese first. Hear → Say → Write → Sound–object, with simulated why-wrong pronunciation feedback.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional Supabase (app works without it; progress uses `localStorage`):

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Schema stub: `src/lib/supabase/schema.sql`.

## Stack

Next.js (App Router) · TypeScript · Tailwind · modular mock pronunciation scorer · MediaRecorder · Web Speech TTS
