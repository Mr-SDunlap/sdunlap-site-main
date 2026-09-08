// Ouros Designs case study: scroll behaviour.
// Progress bar, hero parallax, pinned stack indicator, scrubbed screen
// frames and the pinned horizontal mobile rail. Everything here is
// progressive enhancement: without GSAP the page still reads top to bottom.
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      document.body.classList.add("oc-no-gsap");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    initProgress();
    initReveals(reduced);

    if (reduced) {
      document.body.classList.add("oc-no-gsap");
      return;
    }

    // The rail is pinned, so build it first: its pin-spacer changes the
    // page height, and every trigger created afterwards measures against
    // the real layout instead of needing a corrective refresh.
    initRail();
    initHero();
    initStackIndicator();
    initScrubFrames();
  }

  /* --- Reading progress ------------------------------------- */
  function initProgress() {
    const fill = document.querySelector(".dp-progress-fill");
    if (!fill) return;
    gsap.to(fill, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }

  /* --- Hero parallax ---------------------------------------- */
  function initHero() {
    const hero = document.querySelector(".oc-hero");
    if (!hero) return;

    const bg = hero.querySelector(".oc-hero-bg");
    if (bg) {
      gsap.to(bg, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    const content = hero.querySelector(".oc-hero-content");
    if (content) {
      gsap.to(content, {
        y: -60,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "40% top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  /* --- Section reveals -------------------------------------- */
  function initReveals(reduced) {
    // The closing section is deliberately left out: it lands straight after
    // the pinned rail, so it stays plain and always visible.
    const targets = document.querySelectorAll(
      ".oc-premise-item, .oc-rule, .oc-section-head, .oc-decision-copy",
    );
    if (!targets.length) return;

    if (reduced) {
      targets.forEach((el) => el.classList.remove("oc-reveal"));
      return;
    }

    targets.forEach((el) => {
      el.classList.add("oc-reveal");
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });
  }

  /* --- Stack: step counter tied to the pinned column --------- */
  function initStackIndicator() {
    const section = document.querySelector(".oc-stack");
    if (!section) return;

    const blocks = section.querySelectorAll(".oc-stack-block");
    const fill = section.querySelector(".oc-stack-fill");
    const count = section.querySelector(".oc-stack-count");
    if (!blocks.length || !fill || !count) return;

    const total = blocks.length;
    const pad = (n) => String(n).padStart(2, "0");

    const setStep = (i) => {
      fill.style.width = ((i + 1) / total) * 100 + "%";
      count.textContent = pad(i + 1) + " / " + pad(total);
    };
    setStep(0);

    blocks.forEach((block, i) => {
      ScrollTrigger.create({
        trigger: block,
        start: "top center",
        end: "bottom center",
        onEnter: () => setStep(i),
        onEnterBack: () => setStep(i),
      });
    });
  }

  /* --- Screen frames: scrub the page inside the window ------- */
  function initScrubFrames() {
    const mq = window.matchMedia("(min-width: 901px)");
    const sections = document.querySelectorAll("[data-scrub]");
    if (!sections.length) return;

    const triggers = [];

    const build = () => {
      triggers.forEach((t) => t.kill());
      triggers.length = 0;

      sections.forEach((section) => {
        const win = section.querySelector(".oc-frame-window");
        const img = win && win.querySelector("img");
        if (!win || !img) return;

        gsap.set(img, { clearProps: "transform" });

        if (!mq.matches) return;

        const travel = img.offsetHeight - win.clientHeight;
        if (travel <= 0) return;

        const tween = gsap.to(img, {
          y: -travel,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        });
        triggers.push(tween.scrollTrigger);
      });
    };

    // Images set the travel distance, so wait until they have decoded.
    const imgs = Array.from(document.querySelectorAll(".oc-frame-window img"));
    Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
            }),
      ),
    ).then(() => {
      build();
      ScrollTrigger.refresh();
    });

    build();
    mq.addEventListener("change", () => {
      build();
      ScrollTrigger.refresh();
    });
    window.addEventListener("resize", debounce(build, 200));
  }

  /* --- Mobile rail: pinned horizontal scroll ----------------- */
  function initRail() {
    const mq = window.matchMedia("(min-width: 901px)");
    const section = document.querySelector(".oc-rail");
    const viewport = section && section.querySelector(".oc-rail-viewport");
    const track = section && section.querySelector(".oc-rail-track");
    if (!section || !viewport || !track) return;

    const ID = "ouros-rail";

    const build = () => {
      const existing = ScrollTrigger.getById(ID);
      if (existing) existing.kill();
      if (track._railTween) {
        track._railTween.kill();
        track._railTween = null;
      }
      gsap.set(track, { clearProps: "transform" });
      viewport.classList.remove("oc-rail-pinned");

      // Below the breakpoint the rail is a plain touch-scrollable strip.
      if (!mq.matches) return;

      const distance = track.scrollWidth - viewport.clientWidth;
      if (distance <= 0) return;

      viewport.classList.add("oc-rail-pinned");

      // Stay pinned for a beat after the filmstrip reaches the end, so the
      // horizontal move is finished and still on screen before the pin
      // releases and the closing section slides up under it.
      const hold = Math.round(window.innerHeight * 0.55);

      const tl = gsap.timeline({
        scrollTrigger: {
          id: ID,
          trigger: section,
          start: "top top",
          end: () => "+=" + (distance + hold),
          pin: true,
          // body is display:flex, and ScrollTrigger drops pin spacing on a
          // flex parent unless it is asked for explicitly. Without it the
          // section below scrolls up behind the pinned rail.
          pinSpacing: true,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to(track, { x: -distance, ease: "none", duration: distance });
      tl.to({}, { duration: hold });

      track._railTween = tl;
    };

    build();
    mq.addEventListener("change", () => {
      build();
      ScrollTrigger.refresh();
    });
    window.addEventListener("resize", debounce(build, 200));
  }

  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }
})();
