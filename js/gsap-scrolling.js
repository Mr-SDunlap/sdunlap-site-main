gsap.registerPlugin(ScrollTrigger);

// Large message scroll animation ////////////////////////////////////////////////
const landingTitle = document.querySelector(".landing-title");
if (landingTitle) {
  gsap.to(landingTitle, {
    opacity: 0,
    y: 150,
    ease: "none",
    scrollTrigger: {
      trigger: "#section_landing",
      start: "top top",
      end: "+=500",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}
// Large message scroll animation end ////////////////////////////////////////////////

const header = document.querySelector(".name-header-container");
const landing = document.querySelector(".landing-container");

if (header && landing) {
  const getDeltaX = () =>
    landing.getBoundingClientRect().left - header.getBoundingClientRect().left;

  const headerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: header,
      start: "-70px",
      endTrigger: "#section_about",
      end: "50% top",
      scrub: true,
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    },
  });

  headerTimeline
    .to(header, {
      x: () => getDeltaX(),
      ease: "none",
      duration: 0.1,
    })
    .to(header, {
      ease: "none",
      duration: 0.7,
    });
}
// About section animations ////////////////////////////////////////////////
const aboutSection = document.querySelector("#section_about");
const aboutSummary = document.querySelector(".about-summary");
const aboutSummaryPara = document.querySelector(".about-summary p");

if (aboutSummaryPara) {
  gsap.set(aboutSummaryPara, { opacity: 0, y: 24 });
  gsap.to(aboutSummaryPara, {
    opacity: 1,
    y: 0,
    ease: "none",
    scrollTrigger: {
      trigger: aboutSummary,
      start: "top 10%",
      end: "top",
      toggleActions: "play none none reverse",
      markers: true,
      invalidateOnRefresh: true,
    },
  });
}

const aboutTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: aboutSummary,
    start: "top 180px",
    endTrigger: aboutSection,
    end: "bottom 50%",
    pin: true,
    pinSpacing: false,
    scrub: true,
    invalidateOnRefresh: true,
  },
});
