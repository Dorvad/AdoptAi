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

## How to connect an email provider later

Email capture on the result page currently stores the submission in local state
and shows a success message. Search `scorecard.js` for the `TODO (production)`
comment in `wireEmailCapture()` and POST `{ participant, result, email }` to your
provider (Beehiiv, MailerLite, ConvertKit, …) — ideally via a serverless endpoint
so API keys are never exposed in client-side code.

## PDF export

Uses **jsPDF** (loaded from CDN in `index.html`) to build a branded
*AI Adoption Readiness Report*. If jsPDF is unavailable, it falls back to a
print-friendly window (`printableFallback`). To remove the CDN dependency, vendor
`jspdf.umd.min.js` locally and point the script tag at it.

## Privacy

The tool only asks for name/role/team/email and 1–5 ratings — no confidential
information. Privacy notes appear on the intro, the question steps, and the result
page. Answers stay in the browser unless the user submits the optional email form.

## Accessibility

Semantic `<fieldset>`/`<legend>` per question, radio groups with descriptive
`aria-label`s, visible focus rings, keyboard navigation, focus moved to the step
heading on navigation, an accessible modal (`role="dialog"`, Escape to close,
focus restore), and full `prefers-reduced-motion` support.
