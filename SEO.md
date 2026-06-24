# SEO & launch readiness — developer notes

This is a **static** site (plain HTML/CSS/JS on Netlify, no framework or build
step), so SEO is implemented with static files and in-page tags rather than a
framework's metadata API.

## What was added

| Area | Where |
|------|-------|
| Title, description, keywords, canonical, robots | `index.html` + each page `<head>` |
| Open Graph + Twitter cards | every page `<head>` |
| JSON-LD: Organization, WebSite, Product (3 offers), FAQPage | `index.html` |
| JSON-LD: BreadcrumbList | `resources.html` |
| `robots.txt`, `sitemap.xml`, `ads.txt` | repo root |
| `favicon.svg` | repo root (the AiDopt mark) |
| Resources hub | `resources.html` |
| Trust/legal pages | `privacy.html`, `terms.html`, `contact.html`, `about.html`, `license.html` |
| Columned footer with legal links + blurb | all pages |

Product, pricing, and the interactive scorecard are **sections of the homepage**
(`/#pricing`, `/#scorecard`, `/#whats-inside`), so they are covered by the
homepage URL rather than separate routes.

## ⚠️ Replace the domain

The production domain is hard-coded as `https://aidopt.icu` (placeholder). Search
for it and replace it in:

- `index.html` (canonical, og:url, all JSON-LD `url`/`item` values, og/twitter image)
- `resources.html`, `privacy.html`, `terms.html`, `contact.html`, `about.html`, `license.html` (canonical, og:url, breadcrumb)
- `robots.txt` (Sitemap line)
- `sitemap.xml` (every `<loc>`)

Because there is no build step, this is a find-and-replace. (If you later add a
build tool, move the domain into `NEXT_PUBLIC_SITE_URL` or equivalent and
template these files.)

## Intended environment variables (for a future build step)

Not used at runtime today (static site), but the intended config is:

```
NEXT_PUBLIC_SITE_URL=https://aidopt.icu
NEXT_PUBLIC_PRODUCT_URL=/#pricing
NEXT_PUBLIC_LEMONSQUEEZY_INDIVIDUAL_URL=https://aidopt.lemonsqueezy.com/checkout/buy/89f782a0-e2e5-4842-9912-964efe34a810?enabled=1817927
NEXT_PUBLIC_LEMONSQUEEZY_CONSULTANT_URL=https://aidopt.lemonsqueezy.com/checkout/buy/d6375c3c-622f-46ad-a43d-2054dc71e2c0?enabled=1818035
NEXT_PUBLIC_LEMONSQUEEZY_ORGANIZATION_URL=https://aidopt.lemonsqueezy.com/checkout/buy/8857b38e-6725-446e-bfef-4019cb242105?enabled=1818047
```

All three checkout links are wired in `index.html` with the `lemonsqueezy-button` class for overlay checkout.

## TODOs before / around launch

- **OG image:** create `/og/aidopt-default-og.png` (1200×630). Referenced in every
  page's `og:image`/`twitter:image`; not generated here (no OG-image pattern in repo).
- **Legal review:** `privacy.html`, `terms.html`, `license.html` are practical
  templates with `TODO` markers (retention periods, governing law, refund policy,
  contact email). Have them reviewed and replace `hello@aidopt.icu`.
- **ads.txt:** no publisher ID was invented. After AdSense approval, add the real
  `google.com, pub-…, DIRECT, …` line (see `ads.txt`).
- **Resource pages:** the individual resources (checklists, matrices, templates)
  are listed on `resources.html` but do **not** have their own pages yet. Thin
  placeholder pages would hurt AdSense review, so they were not created. Author
  real content for each, then add them to `sitemap.xml` and give each its own
  title/description.

## Manual steps in Google Search Console / AdSense

1. **Search Console:** add the property (domain or URL-prefix), verify ownership
   (DNS TXT or the HTML-file/meta-tag method), then submit `https://aidopt.icu/sitemap.xml`.
2. **AdSense:** apply only after the legal pages are finalized and there is enough
   original content. Add the AdSense site, place the verification snippet, and
   after approval add the `ads.txt` line. Then update `privacy.html` → "Google
   AdSense" section to say ads are active and describe the cookies used.
3. **Analytics (optional):** if you add analytics, document it in `privacy.html`
   → "Cookies and analytics".
