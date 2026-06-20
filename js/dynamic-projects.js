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

  function resolveAsset(url) {
    if (!url) return "";
    var s = String(url).trim();
    if (/^(?:https?:)?\/\//.test(s)) return s;
    if (s.startsWith("/")) return s;
    var cleaned = s.startsWith("./") ? s.slice(2) : s;
    return "../" + cleaned;
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeClassToken(v) {
    return String(v || "")
      .trim()
      .replace(/^[.#\s]+/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-");
  }

  function parseUXPlanning(planning) {
    var out = [];
    if (!Array.isArray(planning)) return out;
    planning.forEach(function (entry) {
      if (!entry || typeof entry !== "object") return;
      ["button-one", "button-two"].forEach(function (key) {
        if (key in entry && Array.isArray(entry[key]) && entry[key][0]) {
          out.push(entry[key][0]);
        }
      });
    });
    return out;
  }

  function parseVisualDesign(vd) {
    var out = { blocks: [], images: [] };
    if (!Array.isArray(vd)) return out;
    var text = {},
      imgs = {};
    vd.forEach(function (entry) {
      if (!entry || typeof entry !== "object") return;
      if (Array.isArray(entry["vd-text"]) && entry["vd-text"][0]) {
        text = entry["vd-text"][0];
      }
      if (Array.isArray(entry["vd-images"]) && entry["vd-images"][0]) {
        imgs = entry["vd-images"][0];
      }
    });
    if (text["copy-one"]) {
      out.blocks.push({ copy: text["copy-one"] });
      out.images.push(imgs["copy-one-img"] || "");
    }
    if (text["copy-two"]) {
      out.blocks.push({ copy: text["copy-two"] });
      out.images.push(imgs["copy-two-img"] || "");
    }
    out.sectionTitle = text["section-title"] || "";
    return out;
  }

  async function init() {
    var params = new URLSearchParams(location.search);
    var wantedSlug =
      params.get("slug") || params.get("project") || params.get("name");
    var wantedId = params.get("id") || params.get("index");

    var data;
    try {
      var res = await fetch("../data/projects.json", {
        headers: { Accept: "application/json" },
      });
      data = await res.json();
    } catch (e) {
      return;
    }

    var list = Array.isArray(data?.projects)
      ? data.projects
      : Array.isArray(data)
        ? data
        : [];
    if (!list.length) return;

    var enhanced = list.map(function (p, i) {
      return Object.assign({}, p, {
        index: i,
        slug: p.slug || slugify(p.projectName || p.name || ""),
      });
    });

    var project = null;
    if (wantedSlug) {
      var s = slugify(wantedSlug);
      project =
        enhanced.find(function (p) {
          return slugify(p.slug) === s || slugify(p.projectName) === s;
        }) || null;
    }
    if (!project && wantedId != null && !Number.isNaN(Number(wantedId))) {
      var idx = Math.max(0, Math.min(enhanced.length - 1, Number(wantedId)));
      project = enhanced[idx];
    }
    if (!project) project = enhanced[0];

    populatePage(project, enhanced);
    requestAnimationFrame(function () {
      initAnimations(project);
    });
  }

  function populatePage(project, allProjects) {
    document.title = project.projectName
      ? project.projectName + " — SDUNLAP"
      : "Project — SDUNLAP";

    var infoMap = {};
    if (Array.isArray(project.info)) {
      project.info.forEach(function (entry) {
        if (entry && typeof entry === "object") {
          var entries = Object.entries(entry);
          if (entries[0]) infoMap[entries[0][0]] = entries[0][1];
        }
      });
    }

    var client = infoMap.client ?? project.client ?? "";
    var role = infoMap.role ?? project.role ?? "";
    var tools = infoMap.tools ?? project.toolsUsed ?? [];
    var status = infoMap.status ?? project.status ?? "";
    var liveLink = infoMap.link ?? project.liveLink ?? project.link ?? "";
    var projectNumber =
      project.number ||
      "Project " + String(project.index + 1).padStart(2, "0");

    // Hero — no background image; the gradient + constellation form the
    // backdrop. A foreground device mockup is still shown when provided.
    var deviceImg = project["heroDevice"] || project.heroDevice;

    if (deviceImg) {
      buildHeroDevice(resolveAsset(deviceImg), project.liveLink || project.link || "");
    }

    setText(".dp-hero-label", projectNumber);
    setText(".dp-hero-title", project.projectName || "");
    setText(".dp-hero-role", role);
    setText(".dp-hero-status", status);

    // Overview
    setText(".dp-overview-desc", project.description || project.summary || "");
    setText(".dp-client", client);
    setText(".dp-role", role);
    setText(
      ".dp-tools",
      Array.isArray(tools) ? tools.join(" · ") : String(tools || ""),
    );
    setText(".dp-status", status);

    // Mobile nav ID
    var navId = document.querySelector(".dp-mnav-id");
    if (navId) {
      navId.textContent =
        "ID: " + (project.slug || slugify(project.projectName)).toUpperCase();
    }

    // Lightbox
    var lightbox = buildLightbox();

    // Approach
    buildApproach(project, lightbox);

    // Design
    buildDesign(project, lightbox);

    // Outcome
    buildOutcome(project, liveLink);

    // Explore prev/next
    buildExplore(project, allProjects);

    // Footer project links
    buildFooterLinks(allProjects);

    // Home logo navigation
    bindHomeLinks();
  }

  function setText(sel, value) {
    var el = document.querySelector(sel);
    if (el) el.textContent = value || "";
  }

  function buildApproach(project, lightbox) {
    var section = document.querySelector(".dp-approach");
    var container = document.querySelector(".dp-approach-scroll");
    if (!section || !container) return;

    var blocks = parseUXPlanning(project["ux-planning"]);
    if (!blocks.length) {
      section.classList.add("dp-hidden");
      return;
    }

    var heading = document.querySelector(".dp-approach-heading");
    if (heading) {
      heading.textContent =
        project["ux-title"] || project.uxTitle || "The Approach";
    }

    container.innerHTML = "";
    blocks.forEach(function (block, i) {
      var div = document.createElement("div");
      div.className = "dp-approach-block";
      div.setAttribute("data-block", i);

      var inner = document.createElement("div");
      inner.className = "dp-approach-block-inner";

      if (block.img) {
        var imgWrap = document.createElement("div");
        imgWrap.className = "dp-approach-img-wrap";
        var img = document.createElement("img");
        img.className = "dp-approach-img";
        img.src = resolveAsset(block.img);
        img.alt = block["img-title"] || block.button || "";
        img.loading = "lazy";
        imgWrap.appendChild(img);
        if (lightbox) addLightboxTrigger(imgWrap, img, lightbox);
        inner.appendChild(imgWrap);
      }

      var title = document.createElement("h3");
      title.className = "dp-approach-block-title";
      title.textContent =
        block["section-title"] || block.button || "Step " + (i + 1);
      inner.appendChild(title);

      var desc = document.createElement("p");
      desc.className = "dp-approach-block-desc";
      desc.textContent = block.description || "";
      inner.appendChild(desc);

      div.appendChild(inner);
      container.appendChild(div);
    });

    var stepFill = document.querySelector(".dp-step-fill");
    var stepCount = document.querySelector(".dp-step-count");
    if (stepFill) stepFill.style.width = (1 / blocks.length) * 100 + "%";
    if (stepCount) {
      stepCount.textContent =
        "01 / " + String(blocks.length).padStart(2, "0");
    }
  }

  function buildDesign(project, lightbox) {
    var section = document.querySelector(".dp-design");
    var scrollContainer = document.querySelector(".dp-design-scroll");
    var imgContainer = document.querySelector(".dp-design-img-container");
    if (!section || !scrollContainer || !imgContainer) return;

    var vd = parseVisualDesign(project["visual-design"]);
    if (!vd.blocks.length) {
      section.classList.add("dp-hidden");
      return;
    }

    var designTitle =
      project["design-title"] ||
      project.designTitle ||
      vd.sectionTitle ||
      "The Design";
    var colorTheory = project["color-theory"] || project.colorTheory || "";
    var colorList = project["color-list"] || [];

    scrollContainer.innerHTML = "";
    vd.blocks.forEach(function (block, i) {
      var div = document.createElement("div");
      div.className = "dp-design-block";
      div.setAttribute("data-block", i);

      var inner = document.createElement("div");
      inner.className = "dp-design-block-inner";

      if (i === 0) {
        var num = document.createElement("span");
        num.className = "dp-num";
        num.textContent = "02";
        inner.appendChild(num);

        var h2 = document.createElement("h2");
        h2.className = "dp-design-heading";
        h2.textContent = designTitle;
        inner.appendChild(h2);
      }

      var p = document.createElement("p");
      p.className = "dp-design-copy";
      p.textContent = block.copy;
      inner.appendChild(p);

      if (i === vd.blocks.length - 1 && (colorTheory || colorList.length)) {
        var ct = document.createElement("div");
        ct.className = "dp-color-theory";

        var ctH = document.createElement("h4");
        ctH.className = "dp-color-heading";
        ctH.textContent = "Color Palette";
        ct.appendChild(ctH);

        if (colorList.length) {
          var ul = document.createElement("ul");
          ul.className = "dp-color-list";
          colorList.forEach(function (cls) {
            var li = document.createElement("li");
            var token = normalizeClassToken(cls);
            if (token) li.classList.add(token);
            ul.appendChild(li);
          });
          ct.appendChild(ul);
        }

        if (colorTheory) {
          var ctP = document.createElement("p");
          ctP.className = "dp-color-desc";
          ctP.textContent = colorTheory;
          ct.appendChild(ctP);
        }

        inner.appendChild(ct);
      }

      if (vd.images[i]) {
        var inlineWrap = document.createElement("div");
        inlineWrap.className = "dp-design-inline-img";
        var inlineImg = document.createElement("img");
        inlineImg.src = resolveAsset(vd.images[i]);
        inlineImg.alt = designTitle + " — visual " + (i + 1);
        inlineImg.loading = "lazy";
        inlineWrap.appendChild(inlineImg);
        if (lightbox) addLightboxTrigger(inlineWrap, inlineImg, lightbox);
        div.appendChild(inlineWrap);
      }

      div.appendChild(inner);
      scrollContainer.appendChild(div);
    });

    imgContainer.innerHTML = "";
    var hasImages = vd.images.some(function (src) {
      return !!src;
    });
    if (!hasImages) {
      var placeholder = document.createElement("div");
      placeholder.style.cssText =
        "width:100%;height:100%;background:var(--diamond)";
      imgContainer.appendChild(placeholder);
    } else {
      vd.images.forEach(function (src, i) {
        if (!src) return;
        var imgWrap = document.createElement("div");
        imgWrap.className = "dp-design-img-wrap";
        var img = document.createElement("img");
        img.src = resolveAsset(src);
        img.alt = designTitle + " — visual " + (i + 1);
        img.loading = "lazy";
        if (i === 0) imgWrap.classList.add("dp-img-active");
        imgWrap.appendChild(img);
        if (lightbox) addLightboxTrigger(imgWrap, img, lightbox);
        imgContainer.appendChild(imgWrap);
      });
    }
  }

  function buildOutcome(project, liveLink) {
    var section = document.querySelector(".dp-outcome");
    if (!section) return;

    var outcomeText = project.outcome || "";
    var hasMedia = !!(project.video || project.heroImage || project.image);

    if (!outcomeText && !hasMedia) {
      section.classList.add("dp-hidden");
      return;
    }

    var heading = document.querySelector(".dp-outcome-heading");
    if (heading) {
      heading.textContent =
        project["outcome-title"] || project.outcomeTitle || "The Outcome";
    }

    setText(".dp-outcome-text", outcomeText);

    var mediaContainer = document.querySelector(".dp-outcome-media");
    if (mediaContainer) {
      mediaContainer.innerHTML = "";
      if (project.video) {
        var video = document.createElement("video");
        video.src = resolveAsset(project.video);
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = false;
        mediaContainer.appendChild(video);
      } else {
        var img = document.createElement("img");
        img.src = resolveAsset(project.heroImage || project.image || "");
        img.alt = (project.projectName || "Project") + " outcome";
        mediaContainer.appendChild(img);
      }
    }

    var cta = document.querySelector(".dp-outcome-cta");
    if (cta) {
      if (liveLink) {
        cta.href = /^https?:\/\//.test(liveLink)
          ? liveLink
          : resolveAsset(liveLink);
      } else {
        cta.classList.add("dp-hidden");
      }
    }
  }

  function buildExplore(project, allProjects) {
    var section = document.querySelector(".dp-explore");
    if (allProjects.length < 2) {
      if (section) section.classList.add("dp-hidden");
      return;
    }

    var i = project.index;
    var prev = allProjects[(i - 1 + allProjects.length) % allProjects.length];
    var next = allProjects[(i + 1) % allProjects.length];
    var href = function (p) {
      if (p.pageUrl) return p.pageUrl;
      return "dynamic-project-page.html?slug=" + encodeURIComponent(p.slug);
    };

    var prevCard = document.querySelector(".dp-prev");
    var nextCard = document.querySelector(".dp-next");

    // When prev and next are the same project (e.g. only 2 projects total),
    // show only one card and hide the duplicate.
    var sameProject = prev.slug === next.slug;

    if (prevCard) {
      prevCard.href = href(prev);
      var dir = prevCard.querySelector(".dp-explore-dir");
      if (dir) dir.textContent = "View Project";
      var name = prevCard.querySelector(".dp-explore-name");
      if (name) name.textContent = prev.projectName || prev.slug;
    }
    if (nextCard) {
      if (sameProject) {
        nextCard.style.display = "none";
      } else {
        nextCard.href = href(next);
        var dir2 = nextCard.querySelector(".dp-explore-dir");
        if (dir2) dir2.textContent = "View Project";
        var name2 = nextCard.querySelector(".dp-explore-name");
        if (name2) name2.textContent = next.projectName || next.slug;
      }
    }
  }

  function buildFooterLinks(allProjects) {
    var ul = document.querySelector(".footer .project-links");
    if (!ul) return;
    allProjects.forEach(function (p) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href =
        "dynamic-project-page.html?slug=" + encodeURIComponent(p.slug);
      a.textContent = p.projectName || p.slug;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function bindHomeLinks() {
    var homeHref = new URL("../index.html", window.location.href).href;
    document.querySelectorAll(".home-logo").forEach(function (link) {
      link.href = homeHref;
      if (link.dataset.homeBound === "1") return;
      link.dataset.homeBound = "1";
      link.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.location.assign(homeHref);
        },
        true,
      );
    });
  }

  function buildHeroDevice(imgSrc, siteUrl) {
    var container = document.querySelector(".dp-hero-device");
    if (!container) return;

    var domain = "";
    try { domain = new URL(siteUrl).hostname; } catch (e) { domain = "ourosdesigns.com"; }

    var chrome = document.createElement("div");
    chrome.className = "dp-hero-device-chrome";

    var dots = document.createElement("div");
    dots.className = "dp-hero-device-dots";
    dots.innerHTML = "<span></span><span></span><span></span>";
    chrome.appendChild(dots);

    var url = document.createElement("span");
    url.className = "dp-hero-device-url";
    url.textContent = domain;
    chrome.appendChild(url);

    var screen = document.createElement("div");
    screen.className = "dp-hero-device-screen";
    var img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Site preview";
    img.loading = "eager";
    screen.appendChild(img);

    container.innerHTML = "";
    container.appendChild(chrome);
    container.appendChild(screen);
    container.classList.add("dp-device-active");
  }

  // --- Lightbox ---

  var LIGHTBOX_ICON_SVG = '<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

  function buildLightbox() {
    var overlay = document.createElement("div");
    overlay.className = "dp-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image lightbox");

    var closeBtn = document.createElement("button");
    closeBtn.className = "dp-lightbox-close";
    closeBtn.setAttribute("aria-label", "Close lightbox");
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var imgWrap = document.createElement("div");
    imgWrap.className = "dp-lightbox-img-wrap";

    var img = document.createElement("img");
    img.alt = "";
    imgWrap.appendChild(img);

    overlay.appendChild(closeBtn);
    overlay.appendChild(imgWrap);
    document.body.appendChild(overlay);

    var zoomed = false;

    function open(src, alt) {
      img.src = src;
      img.alt = alt || "";
      img.style.transform = "";
      img.style.width = "";
      img.style.height = "";
      zoomed = false;
      imgWrap.scrollTop = 0;
      imgWrap.scrollLeft = 0;
      overlay.classList.add("dp-lightbox-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove("dp-lightbox-open");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === imgWrap) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("dp-lightbox-open")) {
        close();
      }
    });

    img.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!zoomed) {
        var natW = Math.max(img.naturalWidth, img.offsetWidth * 1.5);
        var natH = Math.max(img.naturalHeight, img.offsetHeight * 1.5);
        img.style.width = natW + "px";
        img.style.height = natH + "px";
        img.style.maxWidth = "none";
        img.style.maxHeight = "none";
        imgWrap.style.cursor = "grab";
        imgWrap.style.overflow = "auto";
        zoomed = true;
      } else {
        img.style.width = "";
        img.style.height = "";
        img.style.maxWidth = "";
        img.style.maxHeight = "";
        imgWrap.style.cursor = "";
        imgWrap.style.overflow = "";
        imgWrap.scrollTop = 0;
        imgWrap.scrollLeft = 0;
        zoomed = false;
      }
    });

    var dragging = false, startX, startY, scrollL, scrollT;
    imgWrap.addEventListener("mousedown", function (e) {
      if (e.target !== img) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollL = imgWrap.scrollLeft;
      scrollT = imgWrap.scrollTop;
      imgWrap.style.cursor = "grabbing";
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      imgWrap.scrollLeft = scrollL - (e.clientX - startX);
      imgWrap.scrollTop = scrollT - (e.clientY - startY);
    });
    window.addEventListener("mouseup", function () {
      if (dragging) {
        dragging = false;
        imgWrap.style.cursor = zoomed ? "grab" : "";
      }
    });

    return { open: open, close: close };
  }

  function addLightboxTrigger(wrapEl, imgEl, lightbox) {
    wrapEl.classList.add("dp-lightbox-trigger");

    var icon = document.createElement("span");
    icon.className = "dp-lightbox-icon";
    icon.innerHTML = LIGHTBOX_ICON_SVG;
    icon.setAttribute("aria-hidden", "true");
    wrapEl.appendChild(icon);

    wrapEl.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      lightbox.open(imgEl.src, imgEl.alt);
    });
  }

  // --- GSAP Animations ---

  function initAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    animateProgress();
    animateHero();
    animateOverview();
    animateApproach();
    animateDesign();
    animateOutcome();
    animateExplore();
  }

  function animateProgress() {
    gsap.to(".dp-progress-fill", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }

  function animateHero() {
    var content = document.querySelector(".dp-hero-content");
    if (content) {
      gsap.from(content.children, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.25,
      });
    }

    var indicator = document.querySelector(".dp-hero .scroll-indicator");
    if (indicator) {
      gsap.from(indicator, {
        opacity: 0,
        y: 10,
        duration: 0.6,
        delay: 1,
        ease: "power2.out",
      });
    }

    gsap.to(".dp-hero-bg", {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".dp-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".dp-hero-content", {
      y: -60,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".dp-hero",
        start: "60% center",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".dp-hero .scroll-indicator", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".dp-hero",
        start: "20% top",
        end: "40% top",
        scrub: true,
      },
    });
  }

  function animateOverview() {
    var desc = document.querySelector(".dp-overview-desc");
    if (desc) {
      gsap.from(desc, {
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: desc,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var items = document.querySelectorAll(".dp-meta-item");
    if (items.length) {
      gsap.from(items, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".dp-meta-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }

  function animateApproach() {
    var section = document.querySelector(".dp-approach");
    if (!section || section.classList.contains("dp-hidden")) return;

    var blocks = section.querySelectorAll(".dp-approach-block");
    var stepFill = section.querySelector(".dp-step-fill");
    var stepCount = section.querySelector(".dp-step-count");
    var total = blocks.length;

    blocks.forEach(function (block, i) {
      var inner = block.querySelector(".dp-approach-block-inner");
      if (inner) {
        gsap.from(inner, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
        });
      }

      ScrollTrigger.create({
        trigger: block,
        start: "top 52%",
        end: "bottom 52%",
        onEnter: function () {
          updateStep(i);
        },
        onEnterBack: function () {
          updateStep(i);
        },
      });
    });

    function updateStep(index) {
      if (stepFill) {
        stepFill.style.width = ((index + 1) / total) * 100 + "%";
      }
      if (stepCount) {
        stepCount.textContent =
          String(index + 1).padStart(2, "0") +
          " / " +
          String(total).padStart(2, "0");
      }
    }
  }

  function animateDesign() {
    var section = document.querySelector(".dp-design");
    if (!section || section.classList.contains("dp-hidden")) return;

    var blocks = section.querySelectorAll(".dp-design-block");
    var images = section.querySelectorAll(".dp-design-img-container .dp-design-img-wrap");

    blocks.forEach(function (block, i) {
      var inner = block.querySelector(".dp-design-block-inner");
      if (inner) {
        gsap.from(inner, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (images.length > 1) {
        ScrollTrigger.create({
          trigger: block,
          start: "top 52%",
          end: "bottom 52%",
          onEnter: function () {
            setActiveImage(i);
          },
          onEnterBack: function () {
            setActiveImage(i);
          },
        });
      }
    });

    function setActiveImage(index) {
      images.forEach(function (img, j) {
        img.classList.toggle("dp-img-active", j === index);
      });
    }
  }

  function animateOutcome() {
    var section = document.querySelector(".dp-outcome");
    if (!section || section.classList.contains("dp-hidden")) return;

    var content = section.querySelector(".dp-outcome-content");
    if (content) {
      gsap.from(content.children, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: content,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });
    }

    var media = section.querySelector(".dp-outcome-media img, .dp-outcome-media video");
    if (media) {
      gsap.from(media, {
        scale: 1.08,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }
  }

  function animateExplore() {
    var cards = document.querySelectorAll(".dp-explore-card");
    if (!cards.length) return;

    gsap.from(cards, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".dp-explore",
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
