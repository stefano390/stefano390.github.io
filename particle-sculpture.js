(() => {
  const canvas = document.querySelector(".sculpture");
  const context = canvas.getContext("2d");
  if (!context) return;

  const stencil = document.createElement("canvas");
  stencil.width = 230;
  stencil.height = 120;
  const ink = stencil.getContext("2d", { willReadFrequently: true });
  if (!ink) return;

  const control = document.querySelector(".sculpture-control");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["#ae596d", "#dc7580", "#ff9b86", "#ffc094", "#ffe7bd"];
  const particles = [];
  const fullTurn = Math.PI * 2;
  const introDuration = 3300;
  let width = 0;
  let height = 0;
  let yaw = -0.23;
  let pitch = 0.09;
  let introStart;
  let introComplete = motion.matches;
  let frame = 0;
  let drag;

  // Sample the monogram on a grid and add three layers to give it depth.
  ink.font = "900 116px system-ui";
  ink.textAlign = "center";
  ink.textBaseline = "middle";
  ink.fillText("SM.", stencil.width / 2, stencil.height / 2, stencil.width - 12);
  const pixels = ink.getImageData(0, 0, stencil.width, stencil.height).data;
  for (let y = 0; y < stencil.height; y += 3) {
    for (let x = 0; x < stencil.width; x += 3) {
      if (pixels[(y * stencil.width + x) * 4 + 3] < 128) continue;

      for (const layer of [0, 1, 2]) {
        particles.push({
          x: (x - stencil.width / 2) / 69 + layer * 0.01,
          y: (y - stencil.height / 2) / 69 + layer * 0.01,
          z: (layer - 1) * 0.23,
          scatter: 1.2 + Math.sin(x * 2.3 + y * 5.1 + layer) ** 2,
        });
      }
    }
  }

  function draw(now) {
    frame = 0;
    introStart ??= now;
    const progress = introComplete ? 1 : Math.min(1, (now - introStart) / introDuration);
    introComplete = progress === 1;
    const spread = (1 - progress) ** 3;
    const spin = yaw - spread * 1.9;
    const sinY = Math.sin(spin);
    const cosY = Math.cos(spin);
    const sinX = Math.sin(pitch);
    const cosX = Math.cos(pitch);
    const scale = Math.min(width * 0.235, height * 0.42);
    const layers = palette.map(() => []);

    for (const particle of particles) {
      const inflation = 1 + particle.scatter * spread;
      const x = (particle.x * cosY + particle.z * sinY) * inflation;
      const depth = (particle.z * cosY - particle.x * sinY) * inflation;
      const y = particle.y * inflation * cosX - depth * sinX;
      const z = particle.y * inflation * sinX + depth * cosX;
      const perspective = 5 / (5 - Math.max(-2.2, Math.min(2.2, z)));
      const shade = Math.floor((z + 0.65) * 3.6);
      const layer = Math.max(0, Math.min(palette.length - 1, shade));
      layers[layer].push({
        x: width * 0.5 + x * scale * perspective,
        y: height * 0.46 + y * scale * perspective,
        size: Math.max(0.65, scale * 0.017) * perspective,
      });
    }

    context.clearRect(0, 0, width, height);
    for (const [index, layer] of layers.entries()) {
      context.fillStyle = palette[index];
      context.beginPath();
      for (const point of layer) {
        context.moveTo(point.x + point.size, point.y);
        context.arc(point.x, point.y, point.size, 0, fullTurn);
      }
      context.fill();
    }

    if (!introComplete) requestDraw();
  }

  function requestDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    requestDraw();
  }

  canvas.hidden = false;
  control.hidden = false;
  document.querySelector(".monogram").hidden = true;
  new ResizeObserver(resize).observe(canvas);

  canvas.addEventListener("pointerdown", (event) => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    introComplete = true;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    requestDraw();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== drag?.id) return;
    yaw += (event.clientX - drag.x) * 0.012;
    pitch += (event.clientY - drag.y) * 0.012;
    drag.x = event.clientX;
    drag.y = event.clientY;
    requestDraw();
  });

  canvas.addEventListener("lostpointercapture", (event) => {
    if (event.pointerId === drag?.id) drag = undefined;
  });

  control.addEventListener("click", () => {
    introComplete = true;
    yaw += Math.PI / 4;
    requestDraw();
  });

  motion.addEventListener("change", () => {
    if (motion.matches) {
      introComplete = true;
      requestDraw();
    }
  });
})();
