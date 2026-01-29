// Animate the .work-bullets height with GSAP when a top-level journey item is clicked.
window.addEventListener("DOMContentLoaded", () => {
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
