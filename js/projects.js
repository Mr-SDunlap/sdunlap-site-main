window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".project-container");
  if (!container) return;

  const existingCards = Array.from(container.querySelectorAll(".project"));
  if (!existingCards.length) return;

  const template = existingCards[0];

  fetch("./data/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load projects.json: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const projects = Array.isArray(data?.projects) ? data.projects : [];
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
      });

      if (existingCards.length > projects.length) {
        for (let i = projects.length; i < existingCards.length; i += 1) {
          existingCards[i].remove();
        }
      }

      if (typeof gsap !== "undefined") {
        const cards = container.querySelectorAll(
          ":scope > .project:not(:first-child)",
        );

        cards.forEach((card) => {
          if (card.dataset.gsapHover === "true") return;
          card.dataset.gsapHover = "true";

          const targets = [
            card.querySelector(".project-description"),
            card.querySelector(".tools-used"),
          ].filter(Boolean);

          if (!targets.length) return;

          gsap.set(targets, { height: 0, opacity: 0, overflow: "hidden" });

          card.addEventListener("mouseenter", () => {
            gsap.to(targets, {
              height: "auto",
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
              overwrite: true,
            });
          });

          card.addEventListener("mouseleave", () => {
            gsap.to(targets, {
              height: 0,
              opacity: 0,
              duration: 0.25,
              ease: "power2.in",
              overwrite: true,
            });
          });
        });
      }
    })
    .catch((error) => {
      console.warn("Projects list failed to load.", error);
    });
});
