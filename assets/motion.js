/*
 * Scroll-Effekte für digitalwechsel.de
 * - Einstieg: Text im Kopfbereich gleitet herein, Titelbild zoomt sanft auf.
 * - Beim Scrollen: Abschnitte und Karten gleiten nacheinander herein,
 *   Projektbilder werden aufgedeckt, Screenshots bewegen sich in der Tiefe (Parallax).
 * - Fortschrittsbalken oben.
 * Wer „Bewegung reduzieren“ eingestellt hat, bekommt keine Effekte.
 * Im <head> ohne defer einbinden, damit nichts kurz aufblitzt.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var html = document.documentElement;
  html.classList.add("js-motion");

  var ease = "cubic-bezier(.2,.7,.2,1)";
  var css = "" +
    "@keyframes dwUp{from{opacity:0;translate:0 26px}to{opacity:1;translate:0 0}}" +
    "@keyframes dwZoom{from{scale:1.08}to{scale:1}}" +
    "@keyframes dwFade{from{opacity:0}to{opacity:1}}" +
    ".js-motion :is(.hero,.v-hero) .wrap>*{animation:dwUp .9s " + ease + " both}" +
    ".js-motion :is(.hero,.v-hero) .wrap>*:nth-child(2){animation-delay:.12s}" +
    ".js-motion :is(.hero,.v-hero) .wrap>*:nth-child(3){animation-delay:.24s}" +
    ".js-motion :is(.hero,.v-hero) .wrap>*:nth-child(n+4){animation-delay:.36s}" +
    ".js-motion .hero-side{overflow:hidden}" +
    ".js-motion .hero-side img{animation:dwZoom 1.6s " + ease + " both}" +
    ".js-motion .hero-badge{animation:dwUp .8s " + ease + " .5s both}" +
    ".rv{opacity:0;translate:0 32px;transition:opacity .8s " + ease + ",translate .8s " + ease + ";transition-delay:var(--d,0s)}" +
    ".rv.rv-l{translate:-48px 0}.rv.rv-r{translate:48px 0}" +
    ".rv.rv-pop{translate:0 0;scale:.6;rotate:-25deg;transition-property:opacity,scale,rotate;transition-duration:.9s}" +
    ".rv.rv-wipe{translate:0 0;clip-path:inset(0 100% 0 0 round 14px);transition-property:opacity,clip-path;transition-duration:1.2s}" +
    ".rv.in{opacity:1;translate:0 0;scale:1;rotate:0deg}" +
    ".rv.rv-wipe.in{clip-path:inset(0 0 0 0 round 14px)}" +
    ".dw-prog{position:fixed;top:0;left:0;height:3px;width:100%;background:#2FD3B5;transform-origin:0 50%;transform:scaleX(0);z-index:200;pointer-events:none}" +
    "[data-px]{will-change:translate}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var main = document.querySelector("main") || document.body;
    var items = [];
    function mark(el, extra, delay) {
      if (!el || el.classList.contains("rv")) return;
      el.classList.add("rv");
      if (extra) el.classList.add(extra);
      if (delay) el.style.setProperty("--d", delay + "s");
      items.push(el);
    }

    // Sonderfälle zuerst, damit sie nicht als normale Blöcke behandelt werden
    main.querySelectorAll(".proj-img, .trust-img").forEach(function (el) {
      mark(el, "rv-wipe");
      // Nach dem Aufdecken den Zuschnitt entfernen, sonst wird der Schatten abgeschnitten
      el.addEventListener("transitionend", function (e) { if (e.propertyName === "clip-path") el.style.clipPath = "none"; });
    });
    main.querySelectorAll(".sealband img").forEach(function (el) { mark(el, "rv-pop"); });
    main.querySelectorAll(".flag-text").forEach(function (el) { mark(el, "rv-l"); });
    main.querySelectorAll(".flag-shots").forEach(function (el) { mark(el, "rv-r", 0.15); });

    // Abschnitte nach dem Kopfbereich: Raster werden Karte für Karte aufgedeckt
    var sections = main.querySelectorAll("section");
    sections.forEach(function (sec, i) {
      if (i === 0 && sec.matches(".hero, .v-hero")) return;
      if (sec.matches(".hero, .v-hero")) return;
      var wrap = sec.querySelector(".wrap") || sec;
      walk(wrap, 0);
    });

    function walk(parent, depth) {
      Array.prototype.forEach.call(parent.children, function (el) {
        if (el.classList.contains("rv") || el.matches("script, style, [hidden]")) return;
        if (el.querySelector(".rv")) { walk(el, depth + 1); return; }
        var cs = getComputedStyle(el);
        var kids = Array.prototype.filter.call(el.children, function (k) { return !k.matches("script, style"); });
        var isGrid = (cs.display === "grid" || cs.display === "flex") && kids.length >= 3 && depth < 3 && !el.matches("form, form *, #dc, #tform, .slots, .days, .opts");
        if (isGrid) kids.forEach(function (k, j) { mark(k, null, Math.min(j, 7) * 0.08); });
        else mark(el);
      });
    }

    // Aufdecken, sobald ein Element in den unteren Bildschirmrand kommt.
    // Bewusst per Position statt IntersectionObserver: so werden auch Elemente
    // aufgedeckt, über die man schnell hinweggescrollt ist.
    var pending = items.slice();
    function reveal(vh) {
      if (!pending.length) return;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.92) { el.classList.add("in"); return false; }
        return true;
      });
    }

    // Fortschrittsbalken und Parallax
    var bar = document.createElement("div");
    bar.className = "dw-prog";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var px = [];
    function addPx(sel, speed) {
      document.querySelectorAll(sel).forEach(function (el) { el.setAttribute("data-px", ""); px.push({ el: el, s: speed }); });
    }
    addPx(".hero-side img", "top");
    addPx(".shot--back", -0.06);
    addPx(".shot--front", 0.05);

    var ticking = false;
    function frame() {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ")";
      var vh = innerHeight;
      reveal(vh);
      px.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        // Titelbild: läuft langsamer als die Seite mit (Lücke oben liegt dann schon außerhalb)
        var off = p.s === "top" ? Math.max(scrollY, 0) * 0.3 : (r.top + r.height / 2 - vh / 2) * p.s;
        p.el.style.translate = "0 " + off.toFixed(1) + "px";
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    frame();
  });
})();
