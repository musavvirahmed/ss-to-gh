/**
 * Visit counter — GoatCounter site musavvir-info (ADR-0010).
 * Commit-edited Publish-tree wrapper; not Site content / Sveltia.
 * Counts only on Canonical hostname musavvir.info; skips /admin.
 */
(function () {
  if (location.hostname !== "musavvir.info") return;
  if (location.pathname === "/admin" || location.pathname.startsWith("/admin/")) {
    return;
  }

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = "https://musavvir-info.goatcounter.com/count";
  document.head.appendChild(s);
})();
