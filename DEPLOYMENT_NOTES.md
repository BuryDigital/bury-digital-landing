# Deployment notes — Bury Digital landing site

Static site built with Vite, deployed on Cloudflare Pages. The homepage is the
automation-studio positioning (build marker
`<!-- Bury Digital automation-studio homepage v1 -->` in `index.html`).

> Note: the old `/api/demo` Pages Function and the "Try it live" SMS demo were
> removed in the automation-studio pivot. The upstream n8n "Start Demo" webhook
> and its Twilio/Supabase wiring are no longer called by this site and can be
> retired separately.

## Build

```bash
npm install
npm run build      # outputs to ./dist
```

- CSS/JS are content-hashed (e.g. `assets/main-XXXXXXXX.css`), so they are safe
  to cache forever and are versioned automatically on every build.
- `public/_headers` is copied into `dist/_headers` and tells Cloudflare to keep
  HTML uncached (`must-revalidate`) while caching `/assets/*` immutably. This is
  what stops an old missed-call-only homepage being served from cache.
- Only `index.html` builds to `/`. There is no second/old homepage in the build
  inputs (`vite.config.js` → `rollupOptions.input`).

## Structured data and freshness (nothing to bump by hand)

- JSON-LD lives in `src/components/schema/*.html`, one file per page, pulled into
  each `<head>` with the same `<!-- @include: -->` mechanism as the body
  components. The homepage uses a single `@graph` with `@id` cross-references
  (`#organization`, `#oscar-bury`, `#website`, `#webpage`, `#faq`, four
  `#service-*` nodes). Subpages repeat the `#organization` `@id` so every page
  resolves to one business entity.
- `stampBuildDate()` in `vite.config.js` replaces `__BUILD_DATE__` /
  `__BUILD_DATETIME__` in HTML and rewrites `<lastmod>` in `dist/sitemap.xml` on
  every build, in Australia/Melbourne time. **Freshness dates update themselves
  on deploy — there is nothing manual to remember.**
- Exception: `dateModified` on privacy / terms / security is hard-coded on
  purpose. Those pages show "Last updated: August 2026" in visible copy, and an
  auto-bumped date would claim the policy changed on every deploy. Bump those by
  hand when the policy text actually changes, and keep them in step with the
  visible line.
- If you edit the FAQ or the pricing tiers, mirror the change in
  `src/components/schema/home.html`. The schema answers and prices must stay
  identical to the visible text — Google treats a mismatch as spam.
- Do not add `aggregateRating`, `Review`, or award schema. There are no published
  reviews to back them up, so they are a manual-action risk.

## Cache purge after deploy (do this every deploy)

If Cloudflare cache is not purged automatically by your Pages deployment, purge
manually so visitors don't see a stale homepage:

1. Deploy the latest build (push to the production branch, or `wrangler pages deploy ./dist`).
2. In the Cloudflare dashboard → your zone → **Caching → Configuration → Purge Cache**:
   1. Purge `https://bury-digital.com/`
   2. Purge `https://bury-digital.com/index.html`
   3. Purge any CSS/JS only if filenames are NOT hashed (they are hashed here, so
      normally not needed).
3. Hard-refresh and test in an incognito window (Cmd/Ctrl+Shift+R).

### Optional CLI purge (if an API token with Cache Purge scope is available)

```bash
# Requires CF_API_TOKEN (Zone → Cache Purge) and CF_ZONE_ID
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://bury-digital.com/","https://bury-digital.com/index.html"]}'
```

> No Cloudflare API token/account details are stored in this repo. Use the
> manual dashboard steps above unless a token is provided in the CI environment.

## Verify after deploy

- View source on `https://bury-digital.com/` and confirm the marker
  `<!-- Bury Digital automation-studio homepage v1 -->` is present.
- Confirm the hero reads "We build automation systems that kill the manual work."
- Confirm the four-category offer menu renders under **Pricing**.
- Confirm every CTA points at `https://cal.com/oscarbury` and no "free trial" text remains.
- Paste `https://bury-digital.com/` into the
  [Rich Results Test](https://search.google.com/test/rich-results) and confirm
  the FAQ and business entities are detected.
- Confirm `https://bury-digital.com/llms.txt` and `/sitemap.xml` return 200, and
  that the sitemap's `<lastmod>` shows the deploy date.
- Submit the sitemap in Google Search Console (`robots.txt` now points at the
  real domain — it previously said `REPLACE_WITH_DOMAIN`, so it had never been
  discoverable).
