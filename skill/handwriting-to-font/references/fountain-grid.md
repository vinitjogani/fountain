# The Fountain sheet

If the handwriting sample was written on a **Fountain sheet** (printed from
https://github.com/vinitjogani/fountain, `fountain-grid-letter.pdf` or `fountain-grid-a4.pdf`),
the expected character sequence is already known. Use it instead of guessing from the ink.
The exact same data is shipped as `fountain-grid-layout.json` next to the PDFs.

## What is on the page

- **Two sheets.** Sheet 1: letters and numbers. Sheet 2: punctuation and symbols, then a
  ruled free-writing area ("Now write a sentence you love.").
- **7 columns.** Cells are filled left to right, top to bottom, in the order below.
  The last cell of sheet 1 (row 9, column 7) is intentionally empty and is hatched.
- **Four fiducials**: black rings (6 mm outer, 2 mm white centre) at the four corners of the
  content area, i.e. at the corners of the 12 mm page margin. Use them to correct perspective
  before segmenting. They are the only black printed marks on the page.
- **Everything else the printer draws is light teal** (`#8ccfcb` lines, `#6fb9b4` labels), so
  ink separates cleanly by luminance or by hue. The label in each cell's top-left corner is
  the printed reference character, not ink. Drop it: it is small, teal, and hugs the corner.
- **Guides inside each cell**, as a fraction of the cell height from the top:
  `cap` 0.20 (dotted), `x-height` 0.46 (dashed), `baseline` 0.76 (solid). Descenders hang in
  the remaining 24 percent. These give you the writer's intended cap, x and base positions,
  which the normalization stage in SKILL.md can use as priors (still measure each foot).

## Character order

Sheet 1 (9 rows of 7):

```
ABCDEFG
HIJKLMN
OPQRSTU
VWXYZab
cdefghi
jklmnop
qrstuvw
xyz0123
456789  (7th cell empty)
```

Sheet 2 (5 rows of 7):

```
.,;:!?'
"-_()[]
{}&@#$%
+=/\*<>
~^|`€£♥
```

## Working with it

1. Find the four rings, warp the page to a rectangle, then divide the grid region into
   7 × rows equal cells (grid outer border is the teal 0.4 mm rectangle under the header).
2. Segment ink inside each cell. Assert the per-row count matches the rows above before
   going further; a blank cell means the writer skipped it, and you should ask rather than
   fabricate the glyph.
3. The free-writing lines on sheet 2 are for spacing: measure natural inter-letter gaps,
   word gaps and the rhythm of connected strokes there, and use them to sanity-check the
   optical sidebearings and kerning you derive.
4. Page sizes: US Letter 215.9 × 279.4 mm or A4 210 × 297 mm, printed at 100 percent.
   The layout is identical on both; only the whitespace around the grid differs.
