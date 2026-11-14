# ÁMi Sing — local audio & lyric timing

Strategy: see Project store [`ami-sing-music-strategy.md`](../../cursor/stores/self/docs/ami-sing-music-strategy.md) (agent environment) / ask the team for the shared strategy doc.

## Licensed free-to-use demo tracks

Nicola confirmed these are **licensed and free to use** in ÁMi Lingua:

1. **Ngày Mai Người Ta Lấy Chồng** — Thành Đạt / Đông Thiên Đức  
   - Catalog id: `ngay-mai-nguoi-ta-lay-chong`  
   - Demo file: `public/sing/ngay-mai-nguoi-ta-lay-chong.mp3`
2. **Hạt Mưa Vương Vấn** — Đinh Hoàng Quốc × Kiều Chi  
   - Catalog id: `hat-mua-vuong-van`  
   - Demo file: `public/sing/hat-mua-vuong-van.mp3`

Rights status in catalog: `approved` (Production Mode eligible).

## Prefer not to bloat git

Scratch copies and private drops stay out of git:

- `/private-media/` (gitignored) — VM seed source
- Project store `internal/ami-sing-local-audio/` — private agent store
- Other `*.mp3` files (gitignored)

Only the two licensed demo masters under `public/sing/` are allow-listed in `.gitignore` for the phone demo.

## How Nicola imports on a device

1. Open **ÁMi Sing** → song card.  
2. Use **Import local MP3** (IndexedDB on that browser only — not uploaded).  
3. Or, on the agent VM with `npm run dev`, tap **Load VM-seeded MP3** (localhost-only `/api/sing/dev-seed/...`).  
4. Open **Timing editor**, paste lyrics you are authorized to type, play, **Mark start/end** per line, save.  
5. Use modes: Listen → Understand → Sing → Speak → Improve.

## Production Mode

- `/api/sing/asset` and `/api/sing/lyrics` enforce rights (deny by default).  
- Hosted `audioUrl` can replace local blobs later without rebuilding `KaraokePlayer`.  
- Dev seed route returns **404** outside local development.
