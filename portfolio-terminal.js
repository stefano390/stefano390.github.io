(() => {
  const terminal = document.querySelector("#terminal");
  const output = terminal.querySelector(".terminal-output");
  const form = terminal.querySelector("form");
  const input = form.querySelector("input");
  const projects = Array.from(document.querySelectorAll(".project"));
  const history = [];
  let historyIndex = 0;

  function append(container, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    container.append(element);
    return element;
  }

  function showProject(container, project, english) {
    append(container, "strong", project.querySelector("h3").textContent);
    append(container, "p", project.querySelector(".project-copy").textContent);
    const link = project.querySelector(".project-link");
    if (link) {
      append(container, "a", link.querySelector("span").textContent).href = link.href;
    } else {
      append(container, "p", english ? "Private project" : "Proyecto privado");
    }
  }

  function run(command) {
    const text = command.trim();
    if (!text) return;

    if (text !== history.at(-1)) history.push(text);
    historyIndex = history.length;
    input.value = "";
    const normalized = text.toLowerCase().replace(/\s+/g, " ");
    if (normalized === "clear") {
      output.replaceChildren();
      return;
    }

    const english = document.documentElement.lang === "en";
    const response = document.createElement("div");
    response.lang = english ? "en" : "es";
    append(response, "p", "$ " + text).className = "terminal-echo";

    if (normalized === "help") {
      append(response, "p", english
        ? "projects lists the catalog. project N shows project N. clear clears the screen."
        : "projects lista el catálogo. project N muestra la ficha número N. clear limpia la pantalla.");
    } else if (normalized === "projects") {
      const list = append(response, "ol", "");
      for (const project of projects) {
        append(list, "li", project.querySelector("h3").textContent);
      }
    } else {
      const match = /^project (\d+)$/.exec(normalized);
      const project = match && projects[Number(match[1]) - 1];
      if (project) {
        showProject(response, project, english);
      } else {
        append(response, "p", english
          ? "Try help for available commands or projects for valid project numbers."
          : "Probá help para ver los comandos o projects para consultar los números del catálogo.");
      }
    }

    output.append(response);
    output.scrollTop = response.offsetTop;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const step = event.key === "ArrowUp" ? -1 : 1;
    historyIndex = Math.min(history.length, Math.max(0, historyIndex + step));
    input.value = history[historyIndex] ?? "";
  });
  terminal.querySelector(".terminal-commands").addEventListener("click", (event) => {
    const button = event.target.closest("[data-command]");
    if (button) run(button.dataset.command);
  });

  terminal.hidden = false;
  document.querySelector(".terminal-shortcut").hidden = false;
})();
