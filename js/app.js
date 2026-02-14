const randomBetween = (min, max) => Math.random() * (max - min) + min;

const initBackgroundRain = () => {
  const lines = document.querySelectorAll(".background-lines span");
  if (!lines.length) return;

  lines.forEach((span, index) => {
    const duration = randomBetween(6, 12);
    const offset = randomBetween(0, duration);
    const stagger = randomBetween(0.08, 0.25) * index;
    const delay = -(offset + stagger);

    span.style.setProperty("--rain-duration", `${duration.toFixed(2)}s`);
    span.style.setProperty("--rain-delay", `${delay.toFixed(2)}s`);
    span.style.setProperty("--rain-anim", "rain");
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReduced) {
    initBackgroundRain();
  }
});
