const quizMode = document.getElementById("quizMode");
const newQuizBtn = document.getElementById("newQuizBtn");
const quizCard = document.getElementById("quizCard");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");

const SHARP_TOPS = [-4, 14, 32, 8, 26, 2, 20];
const FLAT_TOPS = [14, -4, 20, 2, 26, 8, 32];

const ITEMS = [
  { label: "Do", accidental: "none", count: 0, type: "major" },
  { label: "Sol", accidental: "sharp", count: 1, type: "major" },
  { label: "Re", accidental: "sharp", count: 2, type: "major" },
  { label: "La", accidental: "sharp", count: 3, type: "major" },
  { label: "Mi", accidental: "sharp", count: 4, type: "major" },
  { label: "Si", accidental: "sharp", count: 5, type: "major" },
  { label: "Fa#", accidental: "sharp", count: 6, type: "major" },
  { label: "Do#", accidental: "sharp", count: 7, type: "major" },
  { label: "Fa", accidental: "flat", count: 1, type: "major" },
  { label: "Sib", accidental: "flat", count: 2, type: "major" },
  { label: "Mib", accidental: "flat", count: 3, type: "major" },
  { label: "Lab", accidental: "flat", count: 4, type: "major" },
  { label: "Reb", accidental: "flat", count: 5, type: "major" },
  { label: "Solb", accidental: "flat", count: 6, type: "major" },
  { label: "Dob", accidental: "flat", count: 7, type: "major" },
  { label: "Lam", accidental: "none", count: 0, type: "minor" },
  { label: "Mim", accidental: "sharp", count: 1, type: "minor" },
  { label: "Sim", accidental: "sharp", count: 2, type: "minor" },
  { label: "Fa#m", accidental: "sharp", count: 3, type: "minor" },
  { label: "Do#m", accidental: "sharp", count: 4, type: "minor" },
  { label: "Sol#m", accidental: "sharp", count: 5, type: "minor" },
  { label: "Re#m", accidental: "sharp", count: 6, type: "minor" },
  { label: "La#m", accidental: "sharp", count: 7, type: "minor" },
  { label: "Rem", accidental: "flat", count: 1, type: "minor" },
  { label: "Solm", accidental: "flat", count: 2, type: "minor" },
  { label: "Dom", accidental: "flat", count: 3, type: "minor" },
  { label: "Fam", accidental: "flat", count: 4, type: "minor" },
  { label: "Sibm", accidental: "flat", count: 5, type: "minor" },
  { label: "Mibm", accidental: "flat", count: 6, type: "minor" },
  { label: "Labm", accidental: "flat", count: 7, type: "minor" }
];

let answer = null;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function modeItems() {
  if (quizMode.value === "all") return ITEMS;
  return ITEMS.filter((i) => i.type === quizMode.value);
}

function staffHtml(item) {
  return `
    <div class="staff" data-accidental="${item.accidental}" data-count="${item.count}">
      <span class="clef">𝄞</span>
      <div class="accidental-group" aria-hidden="true"></div>
    </div>
  `;
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

function paintAccidentals(staff) {
  const accidentalType = staff.dataset.accidental;
  const count = Number(staff.dataset.count || 0);
  const group = staff.querySelector(".accidental-group");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!group) return;
  group.innerHTML = "";
  if (accidentalType === "none" || count === 0) return;
  const positions = accidentalType === "sharp" ? SHARP_TOPS : FLAT_TOPS;
  const symbol = accidentalType === "sharp" ? "♯" : "♭";
  const { baseLeft, step } = accidentalLayout(accidentalType);
  const mobileDrop = isMobile
    ? accidentalType === "sharp"
      ? 3
      : 10
    : 0;
  for (let i = 0; i < count; i += 1) {
    const accidental = document.createElement("span");
    accidental.className = "accidental";
    accidental.textContent = symbol;
    accidental.style.left = `${baseLeft + i * step}px`;
    accidental.style.top = `${positions[i] + mobileDrop}px`;
    group.appendChild(accidental);
  }
}

function buildRound() {
  quizResult.textContent = "";
  const items = modeItems();
  const correct = items[Math.floor(Math.random() * items.length)];
  answer = correct.label;
  const options = shuffle([
    correct.label,
    ...shuffle(items.filter((i) => i.label !== correct.label)).slice(0, 3).map((i) => i.label)
  ]);

  quizCard.innerHTML = staffHtml(correct);
  paintAccidentals(quizCard.querySelector(".staff"));

  quizOptions.innerHTML = "";
  options.forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => checkAnswer(btn, name));
    quizOptions.appendChild(btn);
  });
}

function checkAnswer(button, name) {
  const buttons = [...quizOptions.querySelectorAll(".choice-btn")];
  buttons.forEach((b) => (b.disabled = true));
  if (name === answer) {
    button.classList.add("correct");
    quizResult.textContent = "Correcto! Muy bien.";
    quizResult.classList.add("ok");
    quizResult.classList.remove("bad");
  } else {
    button.classList.add("wrong");
    const good = buttons.find((b) => b.textContent === answer);
    if (good) good.classList.add("correct");
    quizResult.textContent = `Casi. Era ${answer}.`;
    quizResult.classList.add("bad");
    quizResult.classList.remove("ok");
  }
}

newQuizBtn.addEventListener("click", buildRound);
quizMode.addEventListener("change", buildRound);

buildRound();
