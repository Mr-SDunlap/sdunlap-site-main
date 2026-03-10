document.addEventListener("DOMContentLoaded", () => {
  //Fade in and up animation for element with the class "fade-in-up"
  const fadeInUp = document.querySelectorAll(".fade-in-up");

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(fadeInUp, {
      autoAlpha: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: fadeInUp,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }

  //New code will go under this line
});
