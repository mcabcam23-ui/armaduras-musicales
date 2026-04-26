const targetLabel = document.getElementById("targetLabel");
const buildMode = document.getElementById("buildMode");
const buildStaff = document.getElementById("buildStaff");
const countValue = document.getElementById("countValue");
const buildResult = document.getElementById("buildResult");
const checkBuildBtn = document.getElementById("checkBuildBtn");
const nextBuildBtn = document.getElementById("nextBuildBtn");

const typeNone = document.getElementById("typeNone");
const typeSharp = document.getElementById("typeSharp");
const typeFlat = document.getElementById("typeFlat");
const countDown = document.getElementById("countDown");
const countUp = document.getElementById("countUp");

const SHARP_TOPS = [-4, 14, 32, 8, 26, 2, 20];
const FLAT_TOPS = [14, -4, 20, 2, 26, 8, 32];

const ITEMS = [
  { label: "Do", accidental: "none", count: 0, mode: "sharp-major", type: "major" },
  { label: "Sol", accidental: "sharp", count: 1, mode: "sharp-major", type: "major" },
  { label: "Re", accidental: "sharp", count: 2, mode: "sharp-major", type: "major" },
  { label: "La", accidental: "sharp", count: 3, mode: "sharp-major", type: "major" },
  { label: "Mi", accidental: "sharp", count: 4, mode: "sharp-major", type: "major" },
  { label: "Si", accidental: "sharp", count: 5, mode: "sharp-major", type: "major" },
  { label: "Fa#", accidental: "sharp", count: 6, mode: "sharp-major", type: "major" },
  { label: "Do#", accidental: "sharp", count: 7, mode: "sharp-major", type: "major" },
  { label: "Fa", accidental: "flat", count: 1, mode: "flat-major", type: "major" },
  { label: "Sib", accidental: "flat", count: 2, mode: "flat-major", type: "major" },
  { label: "Mib", accidental: "flat", count: 3, mode: "flat-major", type: "major" },
  { label: "Lab", accidental: "flat", count: 4, mode: "flat-major", type: "major" },
  { label: "Reb", accidental: "flat", count: 5, mode: "flat-major", type: "major" },
  { label: "Solb", accidental: "flat", count: 6, mode: "flat-major", type: "major" },
  { label: "Dob", accidental: "flat", count: 7, mode: "flat-major", type: "major" },
  { label: "Lam", accidental: "none", count: 0, mode: "sharp-minor", type: "minor" },
  { label: "Mim", accidental: "sharp", count: 1, mode: "sharp-minor", type: "minor" },
  { label: "Sim", accidental: "sharp", count: 2, mode: "sharp-minor", type: "minor" },
  { label: "Fa#m", accidental: "sharp", count: 3, mode: "sharp-minor", type: "minor" },
  { label: "Do#m", accidental: "sharp", count: 4, mode: "sharp-minor", type: "minor" },
  { label: "Sol#m", accidental: "sharp", count: 5, mode: "sharp-minor", type: "minor" },
  { label: "Re#m", accidental: "sharp", count: 6, mode: "sharp-minor", type: "minor" },
  { label: "La#m", accidental: "sharp", count: 7, mode: "sharp-minor", type: "minor" },
  { label: "Rem", accidental: "flat", count: 1, mode: "flat-minor", type: "minor" },
  { label: "Solm", accidental: "flat", count: 2, mode: "flat-minor", type: "minor" },
  { label: "Dom", accidental: "flat", count: 3, mode: "flat-minor", type: "minor" },
  { label: "Fam", accidental: "flat", count: 4, mode: "flat-minor", type: "minor" },
  { label: "Sibm", accidental: "flat", count: 5, mode: "flat-minor", type: "minor" },
  { label: "Mibm", accidental: "flat", count: 6, mode: "flat-minor", type: "minor" },
  { label: "Labm", accidental: "flat", count: 7, mode: "flat-minor", type: "minor" }
];

let selectedType = "none";
let selectedCount = 0;
let target = null;

function modeItems() {
  const mode = buildMode.value;
  if (mode === "major-mixed") return ITEMS.filter((item) => item.type === "major");
  if (mode === "minor-mixed") return ITEMS.filter((item) => item.type === "minor");
  if (mode === "mixed") return ITEMS;
  return ITEMS.filter((item) => item.mode === mode);
}

function setTypeButtons() {
  typeNone.classList.toggle("active", selectedType === "none");
  typeSharp.classList.toggle("active", selectedType === "sharp");
  typeFlat.classList.toggle("active", selectedType === "flat");
}

function accidentalLayout(accidentalType) {
  if (window.matchMedia("(max-width: 768px)").matches) {
    return accidentalType === "sharp"
      ? { baseLeft: 60, step: 12 }
      : { baseLeft: 52, step: 11 };
  }
  if (window.matchMedia("(max-width: 1024px)").matches) {
    return accidentalType === "sharp"
      ? { baseLeft: 56, step: 15 }
      : { baseLeft: 60, step: 14 };
  }
  return accidentalType === "sharp"
    ? { baseLeft: 68, step: 24 }
    : { baseLeft: 74, step: 23 };
}

function paintAccidentals() {
  buildStaff.dataset.accidental = selectedType;
  buildStaff.dataset.count = selectedCount;
  countValue.textContent = String(selectedCount);
  const group = buildStaff.querySelector(".accidental-group");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!group) return;
  group.innerHTML = "";
  if (selectedType === "none" || selectedCount === 0) return;
  const positions = selectedType === "sharp" ? SHARP_TOPS : FLAT_TOPS;
  const symbol = selectedType === "sharp" ? "♯" : "♭";
  const { baseLeft, step } = accidentalLayout(selectedType);
  const mobileDrop = isMobile
    ? selectedType === "sharp"
      ? 3
      : 8
    : 0;
  for (let i = 0; i < selectedCount; i += 1) {
    const accidental = document.createElement("span");
    accidental.className = "accidental";
    accidental.textContent = symbol;
    accidental.style.left = `${baseLeft + i * step}px`;
    accidental.style.top = `${positions[i] + mobileDrop}px`;
    group.appendChild(accidental);
  }
}

function setType(type) {
  selectedType = type;
  if (selectedType === "none") selectedCount = 0;
  setTypeButtons();
  paintAccidentals();
}

function setCount(next) {
  selectedCount = Math.max(0, Math.min(6, next));
  if (selectedCount === 0) selectedType = "none";
  else if (selectedType === "none") selectedType = "sharp";
  setTypeButtons();
  paintAccidentals();
}

function newRound() {
  buildResult.textContent = "";
  buildResult.classList.remove("ok", "bad");
  const source = modeItems();
  target = source[Math.floor(Math.random() * source.length)];
  targetLabel.textContent = `Tonalidad objetivo: ${target.label}`;
  selectedType = "none";
  selectedCount = 0;
  setTypeButtons();
  paintAccidentals();
}

function checkRound() {
  if (!target) return;
  const ok = selectedType === target.accidental && selectedCount === target.count;
  if (ok) {
    buildResult.textContent = "Correcto! Armadura construida.";
    buildResult.classList.add("ok");
    buildResult.classList.remove("bad");
  } else {
    const kind = target.accidental === "none" ? "sin alteraciones" : target.accidental === "sharp" ? "sostenidos" : "bemoles";
    buildResult.textContent = `No exacto. Era ${target.count} ${kind}.`;
    buildResult.classList.add("bad");
    buildResult.classList.remove("ok");
  }
}

typeNone.addEventListener("click", () => setType("none"));
typeSharp.addEventListener("click", () => setType("sharp"));
typeFlat.addEventListener("click", () => setType("flat"));
countDown.addEventListener("click", () => setCount(selectedCount - 1));
countUp.addEventListener("click", () => setCount(selectedCount + 1));
checkBuildBtn.addEventListener("click", checkRound);
nextBuildBtn.addEventListener("click", newRound);
buildMode.addEventListener("change", newRound);

newRound();
