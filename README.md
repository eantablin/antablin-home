# antablin.com

The landing page for the **Antablin family** — a portfolio hub that introduces
each maker and fans out to their own site:

- **[emanuel.antablin.com](https://emanuel.antablin.com)** — Emanuel · AI Engineer (agentic AI, RAG, LLM systems)
- **[richard.antablin.com](https://richard.antablin.com)** — Richard, EIT · Structural & Project Engineer
- **[alex.antablin.com](https://alex.antablin.com)** — Alexandra · Biochemist & laboratory scientist

The hub is built to rank across all three fields at once — AI engineering,
structural/architectural engineering, and biochemistry/marine science — so it
can draw more traffic than any single child site.

## Tech

Built with **[Astro](https://astro.build)** and deployed to GitHub Pages via
**GitHub Actions**. Astro renders everything to **static HTML** (no framework
runtime), so the page is fast and fully crawlable.

- **Refined "ink & gold" theme** — a neutral dark base where gold ties the
  family together and each maker carries a subtle accent from their own field
  (cyan = AI, amber = structures, violet = science).
- **WebGL hero** (Three.js, bundled): a gold "family" core orbited by three
  field-colored satellites. Gracefully degrades to a 2D `<canvas>`
  constellation, then to a static frame, with perf guards (fewer particles /
  no bloom on low-power devices; pauses offscreen; respects
  `prefers-reduced-motion`).
- **Combined SEO** — one title/description spanning all three disciplines,
  cross-field keywords, Open Graph/Twitter cards, an auto-generated sitemap,
  and JSON-LD (`WebSite` + a `CollectionPage` listing a `Person` per maker,
  each linked to their own domain and socials).
- Custom crosshair cursor, magnetic buttons, card tilt, scroll-reveals, and
  count-up stats (desktop / fine-pointer only).

## Structure

```
astro.config.mjs           site URL + sitemap (excludes the preview route)
public/
  CNAME                     custom domain (www.antablin.com)
  .nojekyll  robots.txt     serve as-is · crawl rules
  assets/img/               favicon + social-card (Open Graph) SVGs
src/
  data/family.ts            ← single source of truth (copy, stats, skills, links, accents)
  layouts/Base.astro        page shell: head, overlays, nav, footer, scripts
  components/
    Seo.astro               meta tags + JSON-LD structured data
    Member.astro            one maker's rich section (bio, stats, skills)
    Monogram.astro          the "A" family mark
  scripts/                  boot.js · ui.js · hero3d.js (bundled by Vite)
  styles/global.css         design tokens + all components
  pages/
    index.astro             the hub
    404.astro               not-found page
```

**Editing content:** everything (bios, roles, stats, skills, links, per-field
accents) lives in [`src/data/family.ts`](src/data/family.ts). Add a maker or
tweak copy there — the page, the structured data, and the hero palette all
update from it.

## Develop

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output → dist/
npm run preview   # serve the production build
```

## Deploy

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the site and publishes `dist/` to GitHub Pages.

**One-time repo setting (required after the Astro migration):**

> **Settings → Pages → Build and deployment → Source: GitHub Actions**

(Previously this site deployed "from a branch" — that's now replaced by the
Actions build. The `public/CNAME` keeps `www.antablin.com` attached.)

## Notes

- Contact points to `mailto:eantablin@protonmail.com`.
- `public/assets/img/social-card.svg` works for most scrapers; render it to a
  1200×630 PNG if you want maximum compatibility with older preview crawlers.
- Headshots: drop a photo per maker and set `photo:` in `family.ts` — the
  member avatar swaps from the monogram to the image automatically.
```
