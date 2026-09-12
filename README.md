# Fountain

An airy, watercolor-styled landing page for handwriting. Print a sheet, write your letters, take a picture,
and let your AI agent turn your own handwriting into a real font.

Fountain is a static landing page plus two downloadable assets:

- **The Fountain sheet** (`downloads/fountain-grid-letter.pdf`, `downloads/fountain-grid-a4.pdf`):
  two printable pages with a box for every letter, number and mark, plus ruled lines for a
  free sentence. Also viewable at `grid/`. The cell layout is described in
  `downloads/fountain-grid-layout.json`.
- **The skill** (`downloads/handwriting-to-font.skill`): a zipped skill folder that teaches an
  AI agent (Claude Code, or anything that reads skills) how to segment, trace, normalize,
  space, kern and compile a TTF from photos of the sheet. Source lives in `skill/`.

The whole site is set in **Vinit Hand Natural** (`fonts/`), a font made from one handwritten
alphabet sheet with exactly this process.

## Run it locally

It is plain HTML, CSS and JS with no build step for the page itself:

```sh
npx http-server . -p 4173 -o
```

## Rebuild the downloads

The PDFs, the layout manifest and the skill zip are generated from `grid/` and `skill/`:

```sh
npm install        # playwright, for rendering the PDFs
npm run build      # writes into downloads/
npm run screenshots
```

`grid/layout.js` is the single source of truth for the sheet: the printable page, the JSON
manifest and the skill's `references/fountain-grid.md` all follow it.

## Deploy

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to
`main`. Enable Pages with the "GitHub Actions" source in the repository settings.

## Layout

```
index.html, styles.css, main.js   the landing page
grid/                             printable sheet (layout.js is the source of truth)
skill/handwriting-to-font/        the skill, zipped into downloads/ by the build
fonts/                            Vinit Hand Natural (TTF and WOFF2)
downloads/                        generated assets shipped with the site
scripts/                          build and screenshot helpers
```
