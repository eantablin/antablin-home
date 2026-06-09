/* =====================================================================
   ui.js — interactions, choreography, and the 2D hero fallback
   ===================================================================== */

const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- footer year ---------- */
export function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ---------- preloader ---------- */
export function initPreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  const countEl = document.getElementById("preCount");
  const barEl = document.getElementById("preBar");

  const start = performance.now();
  const minDur = REDUCE ? 400 : 1800;
  let fontsReady = false;
  let done = false;

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    fontsReady = true;
  });

  function frame(now) {
    const elapsed = now - start;
    let target = (elapsed / minDur) * 100;
    if (!fontsReady) target = Math.min(target, 96);
    target = Math.max(0, Math.min(target, 100));
    const pct = Math.floor(target);
    if (countEl) countEl.textContent = String(pct).padStart(2, "0");
    if (barEl) barEl.style.width = pct + "%";

    if (elapsed >= minDur && fontsReady) {
      if (countEl) countEl.textContent = "100";
      if (barEl) barEl.style.width = "100%";
      finish();
      return;
    }
    requestAnimationFrame(frame);
  }

  function finish() {
    if (done) return;
    done = true;
    setTimeout(() => {
      el.classList.add("is-done");
      document.body.classList.add("loaded");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
      setTimeout(() => el.parentNode && el.remove(), 1200); // safety
    }, 220);
  }

  requestAnimationFrame(frame);
  setTimeout(finish, 5000); // hard cap — never trap the user
}

/* ---------- nav ---------- */
export function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // active-section underline
  const linkMap = new Map();
  document.querySelectorAll(".nav__links a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) linkMap.set(href.slice(1), a);
  });
  const sections = [...linkMap.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          linkMap.forEach((a) => a.classList.remove("is-active"));
          const a = linkMap.get(e.target.id);
          if (a) a.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }
}

/* ---------- scroll progress ruler ---------- */
export function initScrollRuler() {
  const fill = document.getElementById("scrollFill");
  if (!fill) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

/* ---------- scroll reveals ---------- */
export function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((e) => io.observe(e));
}

/* ---------- count-up stats ----------
   Numeric stats carry data-count (+ optional data-prefix/suffix/decimals).
   String stats render statically and are simply skipped here.            */
export function initStats() {
  const nums = document.querySelectorAll(".stat__num[data-count]");
  if (!nums.length) return;

  const fmt = (v, decimals) =>
    decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));

  const run = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const paint = (n) => (el.textContent = prefix + fmt(n, decimals) + suffix);

    if (REDUCE) {
      paint(target);
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      paint(eased * target);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(run);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
}

/* ---------- magnetic buttons ---------- */
export function initMagnetic() {
  if (!FINE || REDUCE) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.32;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ---------- 3D card tilt + shine ---------- */
export function initTilt() {
  if (!FINE || REDUCE) return;
  document.querySelectorAll(".tilt").forEach((card) => {
    const max = 5;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- custom cursor (desktop / fine pointer only) ---------- */
export function initCursor() {
  if (!FINE || REDUCE) return;
  const cursor = document.getElementById("cursor");
  const readout = document.getElementById("cursorReadout");
  if (!cursor) return;
  document.body.classList.add("has-cursor");

  const label = document.createElement("span");
  label.className = "cursor__label";
  cursor.querySelector(".cursor__ring").appendChild(label);

  let mx = innerWidth / 2,
    my = innerHeight / 2,
    cx = mx,
    cy = my;

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (readout)
        readout.textContent =
          "x:" +
          String(Math.round(mx)).padStart(3, "0") +
          " y:" +
          String(Math.round(my)).padStart(3, "0");
    },
    { passive: true }
  );

  (function frame() {
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(frame);
  })();

  document.querySelectorAll("a, button, [data-cursor]").forEach((t) => {
    t.addEventListener("pointerenter", () => {
      document.body.classList.add("cursor-active");
      // accent the cursor to the hovered element's field, if any
      const accent = getComputedStyle(t).getPropertyValue("--accent").trim();
      cursor.style.setProperty("--cursor-accent", accent || "");
      label.textContent = t.getAttribute("data-cursor") || "";
    });
    t.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-active");
      cursor.style.removeProperty("--cursor-accent");
      label.textContent = "";
    });
  });

  document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
  document.addEventListener("mouseenter", () => (cursor.style.opacity = "1"));
}

/* ---------- background grid parallax ---------- */
export function initGridParallax() {
  if (!FINE || REDUCE) return;
  const grid = document.querySelector(".bp-grid");
  if (!grid) return;
  window.addEventListener(
    "pointermove",
    (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      grid.style.transform = `translate3d(${x * -18}px, ${y * -18}px, 0)`;
    },
    { passive: true }
  );
}

/* ---------- 2D constellation fallback (no WebGL) ---------- */
export function init2DHero(canvas, { reduce = REDUCE } = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.classList.add("is-ready");
    return;
  }
  let w, h, dpr, raf;
  let particles = [];

  function build() {
    const count = Math.min(120, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const d = dx * dx + dy * dy;
        if (d < 14000) {
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d / 14000) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(236,215,160,0.85)";
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  canvas.classList.add("is-ready");
  draw();

  document.addEventListener("visibilitychange", () => {
    if (reduce) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(draw);
  });
}
