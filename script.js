const scene = document.getElementById("scene");
const letter = document.getElementById("letter");
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");
const lines = Array.from(document.querySelectorAll(".line"));
const soundGate = document.getElementById("soundGate");
const soundStartBtn = document.getElementById("soundStartBtn");
const paper = document.getElementById("paper");
function measurePaperHeights() {
  if (!paper) return;

  // temporarily remove max-height to measure full content
  const prevMax = paper.style.maxHeight;
  paper.style.maxHeight = "none";

  const full = paper.scrollHeight; // real full height
  paper.style.maxHeight = prevMax;

  // set CSS vars (px)
  document.documentElement.style.setProperty("--paper-full", `${full}px`);
  document.documentElement.style.setProperty("--paper-closed", `190px`);
}


let soundEnabled = false;

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function setVars(open, seal, reveal) {
  document.documentElement.style.setProperty("--open", String(open));
  document.documentElement.style.setProperty("--seal", String(seal));
  document.documentElement.style.setProperty("--reveal", String(reveal));
}

function revealLines(progress) {
  const base = clamp01((progress - 0.35) / 0.55);
  lines.forEach((el, idx) => {
    const step = idx / Math.max(1, lines.length - 1);
    const p = clamp01((base - step) / 0.25);
    el.style.opacity = String(p);
    el.style.transform = `translateY(${(1 - p) * 14}px)`;
  });
}

function updateScroll() {
  const rect = scene.getBoundingClientRect();
  const sceneHeight = rect.height;
  const viewH = window.innerHeight;

  const travelled = clamp01((viewH - rect.top) / (sceneHeight - viewH));
  const open = clamp01((travelled - 0.05) / 0.7);

  const seal = clamp01(1 - (travelled - 0.18) / 0.18);
  const reveal = clamp01((travelled - 0.28) / 0.65);

  setVars(open, seal, reveal);
  revealLines(travelled);
}

async function enableSound() {
  if (soundEnabled) return;

  soundEnabled = true;
  music.muted = false;

  try {
    await music.play();
  } catch (_) {}

  musicBtn.classList.add("is-on");
  musicLabel.textContent = "Sound on";

  if (soundGate) soundGate.style.display = "none";
}

function toggleSound() {
  if (!soundEnabled) {
    enableSound();
    return;
  }

  if (music.paused) {
    music.play();
    musicBtn.classList.add("is-on");
    musicLabel.textContent = "Sound on";
  } else {
    music.pause();
    musicBtn.classList.remove("is-on");
    musicLabel.textContent = "Sound off";
  }
}

window.addEventListener("scroll", () => {
  updateScroll();
  enableSound();
});

window.addEventListener("click", enableSound, { once: true });
window.addEventListener("touchstart", enableSound, { once: true });

musicBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSound();
});
measurePaperHeights();
window.addEventListener("resize", measurePaperHeights);

updateScroll();
setVars(0, 1, 0);
revealLines(0);
soundStartBtn?.addEventListener("click", enableSound);
