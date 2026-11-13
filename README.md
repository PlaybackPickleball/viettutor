# ÁMi Lingua (repo: viettutor)

Vietnamese Learning Studio + **Scan & Read** companion.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 · Live: https://ami-lingua.apps.grok.bot

```bash
npm test
```

## Features

### Foundations studio
Hear → Say (10 takes + average) → Write (Mali single-storey handwriting) → Link · 8 alphabet levels.

### Scan & Read (Phase 1)
1. **Scan** — take photo or upload image  
2. **OCR** — on-device Tesseract (`vie`) only (no public Vision proxy)  
3. **Review** — edit/correct diacritics (trusted text)  
4. **Read** — tap syllables/compounds, listen, see meanings, record practice  
5. **Vocab** — save expressions for review  

Pronunciation recording never invents scores. Without Azure keys, the UI reports **Scoring unavailable** and keeps listen/compare/retry.

## Optional env

See `.env.example`.

## Stack

Next.js · TypeScript · Tailwind · Tesseract.js · modular OCR / speech / tutor services · localStorage (+ Supabase stubs)
