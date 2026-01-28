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
      start: "-150px",
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
// Home image pinning //////////////////////////////////////////////////////
const homeImage = document.querySelector(".photo-container");
if (homeImage) {
  gsap.timeline({
    scrollTrigger: {
      trigger: homeImage,
      start: "top 100px",
      endTrigger: "#section_about",
      end: "50% top",
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    },
  });
}

// About section animations ////////////////////////////////////////////////
const aboutSection = document.querySelector("#section_about");
const aboutSummary = document.querySelector(".about-summary");
const aboutSummaryPara = document.querySelector(".about-summary p");

if (aboutSummaryPara) {
  gsap.set(aboutSummaryPara, { opacity: 0, y: -30 });
  gsap.to(aboutSummaryPara, {
    opacity: 1,
    y: -50,
    ease: "none",
    scrollTrigger: {
      trigger: aboutSummary,
      start: "top 31%",
      end: "top",
      toggleActions: "play none none reverse",
      invalidateOnRefresh: true,
    },
  });
}

const aboutTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: aboutSummary,
    start: "top 30%",
    endTrigger: aboutSection,
    end: "bottom 50%",
    pin: true,
    pinSpacing: false,
    scrub: true,
    invalidateOnRefresh: true,
  },
});
