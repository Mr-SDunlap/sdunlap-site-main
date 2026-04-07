(() => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP ScrollTrigger not found.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const processSection = document.querySelector("#section_featured");
  const wrapper = document.querySelector(".process-wrapper");
  const cards = document.querySelectorAll(".process-card");
  const archivePin = document.querySelector(".archive-pin");

  if (!processSection || !wrapper || !cards.length) return;

  const totalScroll = (cards.length - 1) * 100; // Total percentage to move left

  gsap.to(wrapper, {
    xPercent: -totalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: processSection,
      start: "top top",
      end: `+=${cards.length * 100}%`, // Scroll distance based on number of cards
      pin: processSection, // pin the Process section itself
      pinSpacing: false,
      markers: true,
      scrub: 1,
      // snap: 1 / (cards.length - 1), // Optional: snap to each card
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Animate content slightly for parallax feel
  cards.forEach((card, i) => {
    const h2 = card.querySelector("h2");
    const p = card.querySelector("p");
    const num = card.querySelector(".process-number");

    if (h2) {
      gsap.from(h2, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: card,
          containerAnimation: gsap.getById("processTween"), // Note: need to assign ID if using containerAnimation, simplified below
          start: "left center",
          toggleActions: "play reverse play reverse",
          pinSpacing: false,
        },
      });
    }
  });
})();
