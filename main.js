(function () {
  "use strict";

  // Floating letters rising out of the fountain, set in the handwriting font.
  var host = document.getElementById("letters");
  if (host) {
    var pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&?!";
    var count = window.matchMedia("(max-width: 900px)").matches ? 8 : 12;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.textContent = pool[Math.floor(Math.random() * pool.length)];
      s.style.left = (14 + Math.random() * 72) + "%";
      s.style.setProperty("--dur", (11 + Math.random() * 8).toFixed(1) + "s");
      s.style.setProperty("--delay", (-Math.random() * 18).toFixed(1) + "s");
      s.style.setProperty("--sway", ((Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 50)).toFixed(0) + "px");
      s.style.setProperty("--tilt", ((Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 14)).toFixed(0) + "deg");
      s.style.fontSize = Math.round(22 + Math.random() * 18) + "px";
      s.style.opacity = "0";
      host.appendChild(s);
    }
  }

  // Size the flourish's dash to its real length so it draws itself end to end.
  var flourish = document.querySelector(".flourish");
  var flourishPath = document.getElementById("flourishPath");
  if (flourish && flourishPath && flourishPath.getTotalLength) {
    var len = Math.ceil(flourishPath.getTotalLength());
    flourish.style.setProperty("--len", len);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      // Both the line and the pen animate on the SVG document timeline, so they stay in step.
      var SVG = "http://www.w3.org/2000/svg";
      function smil(target, attr, values, keyTimes) {
        var a = document.createElementNS(SVG, "animate");
        a.setAttribute("attributeName", attr);
        a.setAttribute("values", values);
        a.setAttribute("keyTimes", keyTimes);
        a.setAttribute("dur", "9s");
        a.setAttribute("calcMode", "linear");
        a.setAttribute("repeatCount", "indefinite");
        target.appendChild(a);
      }
      smil(flourish, "stroke-dashoffset", len + ";0;0;0;" + len, "0;0.55;0.8;0.92;1");
      smil(flourish, "opacity", "0.9;0.9;0.9;0;0", "0;0.55;0.8;0.92;1");
      var hand = document.querySelector(".nib-hand");
      if (hand) smil(hand, "opacity", "1;1;0;0", "0;0.55;0.68;1");
    } else {
      flourish.style.strokeDashoffset = "0";
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
