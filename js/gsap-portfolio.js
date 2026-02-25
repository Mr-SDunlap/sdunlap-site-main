gsap.registerPlugin(ScrollTrigger);

// Pin the archive and expand its background on scroll
window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);

  const archivePin = document.querySelector(".archive-pin");
  const archiveBg = document.querySelector(".archive-background");

  if (!archivePin || !archiveBg) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: archivePin,
      start: "top top",
      end: "+=100%", // adjust to taste
      pin: archivePin,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(
    archiveBg,
    { width: "50vw", height: "50vh" },
    {
      width: "100vw",
      height: "100vh",
      maxWidth: "none",
      maxHeight: "none",
      ease: "power2.out",
    },
  );
});
