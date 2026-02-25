(async () => {
  try {
    const { default: Lenis } =
      await import("https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.27/+esm");

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // If GSAP ScrollTrigger is present, keep it in sync
    if (window.gsap && window.gsap.ScrollTrigger) {
      lenis.on("scroll", () => window.gsap.ScrollTrigger.update());
      window.gsap.ScrollTrigger.addEventListener("refresh", () =>
        lenis.update(),
      );
      window.gsap.ScrollTrigger.refresh();
    }

    // Expose for debugging
    window.__lenis = lenis;
  } catch (err) {
    console.error("Failed to load Lenis smooth-scrolling:", err);
  }
})();
