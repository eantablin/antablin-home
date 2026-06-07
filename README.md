# antablin.com

The landing page for the Antablin family — an architectural / engineering-themed
hub that fans out to:

- **[emanuel.antablin.com](https://emanuel.antablin.com)** — Emanuel, software engineer
- **[richard.antablin.com](https://richard.antablin.com)** — Richard, structural engineering manager

## Design

Gold-on-ink "engineering drawing set" aesthetic — blueprint grid, draftsman
annotations, a custom crosshair cursor with live coordinates, and a WebGL
centerpiece (a rotating wireframe node-diagram in a particle field).

The whole thing is **static** — no build step, no server. It runs straight off
GitHub Pages.

## Structure

```
index.html              entry — markup + meta + importmap
404.html                themed not-found page
CNAME                   custom domain (www.antablin.com)
.nojekyll               serve files as-is (skip Jekyll)
assets/
  css/style.css         all styling + tokens + responsive + reduced-motion
  js/
    main.js             orchestrator + device/perf detection
    ui.js               preloader, nav, reveals, cursor, tilt, 2D fallback
    hero3d.js           Three.js hero scene (lazy-loaded, with bloom)
  img/
    favicon.svg         "A" monogram
    social-card.svg     Open Graph / Twitter card
```

## Tech notes

- **Three.js** loads from a pinned jsDelivr CDN via an `importmap` and is
  imported lazily. If WebGL is unavailable (or the import fails), the hero
  gracefully degrades to a 2D `<canvas>` constellation.
- **Performance guards:** particle counts drop and bloom is skipped on
  low-power / mobile devices; the scene pauses when offscreen or the tab is
  hidden; everything respects `prefers-reduced-motion`.
- The custom cursor, magnetic buttons, and card tilt are desktop-only
  (`hover: hover and pointer: fine`).

## Local preview

ES modules need to be served over HTTP (not `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Already wired for GitHub Pages with the `CNAME` set to `www.antablin.com`.
Push to the default branch and enable Pages (deploy from branch, root). The
`.nojekyll` file ensures the `assets/` directory is served untouched.

## Notes

- Contact button points to `mailto:eantablin@protonmail.com`.
- `social-card.svg` works for most scrapers; render it to a 1200×630 PNG if you
  want maximum compatibility (older Twitter/iMessage previews prefer raster).
