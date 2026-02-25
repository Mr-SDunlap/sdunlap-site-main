gsap.registerPlugin(ScrollTrigger);

// Pin the archive and expand its background on scroll
window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);

  const archivePin = document.querySelector(".archive-pin");
  const archiveBg = document.querySelector(".archive-background");
  const contentContainer = document.querySelector(".content-container");

  if (!archivePin || !archiveBg || !contentContainer) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      id: "archiveExpand",
      trigger: archivePin,
      start: "top top",
      endTrigger: contentContainer,
      end: "bottom bottom", // stay pinned until the content ends
      pin: archivePin,
      pinSpacing: false,
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
      ease: "power2.out",
      duration: 0.2,
    },
  );

  // Hold the pinned state for the remaining scroll until content ends
  tl.to({}, { duration: 1 });
});
