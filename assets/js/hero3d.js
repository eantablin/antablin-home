/* =====================================================================
   hero3d.js — the WebGL centerpiece.
   A rotating wireframe structure (gold "node diagram") inside a faint
   boundary lattice, wrapped in a drifting particle field. Optional bloom
   on capable devices. Pauses when offscreen or the tab is hidden.
   ===================================================================== */

export async function initHero(canvas, options = {}) {
  const { reduce = false, lowPower = false } = options;
  const THREE = await import("three");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e16, 0.052);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const COL_GOLD = new THREE.Color(0xc9a84c);
  const COL_GOLD_BRIGHT = new THREE.Color(0xecd7a0);

  // ---- core structure: icosahedron wireframe + vertex nodes ----
  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(3, 1);
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreGeo),
    new THREE.LineBasicMaterial({ color: COL_GOLD, transparent: true, opacity: 0.72 })
  );
  group.add(core);

  const nodes = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      coreGeo.getAttribute("position").clone()
    ),
    new THREE.PointsMaterial({
      color: COL_GOLD_BRIGHT,
      size: 0.1,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    })
  );
  group.add(nodes);

  // a small inner tetra spinning the other way, for depth
  const innerCore = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.4, 0)),
    new THREE.LineBasicMaterial({ color: COL_GOLD_BRIGHT, transparent: true, opacity: 0.5 })
  );
  group.add(innerCore);

  // ---- outer boundary lattice ----
  const boundary = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.4, 1)),
    new THREE.LineBasicMaterial({ color: COL_GOLD, transparent: true, opacity: 0.1 })
  );
  scene.add(boundary);

  // ---- drifting particle field ----
  const count = lowPower ? 280 : 950;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 6 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  const field = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({
      color: 0x9fb6d4,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  scene.add(field);

  // ---- optional bloom (skip on low-power / reduced-motion) ----
  let composer = null;
  if (!lowPower && !reduce) {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
        await Promise.all([
          import("three/addons/postprocessing/EffectComposer.js"),
          import("three/addons/postprocessing/RenderPass.js"),
          import("three/addons/postprocessing/UnrealBloomPass.js"),
          import("three/addons/postprocessing/OutputPass.js"),
        ]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.5, 0.18)
      );
      composer.addPass(new OutputPass());
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (e) {
      composer = null; // fall back to plain rendering
    }
  }

  // ---- state ----
  const clock = new THREE.Clock();
  let elapsed = 0;
  let running = false;
  let raf = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    const w = canvas.clientWidth || canvas.offsetWidth;
    const h = canvas.clientHeight || canvas.offsetHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    if (!running) render();
  }

  function render() {
    composer ? composer.render() : renderer.render(scene, camera);
  }

  function tick() {
    elapsed += clock.getDelta();
    const t = elapsed;

    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;

    group.rotation.y = t * 0.12 + ptr.x * 0.42;
    group.rotation.x = Math.sin(t * 0.18) * 0.16 + ptr.y * 0.24;
    innerCore.rotation.y = -t * 0.35;
    innerCore.rotation.z = t * 0.22;
    boundary.rotation.y = -t * 0.05;
    boundary.rotation.z = t * 0.03;
    field.rotation.y = t * 0.018;

    camera.position.x += (ptr.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-ptr.y * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    render();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    clock.getDelta(); // discard the gap so motion doesn't jump
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  // ---- listeners ----
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0.01 }
    ).observe(canvas);
  }

  // ---- go ----
  resize();
  canvas.classList.add("is-ready");
  if (reduce) {
    group.rotation.set(-0.18, 0.5, 0);
    render();
  } else {
    start();
  }

  return true;
}
