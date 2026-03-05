gsap.registerPlugin(ScrollTrigger);

// Pin the archive and expand its background on scroll
window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);

  const archivePin = document.querySelector(".archive-pin");
  const archiveBg = document.querySelector(".archive-background");
  const contentContainer = document.querySelector(".content-container");
  const archiveSection = document.querySelector("#section_files");

  if (!archivePin || !archiveBg || !contentContainer || !archiveSection) return;

  // Compute how long to keep the archive pinned.
  // We replace the previous fixed +100vh with a value based on actual content.
  // Measure how much of the .content-container exceeds the viewport height
  const getContentOverflow = () => {
    if (!contentContainer) return 0;
    const visible = window.innerHeight || archivePin.clientHeight || 0;
    const total =
      contentContainer.scrollHeight || contentContainer.offsetHeight || 0;
    return Math.max(0, total - visible);
  };

  const computeArchiveHold = () => {
    const viewport = window.innerHeight || 0;
    // Hold for at least one viewport, but extend by actual container overflow
    return Math.max(viewport, getContentOverflow());
  };

  // Build an inner timeline that the ScrollTrigger will drive.
  const innerTL = gsap.timeline();

  // Expand background early in the pinned sequence, then keep it full
  innerTL.fromTo(
    archiveBg,
    {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "50%",
      height: "50%",
      transform: "translate(-50%, -50%)",
    },
    {
      width: "100%",
      height: "100%",
      transform: "translate(-100%, -50%)",
      ease: "power2.out",
      duration: 0.1,
    },
    0,
  );

  // While the archive is pinned, scroll the .content-container upward
  if (contentContainer) {
    innerTL.to(
      contentContainer,
      {
        y: () => -getContentOverflow(),
        ease: "none",
        duration: 1,
      },
      "+=0.01",
    );
  }

  // Create the ScrollTrigger that pins the archive and scrubs innerTL
  const archiveST = ScrollTrigger.create({
    id: "archivePin",
    trigger: archivePin,
    start: "top top",
    end: () => `+=${computeArchiveHold()}`,
    pin: archivePin,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    animation: innerTL,
  });
  // Keep ScrollTrigger measurements accurate as content/viewport changes
  const resync = () => ScrollTrigger.refresh();
  window.addEventListener("load", () => resync(), { once: true });
  window.addEventListener("resize", () => resync());
});
