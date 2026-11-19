// Fade Theory — the one motion moment: a hair specimen whose fade climbs as you scroll.
// Everything else on the page is static. Reduced-motion users get the buttons, no pin, no smoothing.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// ---------------------------------------------------------------- fade stages
// line = where the blend reaches full length (0 top … 1 bottom); skin = bare band at the bottom
const STAGES = [
  { name: "Low fade.", line: 0.76, skin: 0.03, desc: "Blend starts just above the ear and neckline. Keeps weight on the sides and grows out softly." },
  { name: "Mid fade.", line: 0.58, skin: 0.05, desc: "Blend starts at the temple. Short at the bottom, weight kept up top." },
  { name: "High fade.", line: 0.4, skin: 0.07, desc: "Blend climbs to the corner of the head. Sharp contrast with the top." },
  { name: "Skin fade.", line: 0.36, skin: 0.2, desc: "Foiled down to bare skin at the bottom, then blended up through every guard." },
];
const TOP_MM = 25; // scissor length on top

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function stageAt(s) { // s in 0..3, fractional
  const i = Math.min(STAGES.length - 2, Math.floor(s)), t = s - i;
  return { line: lerp(STAGES[i].line, STAGES[i + 1].line, t), skin: lerp(STAGES[i].skin, STAGES[i + 1].skin, t) };
}
// hair length in mm at height y for a fade
function mmAt(y, f) {
  const bottom = 1 - f.skin;
  if (y >= bottom) return 0;
  if (y <= f.line - 0.1) return TOP_MM;
  if (y <= f.line) return lerp(TOP_MM, 13, smooth(f.line - 0.1, f.line, y)); // weight line into the blend
  return 13 * Math.pow(smooth(bottom, f.line, y), 1.35);
}

// ---------------------------------------------------------------- canvas
const canvas = document.getElementById("fade");
const ruler = document.querySelector(".ruler");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, dpr = 1, hairs = [];

function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

function build() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const r = rng(7);
  const gap = W < 500 ? 4.2 : 4.8;
  hairs = [];
  for (let y = -gap; y < H + gap; y += gap) {
    for (let x = -12; x < W + 4; x += gap) {
      hairs.push({
        x: x + (r() - 0.5) * gap * 1.6,
        y: y + (r() - 0.5) * gap * 1.6,
        a: 1.72 + (r() - 0.5) * 0.42 + (x / W) * 0.18, // lies down and slightly back
        k: 0.75 + r() * 0.5,                          // length jitter
        c: (r() - 0.5) * 0.9,                         // curl on long hair
        t: r(),
      });
    }
  }
}

const BUCKETS = 5;
function draw(f) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // skin ground: warmer and lighter towards the shaved nape
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6a4a36"); g.addColorStop(1, "#8a6248");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const pxPerMm = H / 210;
  // coverage: a fade *reads* as a gradient of darkness before it reads as strands
  for (let y = 0; y < H; y += 2) {
    const mm = mmAt(y / H, f);
    const cov = Math.min(1, Math.pow(mm / 7, 0.75)) * 0.66;
    if (cov > 0.01) { ctx.fillStyle = `rgba(22, 16, 13, ${cov})`; ctx.fillRect(0, y, W, 2); }
  }
  const paths = Array.from({ length: BUCKETS }, () => new Path2D());
  for (const h of hairs) {
    const mm = mmAt(h.y / H, f) * h.k;
    if (mm < 0.15) { if (h.t < 0.12) paths[0].rect(h.x, h.y, 0.9, 0.9); continue; } // stray stubble on skin
    const L = Math.max(1, mm * pxPerMm);
    const dx = Math.cos(h.a), dy = Math.sin(h.a);
    const b = Math.min(BUCKETS - 1, Math.floor(Math.pow(mm / TOP_MM, 0.6) * BUCKETS));
    const p = paths[b];
    p.moveTo(h.x, h.y);
    if (L > 14) p.quadraticCurveTo(h.x + dx * L * 0.5 - dy * h.c * L * 0.25, h.y + dy * L * 0.5 + dx * h.c * L * 0.25, h.x + dx * L, h.y + dy * L);
    else p.lineTo(h.x + dx * L, h.y + dy * L);
  }
  ctx.lineCap = "round";
  for (let i = 0; i < BUCKETS; i++) {
    ctx.strokeStyle = `rgba(10, 7, 6, ${0.55 + i * 0.1})`;
    ctx.fillStyle = "rgba(20, 15, 13, 0.5)";
    ctx.lineWidth = 0.9 + i * 0.3;
    if (i === 0) ctx.fill(paths[0]);
    ctx.stroke(paths[i]);
  }
  // soft top-light like a barber's ring lamp
  const v = ctx.createRadialGradient(W * 0.35, H * 0.25, 0, W * 0.35, H * 0.25, Math.max(W, H) * 0.9);
  v.addColorStop(0, "rgba(255,240,225,0.10)"); v.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ruler: one tick per guard band for the current fade, thinned so labels never collide
const BANDS = [[0, "Skin", "0 mm"], [1.5, "#0", "1.5 mm"], [3, "#1", "3 mm"], [6, "#2", "6 mm"], [10, "#3", "10 mm"], [13, "#4", "13 mm"]];
function renderRuler(f) {
  const ticks = [];
  for (const [mm, g, label] of BANDS) {
    // find the lowest point (largest y) on the head where the hair reaches this length
    let y = 1;
    for (let t = 0.995; t > 0; t -= 0.0025) { if (mmAt(t, f) >= mm + 0.05 || (mm === 0 && t < 1 - f.skin / 2)) { y = mm === 0 ? 1 - f.skin / 2 : t; break; } }
    ticks.push({ y, g, label, line: mm === 13 });
  }
  ticks.push({ y: Math.min(0.12, f.line - 0.12), g: "Top", label: "scissor" });
  const minGap = 30 / H;
  const keep = [];
  for (const t of ticks) if (!keep.length || keep[keep.length - 1].y - t.y >= minGap || t.line) {
    if (t.line && keep.length && keep[keep.length - 1].y - t.y < minGap) keep.pop();
    keep.push(t);
  }
  ruler.innerHTML = keep.map((t) => `<li class="${t.line ? "is-line" : ""}" style="top:${(t.y * 100).toFixed(2)}%"><b>${t.g}</b><span>${t.label}</span></li>`).join("");
}

// ---------------------------------------------------------------- state + UI
const nameEl = document.getElementById("stage-name");
const descEl = document.getElementById("stage-desc");
const buttons = [...document.querySelectorAll(".stages button")];
const state = { s: 1 };
let shownStage = -1, raf = 0;

function render() {
  raf = 0;
  const f = stageAt(state.s);
  draw(f); renderRuler(f);
  const i = Math.round(state.s);
  if (i !== shownStage) {
    shownStage = i;
    nameEl.textContent = STAGES[i].name;
    descEl.textContent = STAGES[i].desc;
    buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  }
}
const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };

build(); render();
new ResizeObserver(() => { build(); schedule(); }).observe(canvas);

// ---------------------------------------------------------------- scroll
let pinTrigger = null, lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
  window.__lenis = lenis; // blockbar.js
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  state.s = 0;
  const small = matchMedia("(max-width: 900px)").matches;
  pinTrigger = ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: small ? "+=130%" : "+=170%",
    pin: true,
    scrub: true,
    onUpdate: (self) => { state.s = self.progress * (STAGES.length - 1); schedule(); },
  });
  schedule();
}

buttons.forEach((b, i) => b.addEventListener("click", () => {
  if (pinTrigger) {
    const y = pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (i / (STAGES.length - 1));
    lenis.scrollTo(y, { duration: 1.1 });
  } else {
    state.s = i; schedule();
  }
}));
