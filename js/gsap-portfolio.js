gsap.registerPlugin(ScrollTrigger);

const initPortfolio = async () => {
    const section = document.querySelector('#section_files');
    const visualsContainer = document.querySelector('.project-visuals');
    // Using the same selectors as in the HTML for the update targets
    const nameFill = document.querySelector('.name-fill');
    const roleFill = document.querySelector('.role-fill');
    const toolsList = document.querySelector('.tools-list'); // Changed from .tools-fill
    // Select the button specifically inside the project info container
    const projectCta = document.querySelector('.project-link-container .primary-btn');

    if (!section || !visualsContainer) return;

    // Fetch data
    let projects = [];
    try {
        const response = await fetch('./data/projects.json');
        const data = await response.json();
        projects = data.projects;
    } catch (e) {
        console.error("Failed to load projects", e);
        return;
    }

    if (!projects.length) return;

    // Clear existing placeholder
    visualsContainer.innerHTML = '';

    // Render Images
    projects.forEach((project, index) => {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('image-wrapper');
        imgWrapper.dataset.index = index;

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.projectName;
        img.classList.add('project-image');

        imgWrapper.appendChild(img);
        visualsContainer.appendChild(imgWrapper);
    });

    // Initial Data Set
    updateProjectInfo(projects[0]);

    // Create ScrollTriggers for each image
    const images = document.querySelectorAll('.image-wrapper');

    // We want the text to change when the image comes into center view
    images.forEach((img, i) => {
        // Image Entrance Animation
        const pic = img.querySelector('.project-image');
        if (pic) {
            gsap.from(pic, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 90%",
                    end: "top 40%",
                    scrub: 1
                },
                scale: 0.8,
                opacity: 0,
                ease: "power2.out"
            });
        }

        // Project Info Update
        ScrollTrigger.create({
            trigger: img,
            start: "top center",
            end: "bottom center",
            onEnter: () => updateProjectInfo(projects[i]),
            onEnterBack: () => updateProjectInfo(projects[i]),
            markers: false, // Turn on for debugging
            toggleClass: "active"
        });
    });

    // Refresh ScrollTrigger to recalculate positions now that content is loaded
    ScrollTrigger.refresh();

    function updateProjectInfo(project) {
        if (!project) return;



        // Redoing scramble logic to be cleaner
        const animateText = (element, text) => {
            if (!element) return;
            // Use a simple fade out/in with text swap if scramble is too complex to proxy perfectly without plugin
            // Or try a simple character randomization
            const chars = "!<>-_\\/[]{}—=+*^?#________";
            const duration = 1;

            let iteration = 0;

            gsap.to(element, {
                duration: duration,
                onUpdate: function () {
                    const progress = this.progress();
                    const len = text.length;
                    const numScramble = Math.floor((1 - progress) * len);

                    let result = text.substring(0, len - numScramble);
                    for (let i = 0; i < numScramble; i++) {
                        result += chars[Math.floor(Math.random() * chars.length)];
                    }
                    element.innerText = result;
                },
                onComplete: () => { element.innerText = text; }
            });
        };

        if (nameFill) animateText(nameFill, project.projectName);
        if (roleFill) animateText(roleFill, project.role);

        if (projectCta) {
            projectCta.href = project.link;
            projectCta.innerText = project.button || "Explore";
        }

        // Tools list
        if (toolsList) {
            toolsList.innerHTML = ''; // Clear previous content
            if (Array.isArray(project.toolsUsed)) {
                project.toolsUsed.forEach(tool => {
                    const li = document.createElement('li');
                    li.innerText = tool;
                    toolsList.appendChild(li);
                });
            } else {
                // If it's a string, just put it in a single li
                const li = document.createElement('li');
                li.innerText = project.toolsUsed;
                toolsList.appendChild(li);
            }

            // Stagger animation for list items
            gsap.fromTo(toolsList.children,
                { opacity: 0, y: 5 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }
            );
        }
    }
};

window.addEventListener('DOMContentLoaded', initPortfolio);
