// Generic fade-in on scroll utilities.
// Classes supported:
//  - .reveal-up: fade in + move up from below
//  - .reveal-left: fade in + move left (from +x)
//  - .reveal-right: fade in + move right (from -x)
// Behavior:
//  - Reveals on enter (down or up scroll)
//  - Hides only when scrolling upward past the element (bottom edge by default)
//  - Respects prefers-reduced-motion

(() => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const GROUPS = [
    { selector: ".reveal-up", axis: "y", sign: +1, distAttr: "revealY" },
    { selector: ".reveal-left", axis: "x", sign: +1, distAttr: "revealX" },
    { selector: ".reveal-right", axis: "x", sign: -1, distAttr: "revealX" },
  ];

  const markInit = (el) => (el.dataset.revealInit = "1");
  const isInit = (el) => el.dataset.revealInit === "1";

  const getDistance = (el, axis, sign, distAttr) => {
    const raw = Number(
      el.dataset[distAttr] !== undefined ? el.dataset[distAttr] : 24
    );
    return (isNaN(raw) ? 24 : raw) * (axis === "x" ? sign : 1);
  };

  const getOpts = (el, axis, sign, distAttr) => ({
    axis,
    dist: getDistance(el, axis, sign, distAttr),
    duration: Number(el.dataset.revealDuration || 0.65),
    delay: Number(el.dataset.revealDelay || 0),
    ease: el.dataset.revealEase || "power2.out",
    start: el.dataset.revealStart || "top 85%",
    hideStart: el.dataset.revealHideStart || "bottom bottom",
    once: el.dataset.revealOnce === "true",
  });

  const setInitial = (el, opts) => {
    if (typeof gsap !== "undefined") {
      const prop = opts.axis === "x" ? { x: opts.dist } : { y: opts.dist };
      gsap.set(el, { autoAlpha: 0, ...prop, willChange: "transform, opacity" });
    } else {
      el.style.opacity = "0";
      if (opts.axis === "x") el.style.transform = `translateX(${opts.dist}px)`;
      else el.style.transform = `translateY(${opts.dist}px)`;
      el.style.willChange = "transform, opacity";
    }
  };

  const revealNow = (el, opts) => {
    if (typeof gsap !== "undefined") {
      const to = opts.axis === "x" ? { x: 0 } : { y: 0 };
      gsap.to(el, {
        autoAlpha: 1,
        ...to,
        duration: opts.duration,
        delay: opts.delay,
        ease: opts.ease,
        clearProps: "willChange",
      });
    } else {
      el.style.transition = `opacity ${opts.duration}s ease, transform ${opts.duration}s ease`;
      if (opts.delay) el.style.transitionDelay = `${opts.delay}s`;
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translate(0px, 0px)";
        el.style.willChange = "auto";
      });
    }
  };

  const hideNow = (el, opts) => {
    const dur = Math.max(0.3, opts.duration * 0.8);
    if (typeof gsap !== "undefined") {
      const to = opts.axis === "x" ? { x: opts.dist } : { y: opts.dist };
      gsap.to(el, {
        autoAlpha: 0,
        ...to,
        duration: dur,
        ease: opts.ease,
        clearProps: "willChange",
      });
    } else {
      el.style.transition = `opacity ${dur}s ease, transform ${dur}s ease`;
      if (opts.axis === "x") el.style.transform = `translateX(${opts.dist}px)`;
      else el.style.transform = `translateY(${opts.dist}px)`;
      el.style.opacity = "0";
      el.style.willChange = "auto";
    }
  };

  const setupWithScrollTrigger = (els, axis, sign, distAttr) => {
    if (!els.length) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setupWithObserver(els, axis, sign, distAttr);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    els.forEach((el) => {
      if (isInit(el)) return;
      const opts = getOpts(el, axis, sign, distAttr);
      markInit(el);
      setInitial(el, opts);

      if (opts.once) {
        ScrollTrigger.create({
          trigger: el,
          start: opts.start,
          once: true,
          onEnter: () => revealNow(el, opts),
        });
      } else {
        // Reveal on enter (down or up)
        ScrollTrigger.create({
          trigger: el,
          start: opts.start,
          onEnter: () => revealNow(el, opts),
          onEnterBack: () => revealNow(el, opts),
          invalidateOnRefresh: true,
        });
        // Hide only when scrolling UP past bottom threshold
        ScrollTrigger.create({
          trigger: el,
          start: opts.hideStart,
          onLeaveBack: () => hideNow(el, opts),
          invalidateOnRefresh: true,
        });
      }
    });
  };

  const setupWithObserver = (els, axis, sign, distAttr) => {
    if (!els.length) return;
    if (prefersReduced) {
      els.forEach((el) => {
        if (isInit(el)) return;
        markInit(el);
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    let lastY = window.scrollY || 0;
    let scrollingUp = false;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || 0;
        scrollingUp = y < lastY;
        lastY = y;
      },
      { passive: true }
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const opts = getOpts(el, axis, sign, distAttr);

          if (!isInit(el)) {
            markInit(el);
            setInitial(el, opts);
          }

          if (opts.once) {
            if (entry.isIntersecting) {
              revealNow(el, opts);
              io.unobserve(el);
            }
          } else {
            if (entry.isIntersecting) {
              revealNow(el, opts);
            } else {
              const rootBottom =
                (entry.rootBounds && entry.rootBounds.bottom) ||
                window.innerHeight;
              const isBelowViewport = entry.boundingClientRect.top >= rootBottom;
              if (scrollingUp && isBelowViewport) hideNow(el, opts);
            }
          }
        });
      },
      { root: null, threshold: 0.1 }
    );

    els.forEach((el) => io.observe(el));
  };

  const initGroup = ({ selector, axis, sign, distAttr }) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) return;
    if (prefersReduced) {
      nodes.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }
    setupWithScrollTrigger(nodes, axis, sign, distAttr);
  };

  const initAll = () => GROUPS.forEach(initGroup);

  // Public API
  window.RevealFx = window.RevealFx || { refresh: initAll };
  window.RevealUp = window.RevealUp || { refresh: initAll }; // backward compat

  // Observe for newly added nodes for any selector
  const mo = new MutationObserver((muts) => {
    const pend = { up: [], left: [], right: [] };
    muts.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        GROUPS.forEach((g) => {
          if (n.matches && n.matches(g.selector)) pend.up.push(n);
          if (n.querySelectorAll) {
            n.querySelectorAll(g.selector).forEach((el) => pend.up.push(el));
          }
        });
      });
    });
    // Simple: just re-run initAll rather than de-duping lists
    initAll();
  });

  window.addEventListener("DOMContentLoaded", () => {
    initAll();
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
  });
})();
