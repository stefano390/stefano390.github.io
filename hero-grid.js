const glow = document.querySelector(".page-grid-glow");
const interactiveGrid = matchMedia("(any-hover: hover) and (prefers-reduced-motion: no-preference)");

window.addEventListener("pointermove", (event) => {
  if (!interactiveGrid.matches || event.pointerType === "touch") return;

  glow.style.setProperty("--grid-x", `${event.clientX}px`);
  glow.style.setProperty("--grid-y", `${event.clientY}px`);
  glow.classList.add("is-lit");
});

function dimGrid() {
  glow.classList.remove("is-lit");
}

document.documentElement.addEventListener("pointerleave", dimGrid);
window.addEventListener("blur", dimGrid);
interactiveGrid.addEventListener("change", dimGrid);
