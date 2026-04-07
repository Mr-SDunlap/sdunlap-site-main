// Archive horizontal scroll with GSAP ScrollTrigger
// Pins the archive section and translates project cards horizontally
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      // GSAP is loaded via CDN in index.html; bail quietly if missing
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const section = document.querySelector("#section_files");
    const container = section && section.querySelector(".project-container");
    if (!section || !container) return;

    const build = () => {
      // Kill any existing instance so rebuilds are clean
      const existing =
        ScrollTrigger.getById && ScrollTrigger.getById("archive-horizontal");
      if (existing) existing.kill();

      if (container._archiveTween) {
        container._archiveTween.kill();
        container._archiveTween = null;
      }

      // Determine total horizontal distance to travel based on the
      // visible width of the scrolling container itself (not the section).
      // Using the section width can undercount when the container is narrower
      // than the section due to margins/centering, causing early unpinning
      // and cut-off cards on small viewports.
      const dist = Math.max(0, container.scrollWidth - container.clientWidth);
      if (dist < 2) return; // nothing to scroll

      container.style.willChange = "transform";

      container._archiveTween = gsap.to(container, {
        x: () => -(container.scrollWidth - container.clientWidth),
        ease: "none",
        overwrite: true,
        scrollTrigger: {
          id: "archive-horizontal",
          trigger: section,
          start: "top top",
          end: () => "+=" + (container.scrollWidth - container.clientWidth),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.25,
          invalidateOnRefresh: true,
        },
      });
    };

    // Initial build
    build();

    // Rebuild when projects are injected dynamically
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          build();
          if (window.ScrollTrigger && ScrollTrigger.refresh) {
            ScrollTrigger.refresh();
          }
          break;
        }
      }
    });
    mo.observe(container, { childList: true });

    // Refresh after load and on resize to catch asset/font reflow
    window.addEventListener("load", () => {
      build();
      if (window.ScrollTrigger && ScrollTrigger.refresh) {
        ScrollTrigger.refresh();
      }
    });
    window.addEventListener("resize", () => {
      if (window.ScrollTrigger && ScrollTrigger.refresh) {
        ScrollTrigger.refresh();
      }
    });
  }
})();
