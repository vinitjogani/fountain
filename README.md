# Fountain

Turn your handwriting into a real font. Print a sheet, write it out with any pen,
photograph it, and hand the photo to your AI agent.

Fountain is a static landing page plus two downloadable assets:

- **The printable sheet** (`downloads/fountain-grid-letter.pdf`, `downloads/fountain-grid-a4.pdf`):
  two pages with a box for every letter, number and mark, guide lines for cap, x-height and
  baseline, corner fiducials for perspective correction, and ruled lines for a free sentence.
  Also viewable at `grid/`, and described machine-readably in
  `downloads/fountain-grid-layout.json`.
- **The Fountain skill** (`downloads/handwriting-to-font.skill`): a zipped skill folder that
  teaches an AI agent (Claude Code, or anything that reads skills) how to segment, trace,
  normalise, space, kern and compile a font from photos of the sheet. It carries a reference
  describing the sheet, plus the same layout manifest. Source lives in `skill/`.

## Typography

The page is set in **Spectral** with **IBM Plex Mono** for labels, both self-hosted from
`fonts/` so there is no third-party request at runtime. The accent voice — the wordmark,
the specimen, the step numerals and the sample words — is **Vinit Hand Natural**, a font
made from one handwritten alphabet sheet with exactly this process.

## Run it locally

The page is plain HTML, CSS and JS with no build step:

```sh
npx http-server . -p 4173 -o
```

## Rebuild the downloads

The PDFs, the layout manifest and the skill zip are generated from `grid/` and `skill/`:

```sh
npm install        # playwright, for rendering the PDFs
npm run build      # writes into downloads/ and skill/.../references/
npm run screenshots
```

`grid/layout.js` is the single source of truth for the sheet: the printable page, the JSON
manifest and the skill's `references/fountain-grid.md` all follow it.

## Deploy

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to
`main`.

It needs Pages switched on once by hand first, under **Settings → Pages → Build and
deployment → Source: GitHub Actions**. Until that is done the workflow fails on its first
step with `Get Pages site failed`. Neither the workflow token nor a personal token can
create the site for you: that call needs repository admin rights. Once Pages is on, re-run
the workflow (or push to `main`) and it deploys.

## Layout

```
index.html, styles.css, main.js   the landing page
grid/                             printable sheet (layout.js is the source of truth)
skill/handwriting-to-font/        the skill, zipped into downloads/ by the build
fonts/                            Vinit Hand Natural, Spectral, IBM Plex Mono
downloads/                        generated assets shipped with the site
scripts/                          build and screenshot helpers
```
