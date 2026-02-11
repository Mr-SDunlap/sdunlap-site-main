// ScrollTrigger setup for section interactions
window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP ScrollTrigger not found. Check your CDN includes.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Pin the banner during the scroll through the about section
  const banner = document.querySelector(".animated-banner");
  const aboutSection = document.querySelector("#section_about");

  if (!banner || !aboutSection) return;

  ScrollTrigger.create({
    trigger: banner,
    start: "top top",
    endTrigger: aboutSection,
    end: "bottom bottom",
    pin: true,
    anticipatePin: 1,
    pinSpacing: false,
  });

  //Pin the section title during scroll through the section
  const aboutTitle = document.querySelector("#section_about .about-title");
  if (!aboutTitle) return;

  ScrollTrigger.create({
    trigger: aboutTitle,
    start: "top 60px",
    endTrigger: aboutSection,
    end: "bottom bottom",
    pin: true,
    pinSpacing: false,
  });

  //Pin the profile section during scroll through the section
  const profileSection = document.querySelector(".profile-container");
  if (!profileSection) return;

  ScrollTrigger.create({
    trigger: profileSection,
    start: "top 160px",
    endTrigger: aboutSection,
    end: "bottom bottom",
    pin: true,
    pinSpacing: false,
  });
});
