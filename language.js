const toggle = document.querySelector(".language");
const translations = Array.from(document.querySelectorAll("[data-en]"), (element) => ({
  element,
  es: element.textContent,
  en: element.dataset.en,
}));

function setLanguage(language) {
  document.documentElement.lang = language;
  for (const translation of translations) {
    translation.element.textContent = translation[language];
  }

  const isSpanish = language === "es";
  toggle.textContent = isSpanish ? "EN" : "ES";
  toggle.setAttribute("aria-label", isSpanish ? "Switch to English" : "Cambiar a español");
  toggle.lang = isSpanish ? "en" : "es";
}

try {
  if (localStorage.getItem("pref-lang") === "en") {
    setLanguage("en");
  }
} catch {
  // Language switching remains available when storage is blocked.
}

toggle.hidden = false;
toggle.addEventListener("click", () => {
  const nextLanguage = document.documentElement.lang === "es" ? "en" : "es";
  setLanguage(nextLanguage);
  try {
    localStorage.setItem("pref-lang", nextLanguage);
  } catch {
    // Persistence is optional.
  }
});
