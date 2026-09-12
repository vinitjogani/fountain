/*
 * Fountain handwriting sheet — layout data.
 * Single source of truth for the printable page (grid/index.html),
 * the layout manifest (downloads/fountain-grid-layout.json) and the
 * skill reference (skill/handwriting-to-font/references/fountain-grid.md).
 * Plain script: works in a browser (window.FountainLayout) and in Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FountainLayout = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    version: 1,
    name: "Fountain handwriting sheet",
    units: "mm",
    pageSizes: { letter: { width: 215.9, height: 279.4 }, a4: { width: 210, height: 297 } },
    margin: 12,
    columns: 7,
    // Everything the printer puts on the page uses this colour so ink can be
    // separated by luminance or by colour (printed marks are cyan-ish, ink is not).
    printColor: "#8ccfcb",
    labelColor: "#6fb9b4",
    fiducial: { shape: "ring", outerDiameter: 6, innerDiameter: 2, color: "#000000",
      note: "One at each corner of the content area (page margin corners)." },
    cell: {
      // Guide lines as a fraction of the cell height, measured from the cell top.
      guides: { cap: 0.2, xHeight: 0.46, baseline: 0.76 },
      guideStyles: { cap: "dotted", xHeight: "dashed", baseline: "solid" },
      label: { position: "top-left", font: "sans-serif", note: "Printed reference character; not ink." }
    },
    pages: [
      {
        title: "Letters and numbers",
        rows: ["ABCDEFG", "HIJKLMN", "OPQRSTU", "VWXYZab", "cdefghi", "jklmnop", "qrstuvw", "xyz0123", "456789"],
        note: "Rows are filled left to right, top to bottom. The last cell of the last row is intentionally empty."
      },
      {
        title: "Punctuation and symbols",
        rows: [".,;:!?'", "\"-_()[]", "{}&@#$%", "+=/\\*<>", "~^|`€£♥"],
        sentenceArea: {
          lines: 3,
          prompt: "Now write a sentence you love.",
          note: "Free writing on ruled lines. Use it to measure natural letter spacing, word spacing and rhythm."
        }
      }
    ]
  };
});
