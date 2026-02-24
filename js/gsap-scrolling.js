// ScrollTrigger setup for section interactions
window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP ScrollTrigger not found. Check your CDN includes.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
});
