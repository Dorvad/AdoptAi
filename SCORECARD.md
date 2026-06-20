# AI Adoption Readiness Scorecard — developer notes

An interactive, client-side scorecard embedded in the landing page. It is built
in the same dependency-free vanilla pattern as the rest of the site and reuses
the existing design tokens and components (`.btn`, `.card`, `.meter`, `.eyebrow`,
`.cta-panel`).

## Where it lives

| File | Role |
|------|------|
| `index.html` | Mount point: `<section id="scorecard">` → `<div id="scorecardApp">` (with a `<noscript>` fallback). Loads jsPDF (CDN) and `scorecard.js`. |
| `scorecard.js` | All data, scoring, views, PDF export, mock ad unlock, email capture. |
| `styles.css` | Scorecard styles live under the "AI Adoption Readiness Scorecard" heading; responsive rules are in the existing media queries. |
| `netlify/functions/send-result.js` | Serverless function that emails the result via Resend (holds the API key). |
| `netlify.toml` | Netlify build/functions config. |

The scorecard sits after the value-proposition sections and before the pricing
section, so the natural flow is: explore the offer → measure readiness → see the
paid kit. It replaces the previous static "free scorecard" teaser; the `#scorecard`
anchor is preserved, so existing CTAs still point to it.

## User flow

Intro + participant form → 6 steps of 4 questions (1–5 scale) → result report
(score ring, band, section breakdown, strongest/weakest, recommended next step,
email capture, optional PDF export, kit CTA).

## How scoring works

- **24 questions**, each rated **1–5**. Minimum total **24**, maximum **120**.
- **6 sections** (A–F) of 4 questions each: section raw score **4–20**.
- `computeResult(answers)` in `scorecard.js`:
  - sums each section (`raw`), computes `pct = raw / 20`, and an interpretation
    (`4–8` Needs clarity · `9–13` Developing · `14–17` Good foundation · `18–20` Strong area);
  - sums all sections into `total` and maps it to a **result band** via `resultBands`
    (`24–48` Early Awareness · `49–72` Scattered Experimentation · `73–96` Emerging
    Adoption · `97–120` Strong Adoption Readiness);
  - picks **strongest** (highest raw, first on a tie) and **weakest** (lowest raw,
    last on a tie, so an all-equal result still shows two distinct sections);
  - attaches the weakest-section recommendation from `WEAKEST_RECS`.

Submission is gated: the Continue button is disabled until all four statements in
the current step are answered, and the final result requires all 24. Users can go
back and change answers; the running "n of 24 answered" progress updates live.

## How to update questions

Everything is data-driven in `scorecard.js`:

- **Question text** — edit the `text` of the relevant item in `scorecardQuestions`.
  Keep `id`, `sectionId`, and the 24-item / 4-per-section structure intact (the
  scoring math assumes 4 questions per section and a 1–5 scale).
- **Section titles/descriptions** — edit `sections`.
- **Result bands** — edit `resultBands` (`min`, `max`, `title`, `description`,
  `recommendedFocus[]`). Keep the ranges contiguous and covering 24–120.
- **Per-section recommendations** — edit `WEAKEST_RECS` (`action`, `experiment`).
- **Scale labels** — edit `SCALE`.

To change the number of questions per section, update both `scorecardQuestions`
and the section min/max assumptions in `interpretSection` and the `/ 20` divisors.

## How to connect the kit CTA link

Set one constant at the top of `scorecard.js`:

```js
const KIT_CTA_URL = "https://example.com/kit"; // ← change to the real URL
```

It is used by the result-page button and the PDF report.

## How to replace the mock rewarded ad later

The optional PDF export is gated behind an optional rewarded-ad unlock. The basic
result is **never** blocked.

- `useRewardedAdUnlock()` is the single integration point (a vanilla equivalent of
  a React hook). It owns the `unlocked` state and a **mock** ad (`watchMockAd`,
  which resolves after ~5 seconds).
- To go live, replace `watchMockAd` with a real **Google Ad Manager rewarded web**
  integration: load the rewarded ad, and call `grant()` **only** from the SDK's
  genuine reward callback. Do not auto-grant, do not disguise the ad as a normal
  button, and do not block the basic result.
- The modal copy and flow (`openPdfUnlockModal`) can stay as-is.

## Email delivery with Resend (Netlify)

When a user submits the email form on the result page, the scorecard POSTs the
result JSON to a **Netlify Function** (`netlify/functions/send-result.js`), which
sends a branded report through **Resend**.

> Resend (like any email API) requires a **secret API key**. It must live on the
> server, never in the browser — that is the whole reason for the function.

**Architecture**

```
scorecard.js  ──POST result JSON──▶  /.netlify/functions/send-result  ──▶  Resend API  ──▶  inbox
(browser)                            (holds RESEND_API_KEY)
```

The client endpoint is the `RESULT_API_ENDPOINT` constant at the top of
`scorecard.js` (default `"/.netlify/functions/send-result"`).

### One-time setup

1. **Create a Resend account** at resend.com and **verify a sending domain**
   (Resend → Domains → add your domain and the DNS records). Until a domain is
   verified you can only test by sending to your own address from
   `onboarding@resend.dev`.
2. **Create an API key** (Resend → API Keys). It starts with `re_`.
3. **Add environment variables** in Netlify (Site settings → Environment
   variables):
   - `RESEND_API_KEY` — your `re_...` key *(required)*
   - `RESEND_FROM` — verified sender, e.g.
     `Workflow Adoption Lab <reports@yourdomain.com>` *(required)*
   - `RESEND_REPLY_TO` — optional reply-to address
   - `RESEND_ADMIN_TO` — optional, comma-separated address(es) to receive a lead
     notification for each submission
4. **Deploy.** `netlify.toml` already points `functions = "netlify/functions"`.
   The function uses the global `fetch`, so it needs **Node 18+** (Netlify's
   default) and **no npm dependencies**.

### Test locally

```bash
npm i -g netlify-cli
netlify dev            # serves the site + functions, injects env vars
```

Without `netlify dev` (e.g. opening the file directly or a plain static server),
the email request will fail gracefully — the form shows a "couldn't send" message
and the rest of the result page keeps working.

### Notes

- The email HTML is built **server-side** in `buildEmailHtml()`; all user-supplied
  fields are HTML-escaped.
- The optional admin/lead email is best-effort and never blocks the user's
  confirmation.
- Prefer **Resend's REST API via `fetch`** (used here) to avoid a build step. If
  you'd rather use the official SDK, `npm i resend`, add a `package.json`, and
  replace `resendSend()` with `new Resend(process.env.RESEND_API_KEY).emails.send(...)`.

### Other hosts

The function is plain logic over `fetch`, so it ports easily:

| Host | File location | Endpoint to set in `RESULT_API_ENDPOINT` |
|------|---------------|------------------------------------------|
| Netlify (current) | `netlify/functions/send-result.js` | `/.netlify/functions/send-result` |
| Vercel | `api/send-result.js` (export `default (req,res)`) | `/api/send-result` |
| Cloudflare Pages | `functions/api/send-result.js` (export `onRequestPost`) | `/api/send-result` |

Keep the validation, escaping, and the Resend `fetch` call; only the
request/response wrapper changes per platform.

## PDF export

Uses **jsPDF** (loaded from CDN in `index.html`) to build a branded
*AI Adoption Readiness Report*. If jsPDF is unavailable, it falls back to a
print-friendly window (`printableFallback`). To remove the CDN dependency, vendor
`jspdf.umd.min.js` locally and point the script tag at it.

## Privacy

The tool only asks for name/role/team/email and 1–5 ratings — no confidential
information. Privacy notes appear on the intro, the question steps, and the result
page. Answers stay in the browser unless the user submits the optional email form,
in which case the result is sent to the `send-result` function and on to Resend
with the user's explicit consent (consent is required server-side too).

## Accessibility

Semantic `<fieldset>`/`<legend>` per question, radio groups with descriptive
`aria-label`s, visible focus rings, keyboard navigation, focus moved to the step
heading on navigation, an accessible modal (`role="dialog"`, Escape to close,
focus restore), and full `prefers-reduced-motion` support.
