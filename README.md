# Rent A Boat Villy

Luxury boat rental website for Thassos, Greece — SEO-optimized for **“rent a boat Thassos”**, multilingual (6 languages), AI concierge chat, and an admin panel for bookings, blog, GDPR, and content.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, Framer Motion |
| Content | Static JSON in `/data` + SQLite (`better-sqlite3`) for bookings, blog, GDPR |
| i18n | English source (`data/locales/en.json`) + auto-translate (SQLite cache) |
| SEO | Metadata, JSON-LD, dynamic OG image, sitemap, robots |

## Getting started (development)

```bash
npm install
cp .env.example .env.local   # set ADMIN_SECRET for local admin access
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical URL (e.g. `https://thassosboats.gr`) |
| `ADMIN_SECRET` | Yes | Strong admin login password |
| `SESSION_SIGNING_KEY` | Yes | Separate random key for signed session cookies |
| `GDPR_SALT` | Yes | Random string for hashing IPs in consent logs |
| `TRUST_PROXY` | Production | Set `true` when behind nginx/Caddy (for rate limiting) |
| `GOOGLE_SITE_VERIFICATION` | Optional | Google Search Console verification token |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Enables interactive route map |
| `TRANSLATION_API_KEY` | Optional | Google or LibreTranslate API key |
| `TRANSLATION_PROVIDER` | Optional | `google`, `libretranslate`, or `mymemory` (default) |
| `TRANSLATION_API_URL` | Optional | LibreTranslate endpoint |
| `TRANSLATION_DISABLE` | Optional | Set `true` to skip external APIs (English + truncation) |

Copy `.env.example` to `.env.local` (dev) or `.env` (Docker). **Never commit real secrets.**

### Auto-translation

`data/locales/en.json` is the single source of truth. Other locales are generated on first request and cached in SQLite (`translation_cache`, `locale_snapshots`). Character budgets per UI slot prevent overflow in German, Greek, Romanian, etc.

```bash
npm run sync-locales   # optional: pre-warm cache at build/deploy
```

Without API keys, MyMemory free tier is used. Set `TRANSLATION_DISABLE=true` for offline dev.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # start production server
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Production deployment (recommended: Docker)

This app uses **SQLite** and writes JSON from the admin panel. **Vercel serverless does not persist the database or file writes** between invocations. Use Docker on a VPS, Railway, Fly.io, or similar with a persistent volume.

### Docker Compose

```bash
cp .env.example .env
# Edit .env — set ADMIN_SECRET, GDPR_SALT, NEXT_PUBLIC_SITE_URL

docker compose up -d --build
```

The `thassos-data` volume persists `data/thassos.db` and any admin JSON edits.

### Manual Docker

```bash
docker build -t thassos-boats .
docker run -d -p 3000:3000 --env-file .env -v thassos-data:/app/data thassos-boats
```

### Reverse proxy

Put Caddy or nginx in front for HTTPS. Example Caddy:

```
thassosboats.gr {
  reverse_proxy localhost:3000
}
```

## Security

- **Admin auth** — HMAC-signed `admin-session` cookie (8h TTL, `SameSite=Strict`, `HttpOnly`). Login password and signing key are separate env vars.
- **Rate limiting** — login (5/15min), bookings (3/hr), GDPR requests (3/hr), consent logs (30/hr) per IP.
- **Input validation** — field length caps, email/slug/date checks, boat/route ID whitelist on bookings.
- **XSS** — blog HTML sanitized on save and render (`sanitize-html` allowlist).
- **Honeypot** — hidden fields on booking and GDPR forms reject bot submissions.
- **API hardening** — `GET/PUT /api/data/*` admin-only (middleware + route); JSON body size limits.
- **Headers** — CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy in `next.config.ts`.
- **Secrets** — no dev fallbacks; all three secrets required via `.env.local` / `.env`.
- **Edge-case hardening** — strict calendar dates, marina timezone (`Europe/Athens`), business hours (08–20), guests capped per boat `pax`, route ID validation fix, duplicate booking/GDPR detection, atomic JSON writes with schema validation, UUID IDs, origin checks on public POSTs, prototype-pollution guard, consent dedup, slug collision 409s, admin 404 on missing records.

## Project structure

```
data/              # Static JSON + SQLite (gitignored)
src/
  app/
    (site)/        # Public pages
    admin/         # Protected admin UI
    api/           # Bookings, GDPR, admin APIs
  components/      # UI (Hero, Fleet, Chat, layout)
  lib/
    seo/           # Metadata, schemas, sitemap helpers
    db/            # SQLite access
    admin-auth.ts  # Signed session cookies
public/            # Images, fonts, brand assets
```

## Pre-launch checklist

- [ ] Set real phone, email, and marina in `src/lib/site.ts`
- [ ] Set `NEXT_PUBLIC_SITE_URL`, `ADMIN_SECRET`, `GDPR_SALT` in production env
- [ ] Replace placeholder images/media where needed
- [ ] Add `GOOGLE_SITE_VERIFICATION` and submit sitemap in Search Console
- [ ] Test booking flow end-to-end
- [ ] Test admin login, content edit, blog, GDPR queue
- [ ] Confirm HTTPS and `www` redirect at your host
- [ ] Run `npm run build && npm run typecheck`

## Licence

Private — Rent A Boat Villy.
