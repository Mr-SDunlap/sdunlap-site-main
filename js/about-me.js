(function () {
  "use strict";

  /* ============================================================
     GSAP scroll animations
  ============================================================ */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    animateProgress();
    animateHero();
    animateJourney();
    animateCarousels();
    animateOutcome();
    animateExplore();
  }

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

  function animateHero() {
    var content = document.querySelector(".am-hero-content");
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

    gsap.to(".am-hero-content", {
      y: -70,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".am-hero",
        start: "55% center",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".am-hero .scroll-indicator", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".am-hero",
        start: "18% top",
        end: "36% top",
        scrub: true,
      },
    });
  }

  /* Journey: narrative block reveals + sticky-panel dot sync */
  function animateJourney() {
    var blocks = document.querySelectorAll("#am-journey .about-narrative-block");
    var dots = document.querySelectorAll("#am-journey .about-dot");
    if (!blocks.length) return;

    function syncDots(index) {
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === index);
      });
    }

    blocks.forEach(function (block, i) {
      var inner = block.querySelector(".block-inner");
      if (inner) {
        gsap.from(inner, {
          opacity: 0,
          y: 30,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (dots.length) {
        ScrollTrigger.create({
          trigger: block,
          start: "top 52%",
          end: "bottom 52%",
          onEnter: function () {
            syncDots(i);
          },
          onEnterBack: function () {
            syncDots(i);
          },
        });
      }
    });
  }

  /* Carousel sections: heading + cards fade in on scroll */
  function animateCarousels() {
    document.querySelectorAll(".am-carousel-section").forEach(function (section) {
      var head = section.querySelector(".am-carousel-head");
      if (head) {
        gsap.from(head.children, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      var cards = section.querySelectorAll(".am-carousel-card");
      if (cards.length) {
        gsap.from(cards, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section.querySelector(".am-carousel-viewport"),
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }
    });
  }

  function animateOutcome() {
    var section = document.querySelector(".lp-outcome");
    if (!section) return;
    var content = section.querySelector(".lp-outcome-content");
    if (!content) return;
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
     Carousels: click-to-scroll viewport with disabled-state arrows
  ============================================================ */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var viewport = carousel.querySelector(".am-carousel-viewport");
      var track = carousel.querySelector(".am-carousel-track");
      var prevBtn = carousel.querySelector(".am-carousel-prev");
      var nextBtn = carousel.querySelector(".am-carousel-next");
      if (!viewport || !track) return;

      function step() {
        var card = track.querySelector(".am-carousel-card");
        if (!card) return viewport.clientWidth * 0.8;
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
      }

      function updateButtons() {
        var max = track.scrollWidth - viewport.clientWidth - 1;
        if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 0;
        if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= max;
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          viewport.scrollBy({ left: -step(), behavior: "smooth" });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          viewport.scrollBy({ left: step(), behavior: "smooth" });
        });
      }

      viewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          viewport.scrollBy({ left: step(), behavior: "smooth" });
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          viewport.scrollBy({ left: -step(), behavior: "smooth" });
        }
      });

      viewport.addEventListener("scroll", updateButtons, { passive: true });
      window.addEventListener("resize", updateButtons);
      updateButtons();
    });
  }

  /* ============================================================
     Boot
  ============================================================ */
  function init() {
    initCarousels();
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
