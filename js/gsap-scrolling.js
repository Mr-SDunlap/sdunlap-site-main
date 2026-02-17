// ScrollTrigger setup for section interactions
window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP ScrollTrigger not found. Check your CDN includes.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Common Section References
  const aboutSection = document.querySelector("#section_about");
  const portfolioSection = document.querySelector("#section_files");

  // 1. Pin the project information (Portfolio)
  const projectContainer = document.querySelector(".project-information");

  if (projectContainer && portfolioSection) {
    ScrollTrigger.create({
      trigger: projectContainer,
      start: "top 10%",
      endTrigger: portfolioSection,
      end: "bottom 50%", // Keep original timing
      pin: true,
      anticipatePin: 1,
      pinSpacing: false,
    });
  }

  // 2. Pin the section title (About)
  const aboutTitle = document.querySelector("#section_about .about-title");

  if (aboutTitle && aboutSection) {
    ScrollTrigger.create({
      trigger: aboutTitle,
      start: "top 60px",
      endTrigger: aboutSection,
      end: "bottom bottom",
      pin: true,
      pinSpacing: false,
    });
  }

  // 3. Pin the profile section (About)
  const profileSection = document.querySelector(".profile-container");

  if (profileSection && aboutSection) {
    ScrollTrigger.create({
      trigger: profileSection,
      start: "top 160px",
      endTrigger: aboutSection,
      end: "bottom bottom",
      pin: true,
      pinSpacing: false,
    });
  }
});
