const navButton = document.querySelector(".nav-toggle");
const siteNav = document.getElementById(navButton.getAttribute("aria-controls"));
const compactNav = matchMedia("(max-width: 740px)");

function setNavLayout() {
  navButton.hidden = !compactNav.matches;
  navButton.setAttribute("aria-expanded", "false");
  if (compactNav.matches && siteNav.contains(document.activeElement)) navButton.focus();
}

navButton.addEventListener("click", () => {
  const expanded = navButton.getAttribute("aria-expanded") === "true";
  navButton.setAttribute("aria-expanded", String(!expanded));
});

siteNav.addEventListener("click", event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !compactNav.matches) return;
  const target = document.getElementById(link.hash.slice(1));
  if (target) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  navButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("click", event => {
  if (navButton.getAttribute("aria-expanded") === "true" && !event.target.closest(".site-header")) {
    navButton.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navButton.getAttribute("aria-expanded") === "true") {
    navButton.setAttribute("aria-expanded", "false");
    navButton.focus();
  }
});

compactNav.addEventListener("change", setNavLayout);
setNavLayout();
