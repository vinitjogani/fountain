(function () {
  "use strict";

  // The sample grid on the kit card: one dashed box per glyph, in the handwriting.
  var grid = document.getElementById("sheet-grid");
  if (grid) {
    var cols = 8;
    var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?".split("");
    var count = Math.ceil(26 / cols) * cols;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var cell = document.createElement("span");
      cell.textContent = glyphs[i];
      frag.appendChild(cell);
    }
    grid.appendChild(frag);
  }

  // The specimen line is editable, so the page doubles as a quick try-it.
  var specimen = document.getElementById("specimen");
  if (specimen) {
    // plaintext-only keeps pasted markup out of the line; not every engine supports it.
    try { specimen.setAttribute("contenteditable", "plaintext-only"); } catch (e) { /* keep true */ }
    specimen.addEventListener("paste", function (e) {
      if (specimen.getAttribute("contenteditable") === "plaintext-only") return;
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text");
      document.execCommand("insertText", false, text.replace(/\s+/g, " "));
    });
    specimen.addEventListener("keydown", function (e) {
      if (e.key === "Escape") specimen.blur();
    });
  }

  // Sections fade up as they come into view.
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
