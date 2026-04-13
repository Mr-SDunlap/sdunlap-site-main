document.addEventListener("DOMContentLoaded", () => {
  // Fade-in-up animation for elements with the class "fade-in-up"
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    const els = gsap.utils.toArray(".fade-in-up");
    if (!els.length) return;
    els.forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  // Remove default anchor smooth-scroll on mobile to avoid double-smoothing
  // (CSS smooth + JS + GSAP can fight and cause stutter). We already set
  // `scroll-behavior: auto` in CSS, but some browsers may keep history-based
  // smooth scroll. This is a defensive no-op hook reserved for future use.
  // Intentionally empty.
});
