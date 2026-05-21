# Bury Digital legal content

Six legal documents ready to be turned into HTML pages on bury-digital.com.

## Files

| File | Replaces / adds | Footer slot |
|---|---|---|
| `privacy-policy.md` | Replaces existing `privacy.html` | Existing "Privacy Policy" link |
| `terms-of-service.md` | Replaces existing `terms.html` | Existing "Terms of Service" link |
| `acceptable-use-policy.md` | NEW — `acceptable-use.html` | Add to footer Legal column |
| `subprocessors.md` | NEW — `subprocessors.html` | Add to footer Legal column |
| `security.md` | Replaces existing `security.html` | Existing "Security" link |
| `data-processing-agreement.md` | NEW — `dpa.html` | Add to footer Legal column |

## Placeholders to fill in before going live

Search-and-replace these across all files:

- `[DATE TO INSERT]` → today's date (e.g. "21 May 2026")
- `[REGISTERED OFFICE ADDRESS]` → Bury Digital Pty Ltd's registered office (check ASIC if unsure — your tax invoice should also have it)
- `[VERIFY PAYMENT PROCESSOR — e.g. Stripe Payments Australia Pty Ltd]` (in `subprocessors.md`) → whatever payment processor you actually use

## Email address

All contact email references in the documents currently point to `oscar@bury.com.au` (the founder's address). If you later split out aliases (`privacy@`, `legal@`, `security@`, `abuse@`) for category routing, search-and-replace `oscar@bury.com.au` in the relevant `.md` files and re-run `tools/md-to-legal.mjs`.

## Important to verify

- **Supabase region.** I assumed Sydney (ap-southeast-2). If your project is elsewhere, fix the references in `privacy-policy.md` and `security.md`.
- **n8n.** Not currently listed as a subprocessor because self-hosted instances aren't subprocessors. If you use n8n Cloud, add it to `subprocessors.md`.
- **Anthropic API training claim.** Verify Anthropic's current API data policy (it has historically been: no training on API customer data) at https://www.anthropic.com/legal/commercial-terms before publishing.

## Not lawyer-reviewed

These are reasonable templates based on standard Australian SaaS practice and the current Privacy Act regime (including the December 2024 amendments). They are good enough to deploy and meaningfully better than nothing. They are NOT a substitute for an actual Australian SaaS lawyer reviewing them. Budget AUD $1.5–3k for a review when you can afford it — recommended before crossing ~$5k MRR or before signing your first lawyer/health client (whichever comes first).
