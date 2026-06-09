/* =====================================================================
   boot.js — orchestrator. Wires up interactions and picks the right
   hero renderer for the device (WebGL → 2D canvas → static).
   ===================================================================== */

import {
  setYear,
  initPreloader,
  initNav,
  initScrollRuler,
  initReveal,
  initStats,
  initMagnetic,
  initTilt,
  initCursor,
  initGridParallax,
  init2DHero,
} from "./ui.js";

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const SMALL = matchMedia("(max-width: 860px)").matches;
const LOW_POWER =
  SMALL ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  /Mobi|Android/i.test(navigator.userAgent);

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

async function startHero() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  // accents passed from the markup so the 3D matches the page palette
  let accents = [];
  try {
    accents = JSON.parse(canvas.dataset.accents || "[]");
  } catch (e) {
    accents = [];
  }

  if (supportsWebGL()) {
    try {
      const { initHero } = await import("./hero3d.js");
      await initHero(canvas, { reduce: REDUCE, lowPower: LOW_POWER, accents });
      return;
    } catch (err) {
      console.warn("[antablin] WebGL hero failed — using 2D fallback.", err);
    }
  }
  init2DHero(canvas, { reduce: REDUCE });
}

function boot() {
  setYear();
  initPreloader();
  initNav();
  initScrollRuler();
  initReveal();
  initStats();
  initMagnetic();
  initTilt();
  if (FINE && !REDUCE) {
    initCursor();
    initGridParallax();
  }
  startHero();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
