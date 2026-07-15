// Design Systems catalog: entrance animations + filter logic
// Mirrors the conventions in js/gsap-init.js (gsap.from, power2.out, staggered fade-ups).
// Everything degrades gracefully if GSAP fails to load — content is visible by default.

window.addEventListener("DOMContentLoaded", function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ds-card"));
  var filters = Array.prototype.slice.call(
    document.querySelectorAll(".ds-filter"),
  );
  var countEl = document.getElementById("ds-count");
  var emptyEl = document.getElementById("ds-empty");
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var hasGsap = typeof gsap !== "undefined" && !reduceMotion;

  function markAnimDone() {
    cards.forEach(function (c) {
      c.classList.add("anim-done");
    });
  }

  /* === Entrance animations ============================================= */
  if (hasGsap) {
    gsap.from(".ds-status, .ds-module-label, .ds-intro", {
      y: 18,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.12,
      delay: 0.12,
    });

    gsap.from(".ds-toolbar", {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      delay: 0.5,
    });

    gsap.from(cards, {
      y: 36,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.12,
      delay: 0.35,
      clearProps: "transform,opacity",
      onComplete: markAnimDone,
    });
  } else {
    markAnimDone();
  }

  /* === Title scramble ================================================== */
  // Same lightweight scramble used on the landing page fallback path.
  var titleEl = document.getElementById("ds-scramble-title");
  if (titleEl) {
    var finalText = titleEl.textContent.trim();
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_/".split("");
    var duration = 1.2;
    var reveal = 0.7;
    var len = finalText.length;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / (duration * 1000), 1);
      var revealed = Math.floor(progress * (len / reveal));
      var out = "";
      for (var i = 0; i < len; i++) {
        if (i < revealed || finalText[i] === "_") {
          out += finalText[i];
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      titleEl.textContent = out;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        titleEl.textContent = finalText;
      }
    }

    if (!reduceMotion) {
      requestAnimationFrame(tick);
    }
  }

  /* === Catalog filter ================================================== */
  function applyFilter(key) {
    var visible = 0;

    cards.forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var show = key === "all" || tags.indexOf(key) !== -1;
      card.classList.toggle("is-filtered", !show);
      if (show) visible++;
    });

    if (countEl) {
      countEl.textContent = String(visible).padStart(2, "0");
    }
    if (emptyEl) {
      emptyEl.classList.toggle("visible", visible === 0);
    }

    // Re-run the stagger on the surviving cards so filtering feels alive
    if (hasGsap) {
      var shown = cards.filter(function (c) {
        return !c.classList.contains("is-filtered");
      });
      shown.forEach(function (c) {
        c.classList.remove("anim-done");
      });
      gsap.fromTo(
        shown,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          overwrite: "auto",
          clearProps: "transform,opacity",
          onComplete: markAnimDone,
        },
      );
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("active")) return;
      filters.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* === Search (offline) ================================================
     Disabled until the catalog grows. To enable later:
       1. Remove the `disabled` attribute from the .ds-search input.
       2. Uncomment the block below — it filters cards by name, description
          and tags, and cooperates with the active tag filter.
  ===================================================================== */
  // var searchInput = document.querySelector(".ds-search input");
  // if (searchInput) {
  //   searchInput.addEventListener("input", function () {
  //     var q = searchInput.value.trim().toLowerCase();
  //     var activeBtn = document.querySelector(".ds-filter.active");
  //     var key = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
  //     var visible = 0;
  //     cards.forEach(function (card) {
  //       var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
  //       var matchesTag = key === "all" || tags.indexOf(key) !== -1;
  //       var haystack = card.textContent.toLowerCase();
  //       var matchesQuery = q === "" || haystack.indexOf(q) !== -1;
  //       var show = matchesTag && matchesQuery;
  //       card.classList.toggle("is-filtered", !show);
  //       if (show) visible++;
  //     });
  //     if (countEl) countEl.textContent = String(visible).padStart(2, "0");
  //     if (emptyEl) emptyEl.classList.toggle("visible", visible === 0);
  //   });
  // }
});
