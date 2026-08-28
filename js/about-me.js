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
    animateSnapshot();
    animatePhotoHead();
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

  /* Snapshot: lead paragraph + card grid fade in on scroll */
  function animateSnapshot() {
    var section = document.querySelector("#am-snapshot");
    if (!section) return;

    var head = section.querySelector(".snap-head");
    if (head) {
      gsap.from(head.children, {
        y: 24,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: head,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var cards = section.querySelectorAll(".snap-card");
    if (cards.length) {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section.querySelector(".snap-grid"),
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }

  /* Photo section: heading reveal on scroll (carousel animates itself via CSS) */
  function animatePhotoHead() {
    var head = document.querySelector(".photo-head");
    if (!head) return;
    gsap.from(head.children, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: head,
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
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
     Photo carousel:
     - duplicate the track once for a seamless loop
     - desktop: cursor position drives direction (left third = scrub
       left, right third = scrub right, middle third = stop); idle
       ambient drift when the cursor isn't over the carousel
     - tablet/mobile: native scroll-snap + prev/next buttons instead
       (touch scrolling is the primary interaction there, not hover)
  ============================================================ */
  function initPhotoCarousel() {
    var pcar = document.querySelector("[data-pcar]");
    var viewport = document.querySelector("[data-pcar-viewport]");
    var track = document.querySelector("[data-pcar-track]");
    if (!pcar || !viewport || !track) return;

    if (!track.dataset.duplicated) {
      Array.prototype.slice.call(track.children).forEach(function (tile) {
        var clone = tile.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");
        track.appendChild(clone);
      });
      track.dataset.duplicated = "true";
    }

    var prevBtn = pcar.querySelector("[data-pcar-prev]");
    var nextBtn = pcar.querySelector("[data-pcar-next]");

    /* --- Desktop: cursor-zone scrub --- */
    var AMBIENT_SPEED = 0.5; // px/frame drift when the cursor is away
    var SCRUB_SPEED = 3; // px/frame while hovering the left/right zone
    var DEAD_ZONE = 1 / 3; // middle fraction of the viewport that halts it
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var pos = 0;
    var halfWidth = 0;
    var zone = "idle"; // "idle" | "left" | "right" | "mid"
    var rafId = null;

    function measure() {
      halfWidth = track.scrollWidth / 2;
    }

    function frame() {
      var frozen = viewport.classList.contains("pcar-frozen");
      var speed = 0;
      if (!frozen) {
        if (zone === "left") speed = SCRUB_SPEED;
        else if (zone === "right") speed = -SCRUB_SPEED;
        else if (zone === "idle") speed = reduceMotion ? 0 : -AMBIENT_SPEED;
      }
      if (speed !== 0 && halfWidth > 0) {
        pos += speed;
        if (pos <= -halfWidth) pos += halfWidth;
        if (pos > 0) pos -= halfWidth;
        track.style.transform = "translateX(" + pos + "px)";
      }
      rafId = requestAnimationFrame(frame);
    }

    function handleMove(e) {
      var rect = viewport.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var mid = rect.width / 2;
      var deadHalf = (rect.width * DEAD_ZONE) / 2;
      if (x < mid - deadHalf) zone = "left";
      else if (x > mid + deadHalf) zone = "right";
      else zone = "mid";
    }

    function handleLeave() {
      zone = "idle";
    }

    function startDesktop() {
      measure();
      window.addEventListener("resize", measure);
      viewport.addEventListener("mousemove", handleMove);
      viewport.addEventListener("mouseleave", handleLeave);
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    function stopDesktop() {
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("mousemove", handleMove);
      viewport.removeEventListener("mouseleave", handleLeave);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      zone = "idle";
      pos = 0;
      track.style.transform = "";
    }

    /* --- Tablet / mobile: native scroll-snap + prev/next buttons --- */
    function tileStep() {
      var tile = track.querySelector(".pcar-tile");
      if (!tile) return viewport.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return tile.getBoundingClientRect().width + gap;
    }

    function updateNavButtons() {
      var max = viewport.scrollWidth - viewport.clientWidth - 1;
      if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 0;
      if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= max;
    }

    function onPrevClick() {
      viewport.scrollBy({ left: -tileStep(), behavior: "smooth" });
    }

    function onNextClick() {
      viewport.scrollBy({ left: tileStep(), behavior: "smooth" });
    }

    function startMobile() {
      if (prevBtn) prevBtn.addEventListener("click", onPrevClick);
      if (nextBtn) nextBtn.addEventListener("click", onNextClick);
      viewport.addEventListener("scroll", updateNavButtons, {
        passive: true,
      });
      updateNavButtons();
    }

    function stopMobile() {
      if (prevBtn) prevBtn.removeEventListener("click", onPrevClick);
      if (nextBtn) nextBtn.removeEventListener("click", onNextClick);
      viewport.removeEventListener("scroll", updateNavButtons);
      viewport.scrollLeft = 0;
    }

    /* --- Mode switch: matches the 769px breakpoint used elsewhere --- */
    var mql = window.matchMedia("(min-width: 769px)");
    var isDesktop = null;

    function applyMode(desktop) {
      if (desktop === isDesktop) return;
      isDesktop = desktop;
      if (desktop) {
        stopMobile();
        startDesktop();
      } else {
        stopDesktop();
        startMobile();
      }
    }

    applyMode(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener("change", function (e) {
        applyMode(e.matches);
      });
    } else if (mql.addListener) {
      mql.addListener(function (e) {
        applyMode(e.matches);
      });
    }
  }

  /* ============================================================
     Photo gallery lightbox: zoom, pan, prev/next
  ============================================================ */
  function initPhotoGallery() {
    var frameEls = Array.prototype.slice.call(
      document.querySelectorAll(".pcar-tile[data-frame-index]")
    );
    var lightbox = document.querySelector("[data-pg-lightbox]");
    if (!frameEls.length || !lightbox) return;

    // Unique frame data keyed by data-frame-index — duplicated tiles
    // (added for the seamless loop) share the same index and are skipped.
    var frames = [];
    frameEls.forEach(function (tile) {
      var idx = parseInt(tile.getAttribute("data-frame-index"), 10);
      if (frames[idx]) return;
      var tileImg = tile.querySelector("img");
      frames[idx] = {
        src: tileImg.src,
        alt: tileImg.alt || "",
        caption: tile.getAttribute("data-caption") || "",
      };
    });

    var viewport = document.querySelector("[data-pcar-viewport]");
    var imgWrap = lightbox.querySelector("[data-pg-img-wrap]");
    var img = lightbox.querySelector("[data-pg-img]");
    var caption = lightbox.querySelector("[data-pg-caption]");
    var closeBtn = lightbox.querySelector("[data-pg-close]");
    var prevBtn = lightbox.querySelector("[data-pg-prev]");
    var nextBtn = lightbox.querySelector("[data-pg-next]");

    var current = 0;
    var zoomed = false;

    function resetZoom() {
      img.style.width = "";
      img.style.height = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
      imgWrap.style.cursor = "";
      imgWrap.style.overflow = "";
      imgWrap.scrollTop = 0;
      imgWrap.scrollLeft = 0;
      zoomed = false;
    }

    function render(index) {
      var frame = frames[index];
      img.src = frame.src;
      img.alt = frame.alt;
      caption.textContent =
        "Frame " + (index + 1) + " / " + frames.length + " \u00b7 " + frame.caption;
      resetZoom();
    }

    function open(index) {
      current = index;
      render(current);
      lightbox.classList.add("pg-lightbox-open");
      if (viewport) viewport.classList.add("pcar-frozen");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("pg-lightbox-open");
      if (viewport) viewport.classList.remove("pcar-frozen");
      document.body.style.overflow = "";
    }

    function next() {
      current = (current + 1) % frames.length;
      render(current);
    }

    function prev() {
      current = (current - 1 + frames.length) % frames.length;
      render(current);
    }

    frameEls.forEach(function (tile) {
      tile.addEventListener("click", function () {
        open(parseInt(tile.getAttribute("data-frame-index"), 10));
      });
    });

    closeBtn.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === imgWrap) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("pg-lightbox-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    img.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!zoomed) {
        var natW = Math.max(img.naturalWidth, img.offsetWidth * 1.6);
        var natH = Math.max(img.naturalHeight, img.offsetHeight * 1.6);
        img.style.width = natW + "px";
        img.style.height = natH + "px";
        img.style.maxWidth = "none";
        img.style.maxHeight = "none";
        imgWrap.style.cursor = "grab";
        imgWrap.style.overflow = "auto";
        zoomed = true;
      } else {
        resetZoom();
      }
    });

    var dragging = false,
      startX,
      startY,
      scrollL,
      scrollT;
    imgWrap.addEventListener("mousedown", function (e) {
      if (e.target !== img || !zoomed) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollL = imgWrap.scrollLeft;
      scrollT = imgWrap.scrollTop;
      imgWrap.style.cursor = "grabbing";
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      imgWrap.scrollLeft = scrollL - (e.clientX - startX);
      imgWrap.scrollTop = scrollT - (e.clientY - startY);
    });
    window.addEventListener("mouseup", function () {
      if (dragging) {
        dragging = false;
        imgWrap.style.cursor = zoomed ? "grab" : "";
      }
    });
  }

  /* ============================================================
     Boot
  ============================================================ */
  function init() {
    initCarousels();
    initPhotoCarousel();
    initPhotoGallery();
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
