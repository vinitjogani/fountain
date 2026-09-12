---
name: handwriting-to-font
description: "Build a real TTF/OTF from photographed handwriting samples: segment glyphs, vectorize without potrace, normalize the hand's systematic distortions, then space, kern and compile. Use for any raster-to-font or glyph-normalization task."
---

# Handwriting → font

> **Fountain sheets.** If the sample was written on a Fountain sheet (a 7-column grid with
> four black corner rings and teal guides), read `references/fountain-grid.md` first: it gives
> the exact cell → character map, guide positions and print colours, so segmentation
> becomes a lookup instead of a guess.

Tracing is the easy part. **Normalization is where the quality lives**, and it is a
measurement problem, not an averaging problem. Budget your effort accordingly.

Stack that works with no network: `numpy`, `scipy`, `opencv`, `scikit-image`,
`matplotlib` (geometry only), `fontTools`, `PIL` (rendering). potrace and brotli are
commonly unavailable — write the tracer yourself (below) and ship WOFF1 instead of WOFF2.

## Pipeline

Segment → vectorize → normalize → weight-correct → space → kern → compile → **look**.
Persist each stage as JSON so you can re-enter the chain without re-running everything.

---

## 1. Segmentation

- **Flat-field first.** Pencil on paper has a huge illumination gradient. Divide the
  gray image by a large-kernel median blur (`medianBlur(gray, 101..121)`) before
  thresholding. A global threshold on the raw image will fail.
- **Keep a soft alpha map**, not a hard binary: `ink = clip((T - flat)/W, 0, 1)`. The
  tracer needs antialiased edges for subpixel accuracy.
- Connected components → cluster into rows by bbox bottom → sort by x → map to the
  expected character sequence. Assert the per-row counts match before continuing.
- **Merge multi-part glyphs** (i/j dots) by: much smaller area than the row median +
  horizontal bbox overlap with a neighbour.
- **Reject non-ink marks by colour.** A stray red pen dot had `R - (B+G)/2 ≈ 20` while
  pencil sat at ≈ 0. Cheap and decisive.
- Build a contact sheet of every crop and **look at it** before spending time downstream.

## 2. Vectorizing without potrace

1. Gaussian-blur the alpha, then `skimage.measure.find_contours(a, 0.5)` — marching
   squares gives subpixel closed contours for free.
2. Resample the contour to uniform arc-length spacing; smooth it as a *closed* signal
   (wrap the ends before convolving).
3. **Corner detection:** turning angle between the vectors to `i-k` and `i+k` over an
   arc window, threshold ~65°, then non-maximum suppression within the window.
4. **Fit cubics between corners** with Schneider's algorithm (Graphics Gems):
   chord-length parameterize → least-squares control points → Newton-Raphson
   reparameterization → recursive split at the max-error point.
5. At *non-corner* break points, use the central-difference tangent on both sides of the
   join. That buys G1 continuity with no extra work.
6. If a closed contour has fewer than 2 corners (an `o`), insert 4 breakpoints at equal
   arc length.

**Tuning is the whole game.** Smoothing sigma and error tolerance decide whether you
trace the letterform or the pencil grain. A first pass produced 3306 segments chasing
grain; raising sigma 1.2→2.0 and tolerance 0.30→0.9 px gave 1042 segments and a *better*
result. Always render the fitted outline over the source bitmap with node dots and look.

## 3. The compound-path fill-rule trap

`matplotlib.path.Path.contains_points` on a **compound** path ORs the subpaths instead of
applying the non-zero winding rule, so counters fill in. This silently corrupts any
stroke-width or margin measurement built on it.

Write a scanline rasterizer: flatten all contours to edges, per scanline find crossings
with their direction (+1/−1), sort by x, take the cumulative winding, fill spans where
winding ≠ 0. ~30 lines, and it matches what the font renderer will actually do.

## 4. Normalization — model the distortions, don't average them

A handwritten sheet carries **systematic** distortions. Find and remove each one:

- **Per-row baseline slope.** Robustly fit a line through the baseline-sitting glyphs
  (iteratively reject outliers); exclude descenders.
- **Size drift across a line.** Letters shrank **20.8%** left-to-right in one sample.
  Model it as *one shared log-slope in x with per-row intercepts*, fitted only on
  same-category comparisons (caps vs caps, x-height vs x-height). Independent per-row
  fits explode by extrapolation when a row has few reference glyphs.

### Anchor on the foot, never on a fitted baseline

Fitting a baseline from bbox bottoms lets the round letters that overshoot (`s`, `e`,
`o`) drag the line down, leaving every flat-footed letter floating — `u` by 85 units and
`N` by 104 on a 700-unit cap. Instead: measure each glyph's own foot, and rescale between
foot and top.

Overshoot, derived rather than guessed: estimate the local radius of curvature at the
lowest point from the ink width 2 units above it (`R ≈ w²/16`), then
`overshoot = clip(0.055·R, 0, 15)`. Flat stem feet get ~0; large round bottoms get 12–15.

**Know when a heuristic doesn't apply.** Glyphs whose stroke passes below the baseline
(`f g j p q y Q`) have no measurable foot — the "widest row" bowl detector misread `y` and
`g` badly enough to scale them 0.6×. Give those the *median transform of their case group*
instead.

### Two scaling bugs worth memorizing

- **Never write `scale = ideal ** blend`** when `ideal` is in pixel units. The
  exponent-blend trick only behaves when the ratio is near 1. Normalize against the
  median first: `s = ref * (ideal/ref) ** blend`. Getting this wrong left digits 20% short.
- Some cross-category relationships are **not identifiable** from the data. If no row
  contains both capitals and x-height letters, within-row comparison can never fix the
  cap-to-x-height ratio. Make an explicit design decision, state it, and verify visually.

## 5. Stroke weight — every geometric edit changes it

Uniform scaling scales the pen with the letter. Non-uniform scaling (narrowing) thins
only the near-vertical strokes. **Re-measure and re-offset after every edit.**

- **Measure:** distance transform of the ink mask, sample at skeleton pixels
  (`skimage.morphology.skeletonize`), median × 2. Drop the bottom ~15th percentile to
  avoid junction artifacts.
- **Correct:** rasterize → signed distance field (`edt(inside) − edt(outside)`) →
  re-threshold at the desired offset → re-trace. Build the alpha as
  `clip(sdf + delta + 0.5, 0, 1)` so the tracer's 0.5 level lands exactly on the offset
  boundary.
- **Run it closed-loop.** Measurement is resolution-dependent, so apply half the residual,
  re-measure, repeat. Open-loop overshoots. Two or three passes converge from ~16% spread
  to ~4%.
- Offsetting moves every outline outward, including the feet. Record the foot position
  before dilating and shift it back afterward.

If a request scales one case relative to the other, restore the pen width afterward — a
real pen does not get thinner when the letters get smaller, and skipping this makes the
smaller case read visibly lighter.

## 6. Spacing and kerning

- **Optical sidebearings:** for each glyph compute the left/right whitespace depth per
  scanline over its band, then blend `0.45 × minimum + 0.55 × depth-capped mean`. Mean
  alone lets open diagonals (`v w y`) pull neighbours in; min alone ignores overall colour.
- **Auto-kern** on the same blended "fit" measured across the pair, against the median fit
  as reference — then **hard-clamp so the closest approach never drops below a floor**.
  Without that clamp the first attempt saturated at ±130 units and `nnnnn` collided.
- **Figures:** give them extra sidebearing (~26 units) and **disable digit-to-digit
  kerning entirely**. The kerner treats their flat sides as loose and cramps number runs.

## 7. Compiling (fontTools)

- `FontBuilder`; `Cu2QuPen` for cubic→quadratic TTF, `T2CharStringPen` for CFF/OTF.
- **Winding:** TrueType wants outer contours clockwise in y-up. Compute nesting depth by
  point-in-polygon, then flip by signed area. Recompute this after *any* re-trace.
- **.notdef**: the inner rectangle must wind opposite the outer or it renders as a solid
  black box instead of a hollow one.
- **Assert** `head.yMin >= -OS/2.usWinDescent` and `head.yMax <= usWinAscent`, or glyphs
  clip in some renderers.
- Glyph order must be deduplicated against the real glyph dict, or `glyf` compilation
  fails on an opaque `assert len(glyphOrder) == len(glyphs)`.
- **Contextual alternates** kill the photocopied look of repeated letters. Three jittered
  variants (±1.5° rotation, ±1.5% scale, ±7 units vertical) cycled in one lookup:
  `sub @BASE @BASE' by @CV1; sub @CV1 @BASE' by @CV2; sub @CV2 @BASE' by @CV3; sub @CV3 @BASE' by @CV1;`
  Kern via glyph classes (`[a a.cv1 a.cv2 a.cv3]`) so variants inherit kerning without a
  pair explosion.

## 8. Verify by looking, every time

- Render specimens at multiple sizes after each stage, and **inspect the image**.
- Scale the diagnostic to the defect. A 15%-of-cap baseline float was invisible in a
  full-alphabet strip and obvious the moment the letters were drawn large against a
  ruled line. If a check looks clean, ask whether it could resolve the error you're hunting.
- **Absurd numbers mean the model is wrong, not the constant.** A 0.6× scale factor, every
  glyph pinned to a clamp, kerns saturating at the limit — don't tune the clamp, fix the
  model underneath it.

## 9. Judgement calls

- When a letterform genuinely hurts legibility (a cursive `o` with a crossing loop reads
  as `a`), source the replacement from the **writer's own other letters** — their capital
  `O` brought down to x-height, the clean upper half of their `j` for an `i`. Never invent
  a form.
- **Say plainly what was borrowed and what was drawn.** Track it; it matters to the user.
- Missing characters (digits, `& @ # %`): ask for a second sheet rather than fabricating.
  Simple geometric marks (hyphen, dashes, period from the i-dot) can be derived from the
  measured pen width; letterform-like glyphs cannot.
- Lengthen a drawn dash into en/em by **stretching the middle** (repeat the centre column
  in the raster, then re-trace), not by scaling — scaling distorts the pen terminals.