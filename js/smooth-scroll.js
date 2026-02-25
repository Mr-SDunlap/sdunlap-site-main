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
      const { ScrollTrigger } = window.gsap;
      const scroller = document.documentElement;

      ScrollTrigger.scrollerProxy(scroller, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll ?? window.scrollY ?? scroller.scrollTop;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: scroller.style.transform ? "transform" : "fixed",
      });

      ScrollTrigger.defaults({ scroller });

      lenis.on("scroll", () => ScrollTrigger.update());
      ScrollTrigger.addEventListener("refresh", () => lenis.update());
      ScrollTrigger.refresh();
    }

    // Expose for debugging
    window.__lenis = lenis;
  } catch (err) {
    console.error("Failed to load Lenis smooth-scrolling:", err);
  }
})();
