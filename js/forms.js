/* FORM HANDLING =================================================== */
(function () {
  const init = () => {
    const f = document.getElementById("contact-form");
    if (!f) return;
    const m = document.getElementById("contact-modal");
    const p = f.closest(".modal-panel");
    const s = p?.querySelector(".modal-success") || null;
    const html = f.innerHTML;
    const getErrorEl = () => f.querySelector(".form-error");
    let sub = false;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sub) return;
      sub = true;
      const errEl = getErrorEl();
      if (errEl) {
        errEl.hidden = true;
        errEl.textContent = "";
      }
      const btn = f.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const a = (f.getAttribute("action") || "/api/contact").trim();
        const payload = Object.fromEntries(new FormData(f).entries());
        const res = await fetch(a, {
          method: (f.method || "POST").toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let message = "Unable to send message right now.";
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch (parseErr) {}
          if (
            (res.status === 404 || res.status === 405) &&
            a === "/api/contact" &&
            /^(127\.0\.0\.1|localhost)$/.test(window.location.hostname)
          ) {
            message =
              "Local static server cannot run /api/contact. Test this form in a serverless runtime or deployed environment.";
          } else if (!message || message === "Unable to send message right now.") {
            message = `Request failed with status ${res.status}.`;
          }
          throw new Error(message);
        }
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
        const nextErrEl = getErrorEl();
        if (nextErrEl) {
          nextErrEl.textContent =
            err instanceof Error ? err.message : "Unable to send message.";
          nextErrEl.hidden = false;
        }
        try {
          btn && btn.focus();
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
        const nextErrEl = f.querySelector(".form-error");
        if (nextErrEl) {
          nextErrEl.hidden = true;
          nextErrEl.textContent = "";
        }
      }).observe(m, { attributes: true });
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* FORM HANDLING (END) =================================================== */
