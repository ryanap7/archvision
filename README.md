# ArchVision — AI Architecture Studio

Generate architectural visualizations from text prompts. Six render styles, four aspect ratios, persistent gallery, re-generation flow.

**Live URL:** replace-after-deploy

---

## Quick Start (under 15 minutes)

### Prerequisites
- Node.js 18+

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/archvision.git
cd archvision
npm install
```

### 2. Environment

No API keys required. Pollinations.ai is free and key-free.

```bash
# .env.local is optional — defaults work out of the box
echo "NODE_ENV=development" > .env.local
```

### 3. Run

```bash
npm run dev
# open http://localhost:3000
```

Gallery data auto-creates at `/data/gallery.json`. Images save to `/public/generated/`.

---

## Architecture

```
Browser → POST /api/generate → Pollinations.ai → Save PNG to disk → JSON DB → Response
```

1. Prompt sent to `/api/generate` (AI never called from browser)
2. Backend enriches prompt with style modifiers
3. Fetch from Pollinations.ai (45s timeout, 2 retries)
4. Buffer saved to `/public/generated/{uuid}.png`
5. Metadata saved to `data/gallery.json`
6. `GeneratedImage` object returned to frontend

Gallery persists across refreshes via `GET /api/gallery` → JSON file read.

---

## Project Structure

```
app/
  api/
    generate/route.ts       # POST — AI generation endpoint
    gallery/route.ts        # GET — fetch gallery
    gallery/[id]/route.ts   # DELETE — remove image
  page.tsx                  # Main page
components/
  generator/
    GeneratorForm.tsx        # Prompt + style + ratio
    GenerationStatus.tsx     # Loading / success / error
  gallery/
    GalleryGrid.tsx          # Grid + empty + loading states
    GalleryCard.tsx          # Image card + actions
    ImageModal.tsx           # Fullscreen lightbox
hooks/
  useGallery.ts              # Gallery state + optimistic delete
  useGenerate.ts             # Generation state machine
lib/
  pollinations.ts            # AI client (timeout + retry)
  db.ts                      # JSON persistence
  storage.ts                 # Filesystem save/delete
  validation.ts              # Input validation
types/index.ts               # All TypeScript types
```

---

## Error States

| Code | Cause | Displayed as |
|------|-------|-------------|
| AI_API_TIMEOUT | 45s exceeded | Orange — retry suggestion |
| INVALID_PROMPT | Content rejection | Yellow — rephrase hint |
| AI_API_ERROR | Non-200 from AI | Red — after 2 retries |
| STORAGE_ERROR | Disk write failed | Red |
| VALIDATION_ERROR | Bad request fields | 400 with field detail |

---

## Deploy: Railway (recommended — persistent FS)

```bash
npm install -g @railway/cli
railway login && railway init && railway up
```

## Deploy: Vercel (note: FS is ephemeral on serverless)

```bash
vercel deploy
```

For Vercel with persistence: swap `lib/db.ts` → Supabase, `lib/storage.ts` → Vercel Blob.

---

## Known Limitations

- Vercel serverless FS resets on cold starts — use Railway for persistent gallery
- Pollinations free tier may throttle under concurrent load (retry handles this)
- No auth — gallery is shared across users (by design for this scope)
- Image quality is non-deterministic (random seed per generation)
