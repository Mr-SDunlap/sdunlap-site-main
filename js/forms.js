/* FORM HANDLING =================================================== */
(function () {
  const init = () => {
    const f = document.getElementById("contact-form");
    if (!f) return;
    const m = document.getElementById("contact-modal");
    const p = f.closest(".modal-panel");
    const s = p?.querySelector(".modal-success") || null;
    const html = f.innerHTML;
    let sub = false;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sub) return;
      sub = true;
      const btn = f.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const a = (f.getAttribute("action") || "").trim();
        if (a && a != "#")
          await fetch(a, {
            method: (f.method || "POST").toUpperCase(),
            body: new FormData(f),
          });
        else await new Promise((r) => setTimeout(r, 180));
        f.reset();
        f.innerHTML = "";
        if (s) {
          f.hidden = true;
          s.hidden = false;
          const cb = s.querySelector("[data-modal-close]");
          if (cb) cb.focus();
        } else {
          const first = f.querySelector("input, textarea, button");
          if (first) first.focus();
        }
      } catch (err) {
        console.error("Form submit error:", err);
        try {
          f.reset();
        } catch (e) {}
      } finally {
        sub = false;
        if (btn) btn.disabled = false;
      }
    });
    if (m)
      new MutationObserver(() => {
        if (m.getAttribute("aria-hidden") !== "false") return;
        if (!f.innerHTML.trim()) f.innerHTML = html;
        f.hidden = false;
        if (s) s.hidden = true;
      }).observe(m, { attributes: true });
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* FORM HANDLING (END) =================================================== */
