/* =====================================================================
   hero3d.js — the WebGL centerpiece.
   A gold "family" node-cluster at the center, orbited by three small
   accent-colored satellites — one per field (AI · structures · science) —
   inside a faint boundary lattice and a drifting particle field. Optional
   bloom on capable devices. Pauses when offscreen or the tab is hidden.
   ===================================================================== */

export async function initHero(canvas, options = {}) {
  const { reduce = false, lowPower = false, accents = [] } = options;
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
  scene.fog = new THREE.FogExp2(0x0a0e16, 0.05);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const COL_GOLD = new THREE.Color(0xc9a84c);
  const COL_GOLD_BRIGHT = new THREE.Color(0xecd7a0);

  // ---- core "family" structure: icosahedron wireframe + vertex nodes ----
  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(2.7, 1);
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreGeo),
    new THREE.LineBasicMaterial({ color: COL_GOLD, transparent: true, opacity: 0.5 })
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

  const innerCore = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 0)),
    new THREE.LineBasicMaterial({ color: COL_GOLD_BRIGHT, transparent: true, opacity: 0.32 })
  );
  group.add(innerCore);

  // ---- three orbiting satellites, one per field ----
  const palette =
    accents.length === 3 ? accents : ["#46e0ff", "#f2a14b", "#8f9bff"];
  const satellites = palette.map((hex, i) => {
    const color = new THREE.Color(hex);
    const sat = new THREE.Group();

    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 0)),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
    );
    const dot = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3)
      ),
      new THREE.PointsMaterial({
        color,
        size: 0.34,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    sat.add(shell, dot);

    // a faint connecting tether back toward the core
    const link = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.16 })
    );
    scene.add(link);

    scene.add(sat);
    return {
      sat,
      link,
      radius: 4.5,
      speed: 0.22 + i * 0.05,
      phase: (i / 3) * Math.PI * 2,
      tilt: 0.5 + i * 0.5,
    };
  });

  // ---- outer boundary lattice ----
  const boundary = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.6, 1)),
    new THREE.LineBasicMaterial({ color: COL_GOLD, transparent: true, opacity: 0.09 })
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
      opacity: 0.5,
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
          import("three/examples/jsm/postprocessing/EffectComposer.js"),
          import("three/examples/jsm/postprocessing/RenderPass.js"),
          import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
          import("three/examples/jsm/postprocessing/OutputPass.js"),
        ]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.5, 0.18));
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
  const tmp = new THREE.Vector3();

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

  function positionSatellites(t) {
    satellites.forEach((s) => {
      const a = t * s.speed + s.phase;
      const x = Math.cos(a) * s.radius;
      const z = Math.sin(a) * s.radius;
      const y = Math.sin(a * 1.3) * s.tilt;
      s.sat.position.set(x, y, z);
      s.sat.rotation.y = a * 2;
      s.sat.rotation.x = a;
      // update tether endpoints
      const p = s.link.geometry.attributes.position;
      tmp.set(x, y, z);
      p.setXYZ(1, tmp.x, tmp.y, tmp.z);
      p.needsUpdate = true;
    });
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
    positionSatellites(t);

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
    positionSatellites(2.2);
    render();
  } else {
    start();
  }

  return true;
}
