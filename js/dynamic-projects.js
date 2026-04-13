// Populate archive/dynamic-project-page.html from data/projects.json
// Selects a project by ?slug=..., ?id=..., or ?name=...

(function () {
  function slugify(s) {
    return (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function $(sel) {
    return document.querySelector(sel);
  }
  function setText(sel, value) {
    const el = $(sel);
    if (el) el.textContent = value || "";
  }
  function setHTML(sel, value) {
    const el = $(sel);
    if (el) el.innerHTML = value || "";
  }
  function setBg(sel, url) {
    const el = $(sel);
    if (el && url) el.style.backgroundImage = `url("${url}")`;
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Resolve asset paths for pages inside /archive so that values like
  // "assets/..." or "./assets/..." point to the root-level assets folder.
  function resolveAsset(url) {
    if (!url) return "";
    const s = String(url).trim();
    // Absolute or protocol-relative URLs
    if (/^(?:https?:)?\/\//.test(s)) return s;
    // Root-relative URL already fine
    if (s.startsWith("/")) return s;
    // Strip a leading ./ so we can normalize consistently
    const cleaned = s.startsWith("./") ? s.slice(2) : s;
    // The dynamic page lives at /archive, so go up one level
      return `../${cleaned}`;
  }

  function normalizeClassToken(v) {
    return String(v || "")
      .trim()
      .replace(/^[.#\s]+/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-");
  }

  function parseUXPlanning(planning) {
    const out = { sectionTitle: "", buttonOne: null, buttonTwo: null };
    if (Array.isArray(planning)) {
      planning.forEach((entry) => {
        if (entry && typeof entry === "object") {
          if ("section-title" in entry) out.sectionTitle = entry["section-title"] || "";
          if ("button-one" in entry && Array.isArray(entry["button-one"])) {
            out.buttonOne = entry["button-one"][0] || null;
          }
          if ("button-two" in entry && Array.isArray(entry["button-two"])) {
            out.buttonTwo = entry["button-two"][0] || null;
          }
        }
      });
    }
    return out;
  }

  async function load() {
    const params = new URLSearchParams(location.search);
    const wantedSlug =
      params.get("slug") || params.get("project") || params.get("name");
    const wantedId = params.get("id") || params.get("index");

    // dynamic page lives in /archive, JSON is one level up
    let data;
    try {
      const res = await fetch("../data/projects.json", {
        headers: { Accept: "application/json" },
      });
      data = await res.json();
    } catch (e) {
      console.warn("Failed to load projects.json", e);
      return;
    }

    const list = Array.isArray(data?.projects)
      ? data.projects
      : Array.isArray(data)
        ? data
        : [];
    if (!list.length) return;

    // Build derived slugs for matching if not provided
    const enhanced = list.map((p, i) => ({
      index: i,
      slug: p.slug || slugify(p.projectName || p.name || ""),
      ...p,
    }));

    let project = null;
    if (wantedSlug) {
      const s = slugify(wantedSlug);
      project =
        enhanced.find(
          (p) => slugify(p.slug) === s || slugify(p.projectName) === s,
        ) || null;
    }
    if (!project && wantedId != null && !Number.isNaN(Number(wantedId))) {
      const idx = Math.max(0, Math.min(enhanced.length - 1, Number(wantedId)));
      project = enhanced[idx];
    }
    if (!project) project = enhanced[0];

    // Fill hero and basics
    document.title = project.projectName
      ? `${project.projectName} — SDUNLAP`
      : document.title;
    // Support both old and new hero markup
    // Hero section header (e.g., "Project 01") from JSON
    setText(
      ".hero-container h4",
      project.number || (typeof project.index === "number"
        ? `Project ${String(project.index + 1).padStart(2, "0")}`
        : "")
    );
    setText(".project-title", project.projectName);
    setText(".project-name", project.projectName);
    setText(".project-description", project.description || "");
    setText(".project-summary", project.summary || project.description || "");
    // Legacy detail summary block fallback
    setText(".summary", project.outcome || project.role || "");
    // Hero image (src/alt) inside the hero container
    const heroImg = document.querySelector(".hero-container img");
    if (heroImg) {
      const imgSrc = project.heroImage || project.image || "";
      heroImg.src = resolveAsset(imgSrc);
      heroImg.alt =
        project["heroImage-alt"] ||
        (project.projectName ? `${project.projectName} hero image` : "");
    }

    // Optional hero caption under the image
    const captionEl = document.querySelector(
      ".hero-container .image-container figcaption, .hero-container .image-container caption",
    );
    if (captionEl) {
      const baseCaption =
        project.heroImageCaption || project["heroImage-alt"] || "";
      const extraCaption = project.caption || "";
      const caption = [baseCaption, extraCaption].filter(Boolean).join(" — ");
      captionEl.textContent = caption;
    }

    // Tools used list inside the hero area
    const toolsList = document.querySelector(".hero-container .tools-used");
    if (toolsList) {
      toolsList.textContent = "";
      if (Array.isArray(project.toolsUsed)) {
        project.toolsUsed.forEach((tool) => {
          const li = document.createElement("li");
          li.textContent = tool;
          toolsList.appendChild(li);
        });
      }
    }

    // Optional sections if you extend JSON later
    setHTML(".ux-subheader", project.ux || "");
    setHTML(".design-subheader", project.design || "");
    setHTML(".outcome-subheader", project.outcome || "");

    // Tool-kit list rendering (name, purpose, icon class)
    const toolList = document.querySelector(".tool-kit .tool-list");
    if (toolList) {
      toolList.textContent = ""; // clear any sample item
      const tk = project["tool-kit"]; // object: { name: [purpose, class] }
      if (tk && typeof tk === "object" && !Array.isArray(tk)) {
        Object.entries(tk).forEach(([name, arr]) => {
          const purpose = Array.isArray(arr) ? String(arr[0] || "") : "";
          const extraClass = Array.isArray(arr) ? normalizeClassToken(arr[1]) : "";

          const li = document.createElement("li");
          li.className = "tool";

          const imgDiv = document.createElement("div");
          imgDiv.className = "tool-img";
          if (extraClass) imgDiv.classList.add(extraClass);

          const desc = document.createElement("div");
          desc.className = "tool-desc";

          const nameDiv = document.createElement("div");
          nameDiv.className = "tool-name";
          nameDiv.textContent = name;

          const purposeDiv = document.createElement("div");
          purposeDiv.className = "tool-purpose";
          purposeDiv.textContent = purpose;

          desc.appendChild(nameDiv);
          desc.appendChild(purposeDiv);
          li.appendChild(imgDiv);
          li.appendChild(desc);
          toolList.appendChild(li);
        });
      }
    }

    // UX & Planning section (title, description, button-one, image and image title)
    const uxPlan = parseUXPlanning(project["ux-planning"]);
    if (uxPlan.sectionTitle) {
      setText(".ux-planning .ux-text h2", uxPlan.sectionTitle);
    }
    if (uxPlan.buttonOne) {
      // Paragraph description
      setText(".ux-planning .ux-text p", uxPlan.buttonOne.description || "");

      // First button label while preserving the icon div
      const btnOne = document.querySelector(
        ".ux-planning .ux-btn-container .link-btn:first-child",
      );
      if (btnOne) {
        // Remove existing text nodes, keep icon wrapper(s)
        Array.from(btnOne.childNodes).forEach((n) => {
          if (n.nodeType === 3) btnOne.removeChild(n);
        });
        btnOne.appendChild(
          document.createTextNode(" " + (uxPlan.buttonOne.button || "")),
        );
      }

      // Image + title
      const uxImg = document.querySelector(".ux-planning .ux-image img");
      if (uxImg) {
        uxImg.src = resolveAsset(uxPlan.buttonOne.img || "");
        uxImg.alt = uxPlan.buttonOne["img-title"] || uxPlan.buttonOne.button || uxImg.alt;
      }
      setText(
        ".ux-planning .ux-image h4",
        uxPlan.buttonOne["img-title"] || uxPlan.buttonOne.button || "",
      );

      // Second button label (if present)
      const btnTwo = document.querySelector(
        ".ux-planning .ux-btn-container .link-btn:nth-child(2)",
      );
      if (btnTwo && uxPlan.buttonTwo) {
        Array.from(btnTwo.childNodes).forEach((n) => {
          if (n.nodeType === 3) btnTwo.removeChild(n);
        });
        btnTwo.appendChild(
          document.createTextNode(" " + (uxPlan.buttonTwo.button || "")),
        );
      }

      // Interaction: clicking buttons swaps content with a brief animation
      const TRANSITION_MS = 220;
      const animateSwap = (el, apply) => {
        if (!el) {
          if (typeof apply === "function") apply();
          return;
        }
        let done = false;
        const onEnd = () => {
          if (done) return;
          done = true;
          el.removeEventListener("transitionend", onEnd);
          if (typeof apply === "function") apply();
          el.classList.remove("is-exiting");
          el.classList.add("is-entering");
          requestAnimationFrame(() => {
            // Force reflow so the enter transition plays
            el.getBoundingClientRect();
            el.classList.remove("is-entering");
          });
        };
        el.addEventListener("transitionend", onEnd);
        el.classList.add("is-exiting");
        // Fallback in case transitionend doesn’t fire
        setTimeout(onEnd, TRANSITION_MS + 60);
      };

      const updateUx = (item) => {
        if (!item) return;
        const pEl = document.querySelector(".ux-planning .ux-text p");
        const imgEl = document.querySelector(".ux-planning .ux-image img");
        const h4El = document.querySelector(".ux-planning .ux-image h4");

        animateSwap(pEl, () => {
          setText(".ux-planning .ux-text p", item.description || "");
        });
        animateSwap(imgEl, () => {
          if (imgEl) {
            imgEl.src = resolveAsset(item.img || "");
            imgEl.alt = item["img-title"] || item.button || imgEl.alt;
          }
        });
        animateSwap(h4El, () => {
          setText(
            ".ux-planning .ux-image h4",
            item["img-title"] || item.button || "",
          );
        });
      };

      const allBtns = document.querySelectorAll(
        ".ux-planning .ux-btn-container .link-btn",
      );
      const setActive = (el) => {
        allBtns.forEach((b) => b.classList.remove("active-btn"));
        if (el) el.classList.add("active-btn");
      };

      if (btnOne) {
        btnOne.addEventListener("click", () => {
          updateUx(uxPlan.buttonOne);
          setActive(btnOne);
        });
      }
      if (btnTwo && uxPlan.buttonTwo) {
        btnTwo.addEventListener("click", () => {
          updateUx(uxPlan.buttonTwo);
          setActive(btnTwo);
        });
      }
    }

    // Section titles populated from JSON (supports dashed keys)
    // .design-title-text <= project["design-title"] (fallbacks to empty)
    setHTML(".ux-title-text", project["ux-title"] || project.uxTitle || "");
    setHTML(
      ".design-title-text",
      project["design-title"] || project.designTitle || "",
    );
    setHTML(
      ".outcome-title-text",
      project["outcome-title"] || project.outcomeTitle || "",
    );

    // Visual Design: Color theory paragraph and color list swatches
    // - `.visual-design .vd-image p` <= project["color-theory"] (if present)
    // - `.visual-design .color-list` <= li elements with classes from project["color-list"]
    (function renderColorTheory() {
      const colorTheory = project["color-theory"] || project.colorTheory;
      if (colorTheory) {
        setText(".visual-design .vd-image p", colorTheory);
      }

      const colorListEl = document.querySelector(".visual-design .color-list");
      const colors = project["color-list"];
      if (colorListEl && Array.isArray(colors)) {
        colorListEl.textContent = ""; // Clear any placeholders
        colors.forEach((cls) => {
          const li = document.createElement("li");
          const token = normalizeClassToken(cls);
          if (token) li.classList.add(token);
          colorListEl.appendChild(li);
        });
      }
    })();

    // Right-hand info panel (Client, Role, Tools, Status, Link)
    // Prefer project.info array if present; fall back to top-level fields.
    const infoMap = {};
    if (Array.isArray(project.info)) {
      project.info.forEach((entry) => {
        if (entry && typeof entry === "object") {
          const [k, v] = Object.entries(entry)[0] || [];
          if (k) infoMap[k] = v;
        }
      });
    }

    const client = infoMap.client ?? project.client ?? "";
    const role = infoMap.role ?? project.role ?? "";
    const tools = infoMap.tools ?? project.toolsUsed ?? [];
    const status = infoMap.status ?? project.status ?? "";
    const linkVal = infoMap.link ?? project.liveLink ?? project.link ?? "";

    setText(".info-client", client);
    setText(".info-role", role);
    if (Array.isArray(tools)) {
      setText(".info-tools", tools.join(" · "));
    } else {
      setText(".info-tools", String(tools || ""));
    }
    setText(".info-status", status);

    // Render link as an anchor if available
    const linkEl = document.querySelector(".info-link");
    if (linkEl) {
      if (linkVal) {
        const href = resolveAsset(linkVal);
        let label = href;
        try {
          const u = new URL(href, location.href);
          label = u.hostname.replace(/^www\./, "");
        } catch (_) {
          // keep href as label
        }
        linkEl.innerHTML = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
      } else {
        linkEl.textContent = "";
      }
    }

    // Implementation section CTA: set `.link-out-btn` to the project's live link
    // Preference order: info.link -> liveLink -> link
    const ctaBtn = document.querySelector(".link-out-btn");
    if (ctaBtn) {
      if (linkVal) {
        const href = resolveAsset(linkVal);
        ctaBtn.setAttribute("href", href);
        // Ensure new tab with safety
        ctaBtn.setAttribute("target", "_blank");
        ctaBtn.setAttribute("rel", "noopener");
      } else {
        // If no link available, keep button present but inert
        ctaBtn.removeAttribute("href");
      }
    }

    // Build dynamic in-page navigation for sections
    (function buildProjectNav() {
      const sections = [
        {
          sel: ".hero-container",
          id: "section_overview",
          label:
            "Overview" || document.querySelector(".hero-container h4")?.textContent,
        },
        {
          sel: ".tool-kit",
          id: "section_toolkit",
          label: "Tool Kit",
        },
        {
          sel: ".ux-planning",
          id: "section_ux",
          label:
            document.querySelector(".ux-planning .ux-text h2")?.textContent ||
            "UX & Planning",
        },
        {
          sel: ".visual-design",
          id: "section_visual",
          label:
            (document.querySelector(".visual-design h4")?.textContent || "Visual Design")
              .replace(/^\s*\d+\s*\/?\s*/g, "")
              .trim(),
        },
        { sel: ".outcome", id: "section_outcome", label: "Outcome" },
        {
          sel: ".additional-projects",
          id: "section_more",
          label: "Explore",
        },
      ].filter((s) => document.querySelector(s.sel));

      const ul = document.querySelector("#site-nav ul");
      if (!ul || !sections.length) return;

      // Clear any existing items and rebuild
      ul.textContent = "";

      // Brand/home anchor -> first section
      const homeLi = document.createElement("li");
      const homeA = document.createElement("a");
      homeA.className = "home-logo split-text";
      homeA.href = `#${sections[0].id}`;
      homeA.textContent = "sd";
      homeLi.appendChild(homeA);
      ul.appendChild(homeLi);

      // Ensure IDs and add links
      sections.forEach((s) => {
        const sec = document.querySelector(s.sel);
        if (!sec) return;
        sec.id = s.id;
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${s.id}`;
        const span = document.createElement("span");
        span.textContent = s.label;
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      });
      // Smooth scrolling is handled globally in CSS (html { scroll-behavior: smooth; })
    })();

    // Previous / Next links
    const i = project.index;
    const prev = enhanced[(i - 1 + enhanced.length) % enhanced.length];
    const next = enhanced[(i + 1) % enhanced.length];
    const buildHref = (p) =>
      `dynamic-project-page.html?slug=${encodeURIComponent(p.slug)}`;
    const left = $(".additional-projects .project-left");
    const right = $(".additional-projects .project-right");
    if (left) {
      left.href = buildHref(prev);
      left.textContent = prev.projectName || prev.slug;
    }
    if (right) {
      right.href = buildHref(next);
      right.textContent = next.projectName || next.slug;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
