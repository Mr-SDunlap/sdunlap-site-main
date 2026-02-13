const renderProjectInformation = (project) => {
  const container = document.querySelector(".project-information");
  if (!container || !project) return;

  const nameFill = container.querySelector(".name-fill");
  const roleFill = container.querySelector(".role-fill");
  const toolsFill = container.querySelector(".tools-fill");
  const descriptionFill = container.querySelector(".description-fill");

  if (nameFill) {
    nameFill.textContent = project.projectName ?? "";
  }

  if (roleFill) {
    roleFill.textContent = project.role ?? "";
  }

  if (descriptionFill) {
    descriptionFill.textContent = project.description ?? "";
  }

  if (toolsFill) {
    toolsFill.innerHTML = "";
    const tools = Array.isArray(project.toolsUsed)
      ? project.toolsUsed
      : [];
    if (tools.length) {
      const list = document.createElement("ul");
      list.className = "tools-list";
      tools.forEach((tool) => {
        const item = document.createElement("li");
        item.textContent = tool;
        list.appendChild(item);
      });
      toolsFill.appendChild(list);
    }
  }
};

const loadProjects = async () => {
  try {
    const response = await fetch("./data/projects.json", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to load projects.json (${response.status})`);
    }
    const data = await response.json();
    const project = Array.isArray(data.projects) ? data.projects[0] : null;
    renderProjectInformation(project);
  } catch (error) {
    console.error("Error loading project data:", error);
  }
};

window.addEventListener("DOMContentLoaded", loadProjects);
