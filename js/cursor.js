// Adds a CSS-driven custom cursor that inverts colors beneath it.
// Uses mix-blend-mode: difference as a broad fallback and
// backdrop-filter: invert(1) where supported for a cleaner effect.

(function () {
  const enable = () => {
    if (!("matchMedia" in window)) return false;
    // Only enable on devices that have a hover-capable pointer
    const ok = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!ok) return false;

    document.body.classList.add("custom-cursor-enabled");

    const el = document.createElement("div");
    el.className = "cursor-invert hidden";
    document.body.appendChild(el);

    let raf = 0;
    let x = 0,
      y = 0;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(render);
    };
    const render = () => {
      raf = 0;
      el.style.setProperty("--cx", x + "px");
      el.style.setProperty("--cy", y + "px");
      el.classList.remove("hidden");
    };
    const down = () => el.classList.add("click");
    const up = () => el.classList.remove("click");
    const leave = () => el.classList.add("hidden");
    const enter = () => el.classList.remove("hidden");

    window.addEventListener("pointermove", move, { passive: true });
    // On supporting browsers, pointerrawupdate fires at higher frequency
    if ("onpointerrawupdate" in window) {
      window.addEventListener("pointerrawupdate", move, { passive: true });
    }
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);

    // Flag interactive elements to enlarge the cursor
    const isInteractive = (t) => {
      if (!t || t === document || t === document.body) return false;
      const tag = (t.tagName || "").toLowerCase();
      if (tag === "a" || tag === "button") return true;
      const role = (t.getAttribute && t.getAttribute("role")) || "";
      if (role === "button" || role === "link") return true;
      // Check if element is clickable via pointer cursor
      const cs = window.getComputedStyle(t);
      if (cs && cs.cursor === "pointer") return true;
      return false;
    };

    document.addEventListener(
      "pointermove",
      (e) => {
        const t = e.target;
        if (isInteractive(t)) {
          el.classList.add("interactive");
        } else {
          el.classList.remove("interactive");
        }
      },
      { passive: true },
    );

    // Optional: disable on inputs/textareas so caret remains visible
    document.addEventListener(
      "pointerover",
      (e) => {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") {
          document.body.classList.remove("custom-cursor-enabled");
          el.classList.add("hidden");
        } else {
          document.body.classList.add("custom-cursor-enabled");
        }
      },
      { passive: true },
    );
    return true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enable, { once: true });
  } else {
    enable();
  }
})();
