const randomBetween = (min, max) => Math.random() * (max - min) + min;

const initBackgroundRain = () => {
  const lines = document.querySelectorAll(".background-lines span");
  if (!lines.length) return;

  lines.forEach((span, index) => {
    const duration = randomBetween(6, 12);
    const offset = randomBetween(0, duration);
    const delay = -(offset + index * 0.35);

    span.style.setProperty("--rain-duration", `${duration.toFixed(2)}s`);
    span.style.setProperty("--rain-delay", `${delay.toFixed(2)}s`);
    span.style.setProperty("--rain-anim", "rain");
  });
};

// Animate the .work-bullets height with GSAP when a top-level journey item is clicked.
window.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReduced) {
    initBackgroundRain();
  }

  if (!window.gsap) return;

  document.querySelectorAll(".journey .experience > li").forEach((item) => {
    const bullets = item.querySelector(".work-bullets");
    if (!bullets) return;

    item.addEventListener("click", () => {
      const isOpen = bullets.classList.contains("is-active");

      if (isOpen) {
        gsap.to(bullets, {
          height: 0,
          duration: 0.35,
          ease: "power2.inOut",
          onComplete: () => {
            bullets.classList.remove("is-active");
            item.classList.remove("is-active");
          },
        });
        return;
      }

      bullets.classList.add("is-active");
      item.classList.add("is-active");
      gsap.fromTo(
        bullets,
        { height: 0 },
        { height: "auto", duration: 0.35, ease: "power2.inOut" }
      );
    });
  });
});
