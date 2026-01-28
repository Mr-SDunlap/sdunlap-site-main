// GSAP initialization: simple entrance animation
// Requires GSAP loaded before this script (we add a CDN in index.html)

window.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") {
    console.warn("GSAP not found. Make sure the CDN is loaded.");
    return;
  }
  // register ScrollTrigger plugin
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
  // Register ScrambleTextPlugin if available
  if (typeof ScrambleTextPlugin !== "undefined")
    gsap.registerPlugin(ScrambleTextPlugin);

  // Hero pin/morph animation removed per request.

  // Entrance animation: fade up landing text elements
  // Target the primary text group inside the landing section
  // exclude .landing-title so we can give it a separate, slightly longer delay
  const landingTextTargets = document.querySelectorAll(
    "#section_landing .name-header-container > *:not(.landing-title)",
  );
  // intro animation parameters (reuse delay so scramble can start simultaneously)
  const introDelay = 0.12;
  let introTween = null;
  if (landingTextTargets && landingTextTargets.length) {
    introTween = gsap.from(landingTextTargets, {
      y: 18,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.12,
      delay: introDelay,
    });
  }

  // animate .landing-title separately with a slight extra delay
  const landingTitleEl = document.querySelector(".landing-title h1");
  if (landingTitleEl) {
    const titleDelay = introDelay + 0.28; // extra 280ms after the other elements
    gsap.from(landingTitleEl, {
      y: 18,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      delay: titleDelay,
    });
  }

  // Start scramble at the same time as the intro animation (use same delay)
  if (introTween) {
    const nameElInitial = document.querySelector(".landing-name h3");
    if (nameElInitial) {
      const finalText = nameElInitial.textContent.trim();
      // start scramble after the same intro delay so both run together
      gsap.delayedCall(introDelay, () => {
        const el = document.querySelector(".landing-name h3");
        if (!el) return;

        // If ScrambleTextPlugin is available, animate from empty to the final text
        if (typeof ScrambleTextPlugin !== "undefined") {
          el.textContent = "";
          gsap.to(el, {
            duration: 1.2, // slightly slower
            scrambleText: {
              text: finalText,
              chars: "upperCase",
              revealDelay: 0.02,
              speed: 0.3,
            },
            ease: "none",
          });
        } else {
          // fallback: lightweight custom scramble (works without the official plugin)
          const scramble = (el2, text, opts = {}) => {
            const chars = (opts.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ").split(
              "",
            );
            const duration = opts.duration || 2.0;
            const reveal = opts.reveal || 0.7; // portion of duration during which letters are revealed
            const obj = { t: 0 };
            const len = text.length;
            const update = () => {
              const progress = obj.t;
              const revealed = Math.floor(progress * (len / reveal));
              let out = "";
              for (let i = 0; i < len; i++) {
                if (i < revealed) {
                  out += text[i];
                } else {
                  out += chars[Math.floor(Math.random() * chars.length)];
                }
              }
              el2.textContent = out;
            };

            gsap.to(obj, {
              t: 1,
              duration: duration,
              ease: "none",
              onUpdate: update,
              onComplete() {
                el2.textContent = text;
              },
            });
          };

          // run custom scramble: 1.2s duration
          scramble(el, finalText, { duration: 1.2, reveal: 0.7 });
        }
      });
    }
  }

  // Fade out the scroll indicator as the user scrolls toward the about section
  const scrollIndicator = document.querySelector(".scroll-down");
  if (scrollIndicator && typeof ScrollTrigger !== "undefined") {
    gsap.to(scrollIndicator, {
      opacity: 0,
      y: -10,
      ease: "none",
      scrollTrigger: {
        trigger: "#section_landing",
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }
});
