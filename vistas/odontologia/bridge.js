if (parent === window) location.replace("index.html");

function escapeCell(value) {
  const cell = document.createElement("span");
  cell.textContent = value;
  return cell.innerHTML;
}

// Conserva los callbacks de los formularios originales dentro de esta pestaña.
function demoRun() {
  let success;
  let failure = error => alert(error.message);
  const run = {
    withSuccessHandler(callback) { success = callback; return run; },
    withFailureHandler(callback) { failure = callback; return run; },
  };
  for (const [name, handler] of Object.entries(parent.dentalDemo)) {
    run[name] = (...args) => {
      try { success(handler(...args)); } catch (error) { failure(error); }
    };
  }
  return run;
}
