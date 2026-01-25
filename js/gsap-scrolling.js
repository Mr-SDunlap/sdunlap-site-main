// Fade the landing title down and out while scrolling
window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);

  const title = document.querySelector(".landing-title h1");
  if (!title) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // delay in milliseconds before the ScrollTrigger is created
  const initDelay = 0; // adjust this value to delay the start (ms)

  setTimeout(() => {
    gsap.to(title, {
      opacity: 0,
      y: 150,
      ease: "none",
      scrollTrigger: {
        trigger: "#section_landing",
        start: "top top",
        end: "+=300",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }, initDelay);
});

// Scroll triggered name animation to about section
