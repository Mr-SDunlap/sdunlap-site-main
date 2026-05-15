// Global hover swirl for anchor text
// - Splits anchor text nodes into character spans and animates them on hover
// - Skips the left sidebar nav (#site-nav) to avoid conflicting animations
// - Respects prefers-reduced-motion

(function () {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitTextNode(node) {
    const text = node.nodeValue;
    if (!text || !text.trim()) return null;
    // Normalize whitespace so indentation/newlines don't create extra chars
    const norm = text.replace(/\s+/g, " ").trim();
    if (!norm.length) return null;
    const wrap = document.createElement("span");
    wrap.className = "swirl-wrap";
    for (const ch of norm) {
      // Per-character clip wrapper to mask vertical movement
      const clip = document.createElement("span");
      clip.className = "swirl-clip";

      const span = document.createElement("span");
      span.className = "swirl-char";
      if (ch === " ") {
        span.classList.add("swirl-space");
        span.textContent = "\u00A0"; // non-breaking space keeps spacing
      } else {
        span.textContent = ch;
      }
      clip.appendChild(span);
      wrap.appendChild(clip);
    }
    return wrap;
  }

  function createSwirlWrapFromText(text) {
    const norm = String(text || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!norm) return null;
    const wrap = document.createElement("span");
    wrap.className = "swirl-wrap";
    for (const ch of norm) {
      const clip = document.createElement("span");
      clip.className = "swirl-clip";
      const span = document.createElement("span");
      span.className = "swirl-char";
      if (ch === " ") {
        span.classList.add("swirl-space");
        span.textContent = "\u00A0";
      } else {
        span.textContent = ch;
      }
      clip.appendChild(span);
      wrap.appendChild(clip);
    }
    return wrap;
  }

  function prepareAnchor(a) {
    if (!a || a.dataset.swirlReady === "1") return;
    if (a.closest("#site-nav")) return; // skip sidebar nav
    if (a.classList.contains("home-logo")) return; // skip logo
    // Avoid anchors that contain interactive children like images only
    // We will only split actual text nodes and leave elements intact.
    // If already split previously (e.g., older markup), rebuild once to avoid duplicates
    const hasSwirl = a.querySelector(".swirl-char");
    if (hasSwirl) {
      // Only rebuild if the anchor contains no non-swirl element children
      const hasOtherElements = Array.from(a.children).some(
        (el) => !el.classList.contains("swirl-wrap"),
      );
      if (!hasOtherElements) {
        const combined = a.textContent;
        a.textContent = "";
        const rebuilt = createSwirlWrapFromText(combined);
        if (rebuilt) a.appendChild(rebuilt);
      }
      a.dataset.swirlReady = "1";
      return;
    }

    const textNodes = [];
    a.childNodes.forEach((n) => {
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim().length) {
        textNodes.push(n);
      }
    });
    if (!textNodes.length) {
      a.dataset.swirlReady = "1";
      return;
    }

    // Preserve accessible name
    if (!a.hasAttribute("aria-label")) {
      const label = a.textContent.trim();
      if (label) a.setAttribute("aria-label", label);
    }

    // Merge all contiguous text nodes into a single swirl wrap to avoid duplicates
    const combinedText = textNodes.map((n) => n.nodeValue).join(" ");
    const firstTextNode = textNodes[0];
    const wrap = createSwirlWrapFromText(combinedText);
    if (wrap) {
      firstTextNode.parentNode.insertBefore(wrap, firstTextNode);
    }
    textNodes.forEach((tn) => tn.parentNode && tn.parentNode.removeChild(tn));

    const chars = a.querySelectorAll(".swirl-char");
    if (!chars.length) {
      a.dataset.swirlReady = "1";
      return;
    }

    if (!prefersReduced && typeof gsap !== "undefined") {
      const stagger = 0.02;
      const enter = () => {
        gsap.killTweensOf(chars);
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        // Move up out of the clip, then jump below and return to rest
        tl.to(chars, {
          yPercent: -100,
          rotation: (i) => (i % 2 ? -14 : 14),
          duration: 0.2,
          stagger,
        })
          .set(chars, {
            yPercent: 100,
            rotation: (i) => (i % 2 ? 14 : -14),
          })
          .to(chars, {
            yPercent: 0,
            rotation: 0,
            duration: 0.2,
            stagger,
          });
      };
      a.addEventListener("mouseenter", enter, { passive: true });
      // Optional: trigger on focus via keyboard as well
      a.addEventListener("focus", enter, { passive: true });
    }

    a.dataset.swirlReady = "1";
  }

  function init() {
    const anchors = Array.from(document.querySelectorAll("a"));
    anchors.forEach(prepareAnchor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    window.addEventListener("load", init, { once: true });
  } else {
    init();
  }
})();
