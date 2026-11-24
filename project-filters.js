(() => {
  const filters = document.querySelector(".project-filters");
  const choices = Array.from(filters.querySelectorAll("button"));
  const catalog = document.querySelector("#catalogo-proyectos");
  const projects = Array.from(catalog.querySelectorAll(".project"));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let selected = "all";
  let animations = [];

  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const choice = event.target.closest("button[data-filter]");
    if (!choice || choice.dataset.filter === selected) return;

    selected = choice.dataset.filter;
    catalog.dataset.filter = selected;
    for (const button of choices) {
      button.setAttribute("aria-pressed", String(button === choice));
    }

    for (const animation of animations) animation.cancel();
    animations = [];
    const visible = projects.filter((project) => {
      const matches = selected === "all" || project.dataset.category === selected;
      project.hidden = !matches;
      return matches;
    });

    if (reducedMotion.matches) return;
    animations = visible.map((project, index) => project.animate(
      [{ opacity: 0.45, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 260, delay: index * 35, easing: "ease-out", fill: "backwards" },
    ));
  });

  reducedMotion.addEventListener("change", () => {
    for (const animation of animations) animation.cancel();
    animations = [];
  });
})();
