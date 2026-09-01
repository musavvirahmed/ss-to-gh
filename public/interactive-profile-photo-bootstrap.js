/**
 * Homepage wire-up for tier-C interactive profile photo (#38).
 * Static img paints first; module loads after idle on eligible desktops only.
 */
const slot = document.querySelector("[data-profile-photo-slot]");
if (!slot) {
  // 404 and other routes — no slot, no fetch.
} else if (
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  window.matchMedia("(pointer: fine)").matches
) {
  const boot = () => {
    import("./interactive-profile-photo.js")
      .then(({ initInteractiveProfilePhoto }) => initInteractiveProfilePhoto(slot))
      .catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(boot, { timeout: 2000 });
  } else {
    setTimeout(boot, 1);
  }
}
