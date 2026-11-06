/*
 * Cookie-Einwilligung für digitalwechsel.de
 * - Notwendig: immer aktiv (z. B. Speichern dieser Auswahl).
 * - Statistik: nur nach Einwilligung. Ein Statistik-Dienst wird später hier angebunden:
 *   window.addEventListener('dw-consent', e => { if (e.detail.statistik) { ... } })
 * Die Auswahl liegt im localStorage unter "dw-consent" und kann jederzeit über
 * einen Link mit dem Attribut data-consent-open geändert werden.
 */
(function () {
  var KEY = "dw-consent", VERSION = 1;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && v.version === VERSION ? v : null;
    } catch (e) { return null; }
  }
  function save(statistik) {
    var v = { version: VERSION, notwendig: true, statistik: !!statistik, datum: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    window.dwConsent = v;
    window.dispatchEvent(new CustomEvent("dw-consent", { detail: v }));
    close();
  }

  var css = "" +
    ".cc{position:fixed;left:20px;right:20px;bottom:20px;z-index:100;display:flex;justify-content:center;pointer-events:none}" +
    ".cc-box{pointer-events:auto;width:100%;max-width:760px;background:#fff;color:#3c4a5a;border:1px solid #e3e8ee;border-radius:16px;box-shadow:0 24px 60px rgba(11,29,48,.28);padding:24px 26px;font:15px/1.55 Inter,system-ui,sans-serif}" +
    ".cc h2{font:800 19px Jakarta,Inter,sans-serif;color:#0B1D30;margin:0 0 6px;display:flex;align-items:center;gap:10px}" +
    ".cc p{margin:0;font-size:14.5px}" +
    ".cc a{color:#0B6F64;text-decoration:underline}" +
    ".cc-host{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font:600 13px Inter,sans-serif;color:#0B6F64;background:#e3f7f2;border-radius:20px;padding:4px 10px}" +
    ".cc-opts{margin:16px 0 0;border-top:1px solid #e3e8ee;padding-top:6px}" +
    ".cc-opts[hidden]{display:none}" +
    ".cc-opt{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eef2f5}" +
    ".cc-opt strong{display:block;color:#0B1D30;font:700 15px Jakarta,Inter,sans-serif}" +
    ".cc-opt span{font-size:13.5px;color:#64748b}" +
    ".cc-sw{position:relative;flex:none;width:44px;height:24px;margin-top:2px}" +
    ".cc-sw input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}" +
    ".cc-sw i{position:absolute;inset:0;border-radius:24px;background:#cfd7df;transition:.15s}" +
    ".cc-sw i:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.15s}" +
    ".cc-sw input:checked+i{background:#0E8A7A}" +
    ".cc-sw input:checked+i:after{left:23px}" +
    ".cc-sw input:disabled+i{opacity:.55}" +
    ".cc-sw input:focus-visible+i{outline:2px solid #0E8A7A;outline-offset:2px}" +
    ".cc-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}" +
    ".cc-btns button{flex:1 1 180px;cursor:pointer;font:700 14.5px Jakarta,Inter,sans-serif;border-radius:8px;padding:12px 16px;border:1.5px solid #0B1D30;background:#fff;color:#0B1D30}" +
    ".cc-btns button.pri{background:#0B1D30;color:#fff}" +
    ".cc-btns button:hover{opacity:.9}" +
    "@media (max-width:560px){.cc{left:10px;right:10px;bottom:10px}.cc-box{padding:20px 18px}}";

  var root = null;
  function build() {
    if (root) return root;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    root = document.createElement("div");
    root.className = "cc";
    root.innerHTML =
      '<div class="cc-box" role="dialog" aria-modal="false" aria-labelledby="cc-t">' +
      '<h2 id="cc-t">Cookies &amp; Datenschutz</h2>' +
      '<p>Wir verwenden nur, was für den Betrieb der Website nötig ist. Optionale Statistik setzen wir nur mit Ihrer Einwilligung ein. Ihre Auswahl können Sie jederzeit unter „Cookie-Einstellungen“ im Fußbereich ändern. Mehr in der <a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
      '<span class="cc-host">🇩🇪 Gehostet in Deutschland</span>' +
      '<div class="cc-opts" id="cc-opts" hidden>' +
      '<div class="cc-opt"><div><strong>Notwendig</strong><span>Grundfunktionen der Website, z. B. das Speichern dieser Auswahl. Immer aktiv.</span></div><label class="cc-sw" title="Immer aktiv"><input type="checkbox" checked disabled aria-label="Notwendig, immer aktiv"><i></i></label></div>' +
      '<div class="cc-opt"><div><strong>Statistik</strong><span>Hilft uns zu verstehen, wie die Website genutzt wird. Nur mit Ihrer Einwilligung.</span></div><label class="cc-sw"><input type="checkbox" id="cc-stat" aria-label="Statistik erlauben"><i></i></label></div>' +
      '</div>' +
      '<div class="cc-btns">' +
      '<button type="button" data-cc="necessary">Nur notwendige</button>' +
      '<button type="button" data-cc="settings" id="cc-set">Einstellungen</button>' +
      '<button type="button" data-cc="all" class="pri">Alle akzeptieren</button>' +
      '</div></div>';
    document.body.appendChild(root);
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cc]"); if (!b) return;
      var a = b.getAttribute("data-cc"), opts = root.querySelector("#cc-opts");
      if (a === "necessary") save(false);
      else if (a === "all") save(true);
      else if (a === "settings") {
        if (opts.hidden) { opts.hidden = false; b.textContent = "Auswahl speichern"; }
        else save(root.querySelector("#cc-stat").checked);
      }
    });
    return root;
  }
  function open(showSettings) {
    var r = build(), cur = read();
    r.style.display = "";
    r.querySelector("#cc-stat").checked = !!(cur && cur.statistik);
    var opts = r.querySelector("#cc-opts"), set = r.querySelector("#cc-set");
    opts.hidden = !showSettings;
    set.textContent = showSettings ? "Auswahl speichern" : "Einstellungen";
    r.querySelector("button").focus({ preventScroll: true });
  }
  function close() { if (root) root.style.display = "none"; }

  window.dwConsent = read();
  document.addEventListener("click", function (e) {
    var l = e.target.closest("[data-consent-open]");
    if (l) { e.preventDefault(); open(true); }
  });
  function init() { if (!window.dwConsent) open(false); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
