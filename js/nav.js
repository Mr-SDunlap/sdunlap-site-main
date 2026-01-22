/* NAVIGATION hovering and indication ================================= */
(() => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);
  const ANCH = [...document.querySelectorAll("nav ul li a")];
  if (!ANCH.length) return;
  const measure = (el) => {
    const prev = el.style.height;
    el.style.height = "auto";
    const h = el.scrollHeight || el.offsetHeight || 0;
    el.style.height = prev;
    return h;
  };
  ANCH.forEach((a) => {
    const s = a.querySelector("span");
    if (!s) return;
    a.style.boxSizing = "border-box";
    a.style.overflow = "hidden";
    s.style.overflow = "hidden";
    s.style.display = "block";
    s.style.height = "0";
    s.style.opacity = "0";
    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 0.28, ease: "power2.out" },
      })
      .to(
        a,
        {
          height: () =>
            (parseInt(getComputedStyle(a).height, 10) || 0) + measure(s),
        },
        0
      )
      .to(s, { height: () => measure(s), opacity: 1 }, 0);
    a._isPointerInside = a._isKeyboardFocused = a._isSectionActive = false;
    a.addEventListener("mouseenter", () => {
      a._isPointerInside = true;
      tl.play();
    });
    a.addEventListener("mouseleave", () => {
      a._isPointerInside = false;
      if (!a._isSectionActive && !a._isKeyboardFocused) tl.reverse();
    });
    a.addEventListener("focus", () => {
      a._isKeyboardFocused = true;
      tl.play();
    });
    a.addEventListener("blur", () => {
      a._isKeyboardFocused = false;
      if (!a._isSectionActive && !a._isPointerInside) tl.reverse();
    });
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    ScrollTrigger.create({
      trigger: target,
      start: "top center",
      end: "bottom center",
      invalidateOnRefresh: true,
      onEnter: () => {
        a._isSectionActive = true;
        tl.play();
        a.setAttribute("aria-current", "true");
      },
      onEnterBack: () => {
        a._isSectionActive = true;
        tl.play();
        a.setAttribute("aria-current", "true");
      },
      onLeave: () => {
        a._isSectionActive = false;
        tl.reverse();
        a.removeAttribute("aria-current");
      },
      onLeaveBack: () => {
        a._isSectionActive = false;
        tl.reverse();
        a.removeAttribute("aria-current");
      },
    });
  });
})();
/* NAVIGATION hovering and indication (END) ================================= */

// Modal (connect button) — open/close with GSAP
(function () {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;
  const panel = modal.querySelector(".modal-panel");
  const overlaySel = "[data-modal-close]";
  const triggers = Array.from(document.querySelectorAll(".connect-btn"));

  function openModal(ev) {
    if (ev) ev.preventDefault();
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    gsap.killTweensOf([modal.querySelector(".modal-overlay"), panel]);
    gsap.set(modal.querySelector(".modal-overlay"), { opacity: 0 });
    gsap.set(panel, { opacity: 0, scale: 0.98, y: 16 });
    gsap.to(modal.querySelector(".modal-overlay"), {
      opacity: 1,
      duration: 0.28,
      ease: "power2.out",
    });
    gsap.to(panel, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.32,
      ease: "power3.out",
      onComplete() {
        const first = panel.querySelector("input,textarea,button");
        if (first) first.focus();
      },
    });
    document.addEventListener("keydown", onKey);
  }
  function closeModal() {
    gsap.to(modal.querySelector(".modal-overlay"), {
      opacity: 0,
      duration: 0.18,
      ease: "power1.in",
    });
    gsap.to(panel, {
      opacity: 0,
      scale: 0.98,
      y: 12,
      duration: 0.18,
      ease: "power1.in",
      onComplete() {
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        triggers[0] && triggers[0].focus();
      },
    });
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (e.key === "Escape") closeModal();
  }

  triggers.forEach((t) => t.addEventListener("click", openModal));
  document.addEventListener("click", (e) => {
    const closeEl = e.target.closest(overlaySel);
    if (closeEl && modal.contains(closeEl)) closeModal();
  });
})();
/* MODAL (END) ================================= */

/* Burger menu =============================== */
(() => {
  const burger = document.querySelector(".burger-menu");
  const mobile = document.getElementById("mobile-nav");
  if (!burger || !mobile || typeof gsap === "undefined") return;
  const menu = mobile.querySelector("ul");
  if (!menu) return;

  // start hidden (off-canvas above) and non-interactive
  gsap.set(menu, { yPercent: -100, autoAlpha: 0, pointerEvents: "none" });

  const tl = gsap.timeline({ paused: true }).to(menu, {
    yPercent: 0,
    autoAlpha: 1,
    pointerEvents: "auto",
    duration: 0.36,
    ease: "power3.out",
  });

  const setOpen = (isOpen) => {
    burger.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      tl.play();
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      tl.reverse();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };

  burger.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(!burger.classList.contains("open"));
  });

  // Close menu when a nav link is clicked
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => setOpen(false)));

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.classList.contains("open")) setOpen(false);
  });
})();
