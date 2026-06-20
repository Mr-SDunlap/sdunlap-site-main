(function () {
  "use strict";

  /* (lp-reveal-img is no longer used — GSAP drives all reveals) */

  /* ============================================================
     GSAP scroll animations
  ============================================================ */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    animateProgress();
    animateHero();
    animateIntro();
    animateProjects();
    animateOutcome();
    animateExplore();
  }

  /* Progress bar */
  function animateProgress() {
    gsap.to(".dp-progress-fill", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }

  /* Hero */
  function animateHero() {
    var content = document.querySelector(".lp-hero-content");
    if (content) {
      gsap.from(content.children, {
        y: 36,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        ease: "power2.out",
        delay: 0.2,
      });
    }

    /* Parallax on hero bg */
    gsap.to(".lp-hero-bg", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".lp-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    /* Fade hero content out as user scrolls */
    gsap.to(".lp-hero-content", {
      y: -70,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".lp-hero",
        start: "55% center",
        end: "bottom top",
        scrub: true,
      },
    });

    /* Scroll indicator fade */
    gsap.to(".lp-hero .scroll-indicator", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".lp-hero",
        start: "18% top",
        end: "36% top",
        scrub: true,
      },
    });
  }

  /* Intro */
  function animateIntro() {
    var statement = document.querySelector(".lp-intro-statement");
    if (statement) {
      gsap.from(statement, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: statement,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var metaItems = document.querySelectorAll(".lp-intro-meta");
    if (metaItems.length) {
      gsap.from(metaItems, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".lp-intro-meta-row",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }

  /* Project sections */
  function animateProjects() {
    var projects = document.querySelectorAll(".lp-project");
    projects.forEach(function (project) {
      /* Copy block */
      var copy = project.querySelector(".lp-project-copy");
      if (copy) {
        gsap.from(copy, {
          x: -40,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: copy,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* Tags stagger */
      var tags = project.querySelectorAll(".lp-tag");
      if (tags.length) {
        gsap.from(tags, {
          y: 12,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: project.querySelector(".lp-tags"),
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* Finder visuals stagger */
      var finderImgs = project.querySelectorAll(".lp-finder-img-main, .lp-finder-video-wrap");
      if (finderImgs.length) {
        gsap.from(finderImgs, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.18,
          ease: "power2.out",
          scrollTrigger: {
            trigger: project.querySelector(".lp-finder-visual"),
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });
      }

      /* Feature image (infographic) */
      var featureWrap = project.querySelector(".lp-infographic-feature");
      if (featureWrap) {
        gsap.from(featureWrap.querySelector("img"), {
          scale: 1.06,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featureWrap,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      /* Collage items stagger */
      var collageItems = project.querySelectorAll(".lp-collage-item");
      if (collageItems.length) {
        gsap.from(collageItems, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: project.querySelector(".lp-collage-grid"),
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* Device items stagger */
      var deviceItems = project.querySelectorAll(".lp-device-item");
      if (deviceItems.length) {
        gsap.from(deviceItems, {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: project.querySelector(".lp-device-stack"),
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* AI phone + video reveal */
      var aiVisuals = project.querySelectorAll(".lp-ai-phone, .lp-ai-video-wrap");
      if (aiVisuals.length) {
        gsap.from(aiVisuals, {
          y: 50,
          opacity: 0,
          duration: 0.95,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: project.querySelector(".lp-ai-visual"),
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });
      }

      /* Project number parallax */
      var num = project.querySelector(".lp-project-num");
      if (num) {
        gsap.to(num, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: project,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });
  }

  /* Outcome */
  function animateOutcome() {
    var section = document.querySelector(".lp-outcome");
    if (!section) return;

    var content = section.querySelector(".lp-outcome-content");
    if (content) {
      gsap.from(content.children, {
        y: 30,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: content,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var video = section.querySelector(".lp-outcome-video");
    if (video) {
      gsap.from(video, {
        scale: 1.08,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  }

  /* Explore */
  function animateExplore() {
    var cards = document.querySelectorAll(".dp-explore-card");
    if (!cards.length) return;

    gsap.from(cards, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".dp-explore",
        start: "top 84%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* ============================================================
     Boot
  ============================================================ */
  function init() {
    /* GSAP loads deferred — wait for it */
    if (typeof gsap !== "undefined") {
      initGSAP();
    } else {
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
          clearInterval(poll);
          initGSAP();
        } else if (attempts > 40) {
          clearInterval(poll);
        }
      }, 100);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
