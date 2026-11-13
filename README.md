# ÁMi Lingua (repo: viettutor)

Level 1 Vietnamese Learning Studio MVP — Southern Vietnamese first. Hear → Say (10 takes + average) → Write → Sound–object.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Live app: https://ami-lingua.apps.grok.bot

## Demo script — letter **a**

1. **Home** → Continue Learning.
2. **Hear** → Listen → Next.
3. **Say** → complete **10 takes** (Record or Demo practice take). Each tip is **Simulated scoring**. After 10, read the **AI set average**, then Write unlocks.
4. **Write** → Play demo / trace / Check.
5. **Link** → shirt for **áo**, then next sound.

### Caveats
- Pronunciation feedback is **Simulated scoring** (mock modular scorer).
- Reference audio uses browser **Web Speech TTS** (`vi-VN`).
- Microphone needs HTTPS/localhost + permission; otherwise use demo practice takes.
- Progress is on-device (`localStorage`) until Supabase secrets are added.

## Stack

Next.js (App Router) · TypeScript · Tailwind · 10-rep mock pronunciation average · MediaRecorder · Web Speech TTS
