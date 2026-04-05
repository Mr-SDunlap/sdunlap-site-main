window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".project-container");
  if (!container) return;

  const existingCards = Array.from(container.querySelectorAll(".project"));
  if (!existingCards.length) return;

  const template = existingCards[0];

  // Simple slugify to build dynamic page links consistently
  const slugify = (s) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  fetch("./data/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load projects.json: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Support both { projects: [...] } and bare [ ... ] JSON shapes
      const projects = Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data)
          ? data
          : [];
      if (!projects.length) return;

      projects.forEach((project, index) => {
        const card = existingCards[index] || template.cloneNode(true);
        if (!existingCards[index]) {
          container.appendChild(card);
        }

        const nameEl = card.querySelector(".project-name");
        if (nameEl) nameEl.textContent = project.projectName || "";

        const numberEl = card.querySelector(".project-number");
        if (numberEl) {
          const fallbackNumber = String(index + 1).padStart(2, "0");
          numberEl.textContent = project.number || fallbackNumber;
        }
        // The card itself is the anchor (.project); set href on it.
        let linkEl = card.matches(".project")
          ? card
          : card.querySelector(".project");
        if (!linkEl && card.closest) linkEl = card.closest(".project");
        if (linkEl) {
          // Route all projects to the dynamic page using a derived slug
          const slug =
            project.slug || slugify(project.projectName || project.name || "");
          const url = slug
            ? `archive/dynamic-project-page.html?slug=${encodeURIComponent(slug)}`
            : "#";
          linkEl.setAttribute("href", url);
          // Debugging aid (remove if noisy)
          // console.debug("Set project href", project.projectName, url);
          // Dynamic internal links should not open in a new tab
          linkEl.removeAttribute("target");
          linkEl.removeAttribute("rel");
          // Helpful label for accessibility
          const label = project.projectName
            ? `Open ${project.projectName}`
            : "Open project";
          linkEl.setAttribute("aria-label", label);
        }

        const descriptionEl = card.querySelector(".project-description");
        if (descriptionEl)
          descriptionEl.textContent = project.description || "";

        const imageEl = card.querySelector(".project-bg-image");
        if (imageEl) {
          const imageSrc = project.image || "";
          if ("src" in imageEl) {
            imageEl.src = imageSrc;
            imageEl.alt = project.projectName
              ? `${project.projectName} preview`
              : "Project image";
          } else {
            imageEl.style.backgroundImage = imageSrc
              ? `url("${imageSrc}")`
              : "none";
          }
        }

        const toolsList = card.querySelector(".tools-used");
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

        // Attach reveal direction class: odd (1-based) -> left, even -> right
        const target = linkEl || card;
        if (target) {
          target.classList.remove("reveal-left", "reveal-right");
          const isOdd = index % 2 === 0; // index 0 -> 1st (odd)
          target.classList.add(isOdd ? "reveal-left" : "reveal-right");
        }
      });

      if (existingCards.length > projects.length) {
        for (let i = projects.length; i < existingCards.length; i += 1) {
          existingCards[i].remove();
        }
      }

      // Wire up reveal animations for newly added cards
      if (window.RevealFx && typeof window.RevealFx.refresh === "function") {
        window.RevealFx.refresh();
      }

      // Ensure GSAP ScrollTrigger recalculates pin spacing after dynamic content
      // is injected; without this, the archive pin may end too early and hide
      // content that follows (e.g., the footer).
      if (
        window.ScrollTrigger &&
        typeof window.ScrollTrigger.refresh === "function"
      ) {
        window.ScrollTrigger.refresh();
      }
    })
    .catch((error) => {
      console.warn("Projects list failed to load.", error);
    });
});
