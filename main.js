(function () {
  "use strict";

  // Floating letters rising out of the fountain, set in the handwriting font.
  var host = document.getElementById("letters");
  if (host) {
    var pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&?!";
    var count = window.matchMedia("(max-width: 900px)").matches ? 9 : 14;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.textContent = pool[Math.floor(Math.random() * pool.length)];
      s.style.left = (18 + Math.random() * 64) + "%";
      s.style.setProperty("--dur", (9 + Math.random() * 7).toFixed(1) + "s");
      s.style.setProperty("--delay", (-Math.random() * 14).toFixed(1) + "s");
      s.style.setProperty("--sway", ((Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 30)).toFixed(0) + "px");
      var scale = 0.75 + Math.random() * 0.6;
      s.style.width = s.style.height = Math.round(46 * scale) + "px";
      s.style.fontSize = Math.round(26 * scale) + "px";
      host.appendChild(s);
    }
  }

  // Reveal sections softly as they scroll into view.
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, idx) {
      el.style.transitionDelay = (idx % 4) * 60 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // The playground: whatever you type shows up on ruled paper.
  var pen = document.getElementById("pen");
  var paper = document.getElementById("paper");
  var size = document.getElementById("size");
  function render() {
    if (!pen || !paper) return;
    paper.textContent = pen.value;
    var fs = parseInt(size.value, 10);
    paper.style.setProperty("--fs", fs + "px");
    paper.style.setProperty("--lh", Math.round(fs * 1.6) + "px");
  }
  if (pen) {
    pen.addEventListener("input", render);
    size.addEventListener("input", render);
    document.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        pen.value = c.textContent;
        render();
        pen.focus();
      });
    });
    render();
  }
})();
