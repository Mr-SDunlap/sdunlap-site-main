// GSAP initialization: simple entrance animation
// Requires GSAP loaded before this script (we add a CDN in index.html)

window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") {
    console.warn("GSAP not found. Make sure the CDN is loaded.");
    return;
  }
});
