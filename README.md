# ArchVision — AI Architecture Studio

Generate architectural visualizations from text prompts. Six render styles, four aspect ratios, persistent gallery, re-generation flow.

**Live URL:** https://archvision-production.up.railway.app

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

Gallery data auto-creates at `/data/gallery.json`. Images save to `/public/generated/` and are served via `/api/images/`.

---

## Architecture

```
Browser → POST /api/generate → Pollinations.ai → Save PNG to disk → JSON DB → Response
```

1. Prompt sent to `/api/generate` — AI is never called from the browser
2. Backend enriches prompt with style modifiers
3. Fetch from Pollinations.ai with 45s timeout and 2 retries
4. Image buffer saved to `/public/generated/{uuid}.png`
5. Metadata saved to `data/gallery.json`
6. `GeneratedImage` object returned to frontend
7. Image served via `/api/images/{uuid}.png`

Gallery persists across refreshes via `GET /api/gallery` reading from the JSON file on disk.

---

## Project Structure

```
app/
  api/
    generate/route.ts          # POST — AI generation endpoint
    gallery/route.ts           # GET — fetch all images
    gallery/[id]/route.ts      # DELETE — remove image
    images/[filename]/route.ts # GET — serve generated images
  page.tsx                     # Main page
components/
  generator/
    GeneratorForm.tsx           # Prompt + style + ratio inputs
    GenerationStatus.tsx        # Loading / success / error states
  gallery/
    GalleryGrid.tsx             # Masonry grid + empty + loading states
    GalleryCard.tsx             # Image card + actions
    ImageModal.tsx              # Fullscreen lightbox
hooks/
  useGallery.ts                 # Gallery state + optimistic delete
  useGenerate.ts                # Generation state machine
lib/
  pollinations.ts               # AI client (timeout + retry)
  db.ts                         # JSON file persistence
  storage.ts                    # Filesystem save/delete
  validation.ts                 # Input validation
  api.ts                        # Response format helpers
  utils.ts                      # cn() utility
types/index.ts                  # All TypeScript types
```

---

## Error States

| Code             | Cause                    | Displayed as                      |
| ---------------- | ------------------------ | --------------------------------- |
| AI_API_TIMEOUT   | 45s exceeded             | Orange warning — retry suggestion |
| INVALID_PROMPT   | Content policy rejection | Yellow warning — rephrase hint    |
| AI_API_ERROR     | Non-200 after 2 retries  | Red error                         |
| STORAGE_ERROR    | Disk write failed        | Red error                         |
| VALIDATION_ERROR | Bad request fields       | 400 with field detail             |

---

## Known Limitations

- Generated images are not persistent across server restarts — production use would require object storage (S3, Cloudflare R2)
- No authentication — gallery is shared across all users (by design for this scope)
- Pollinations.ai output is non-deterministic — same prompt produces different results each run
- Pollinations free tier may throttle under concurrent load — handled via retry with exponential backoff
