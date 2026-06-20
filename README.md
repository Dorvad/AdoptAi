# AI Adoption Workshop Kit — Landing Page

A standalone, responsive marketing landing page for the **AI Adoption Workshop Kit**
by Workflow Adoption Lab.

This page was rebuilt from a Canva document export into clean, production-grade
HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Semantic page markup and all copy |
| `styles.css` | Design-token system, layout, components, responsive rules |
| `script.js`  | FAQ accordion, mobile navigation, scroll-reveal animations |

## Running locally

It is fully static — open `index.html` directly in a browser, or serve the
folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Design system

- **Typography** — Manrope (headings) and Inter (body), loaded from Google Fonts.
- **Palette** — warm cream background (`#F8F6F1`), sage green (`#315C54`),
  amber accent (`#C9904A`), neutral ink and borders. All defined as CSS
  custom properties in `:root`.
- **Layout** — a single content container (max-width 1120px) with a narrow
  variant for reading sections.

## Accessibility & UX

- Skip-to-content link, semantic landmarks, and visible focus rings.
- FAQ built on real `<button>` elements with `aria-expanded` / panel toggling.
- Accessible mobile menu with Escape-to-close.
- All motion is disabled under `prefers-reduced-motion`.

## Sections

Navigation · Hero · The adoption gap · The adoption path · What's inside ·
How it works · Who it's for · Free scorecard · Pricing · FAQ · Final CTA · Footer
