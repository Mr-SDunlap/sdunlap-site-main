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
    setText(".project-title", project.projectName);
    setText(".project-description", project.description || "");
    setText(".summary", project.outcome || project.role || "");
    setBg(".hero-container .bg-image", project.image);

    // Optional sections if you extend JSON later
    setHTML(".ux-subheader", project.ux || "");
    setHTML(".design-subheader", project.design || "");
    setHTML(".outcome-subheader", project.outcome || "");

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
