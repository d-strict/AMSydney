# Arte Museum Special Edition in Sydney — Landing Page

Waitlist landing page for **Arte Museum Special Edition in Sydney** (`sydney.artemuseum.com`).
Single purpose: collect waitlist emails. English only. Benchmark: artekidspark.com/denver.

Built with [Astro](https://astro.build) + `@astrojs/node` (standalone server).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
node dist/server/entry.mjs   # run the production server (HOST/PORT env supported)
npm run check    # type-check
```

## Structure

- `src/data/site.ts` — all copy and links in one place (from the approved 2026-08-28 spec)
- `src/components/` — `Nav`, `Hero`, `WaitlistForm`, `PrivacyModal`, `Footer`
- `src/pages/index.astro` — the page (static, prerendered)
- `src/pages/api/waitlist.ts` — form endpoint (server-rendered)
- `src/lib/waitlist.ts` — signup storage
- `public/media/` — hero background image + placeholder loop video (webm/mp4,
  slow zoom over the Arte Museum Busan Orsay special-exhibition photo)

## Waitlist storage

`POST /api/waitlist` with `{ "email": "...", "consent": true }`:

- `201` saved · `409` duplicate · `400` invalid email / missing consent
- Signups append to a local JSONL file (`.data/waitlist.jsonl`, override with
  `WAITLIST_STORE_FILE`). Duplicate check is case/whitespace-insensitive.
- Set `WAITLIST_WEBHOOK_URL` to forward each signup as a JSON POST to an external
  endpoint (CRM / email tool). See `.env.example`.
- The file store works for dev and single-Node-server deploys. For serverless
  hosting or a shared DB, swap `src/lib/waitlist.ts` for a real backend
  (e.g. Supabase) — the endpoint and form stay unchanged.

## Form behavior (per spec)

- Email + single consent checkbox (unchecked by default, required, label click toggles)
- Errors: unchecked consent / invalid email / duplicate — exact copy in `site.ts`
- Success replaces the form: "You're on the list. …"
- "Privacy Collection Notice" opens a same-page modal (Spam Act 2003 / Privacy Act
  1988 APP 5·8 minimum disclosure); footer links to the notice, global privacy
  policy, and Instagram

## TODO before launch

- [ ] Confirm final hero visual (current image/video are placeholders — safe
      material only until artwork curation is confirmed). Video background is
      already implemented: set `hero.video` in `src/data/site.ts` (webm + mp4),
      autoplay/muted/loop/playsinline, still-image fallback on load failure and
      for prefers-reduced-motion
- [ ] Legal: confirm the storage-platform sentence in the Privacy Collection Notice
      (written platform-neutral for now; spec drafts referenced Imweb/Webflow)
- [ ] Confirm global Privacy Policy URL and Instagram handle in `src/data/site.ts`
- [ ] Decide production waitlist backend (Supabase or email-tool webhook)
