# Deployment notes — Bury Digital landing site

Static site built with Vite, deployed on Cloudflare Pages (with the `/api/demo`
Pages Function). The homepage is the Capture/Triage positioning (build marker
`<!-- Bury Digital Capture/Triage homepage v2 -->` in `index.html`).

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
  `<!-- Bury Digital Capture/Triage homepage v2 -->` is present.
- Confirm the hero reads "Never miss an enquiry — and know who to call back first."
- Confirm both **Capture** and **Triage** cards render.
