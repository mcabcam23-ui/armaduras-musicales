const bank = document.querySelector(".bank");
const grid = document.querySelector(".grid");
const modeSelect = document.getElementById("modeSelect");
const loadModeBtn = document.getElementById("loadModeBtn");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");

let dragNote = null;

const SHARP_TOPS = [-9, 9, -17, 1, 19, -1, 17];
const FLAT_TOPS = [9, -9, 13, -5, 17, -1, 21];

const EXERCISES = {
  "sharp-major": [
    { label: "Do", accidental: "none", count: 0 },
    { label: "Sol", accidental: "sharp", count: 1 },
    { label: "Re", accidental: "sharp", count: 2 },
    { label: "La", accidental: "sharp", count: 3 },
    { label: "Mi", accidental: "sharp", count: 4 },
    { label: "Si", accidental: "sharp", count: 5 }
  ],
  "sharp-minor": [
    { label: "Lam", accidental: "none", count: 0 },
    { label: "Mim", accidental: "sharp", count: 1 },
    { label: "Sim", accidental: "sharp", count: 2 },
    { label: "Fa#m", accidental: "sharp", count: 3 },
    { label: "Do#m", accidental: "sharp", count: 4 },
    { label: "Sol#m", accidental: "sharp", count: 5 }
  ],
  "flat-major": [
    { label: "Fa", accidental: "flat", count: 1 },
    { label: "Sib", accidental: "flat", count: 2 },
    { label: "Mib", accidental: "flat", count: 3 },
    { label: "Lab", accidental: "flat", count: 4 },
    { label: "Reb", accidental: "flat", count: 5 },
    { label: "Solb", accidental: "flat", count: 6 }
  ],
  "flat-minor": [
    { label: "Rem", accidental: "flat", count: 1 },
    { label: "Solm", accidental: "flat", count: 2 },
    { label: "Dom", accidental: "flat", count: 3 },
    { label: "Fam", accidental: "flat", count: 4 },
    { label: "Sibm", accidental: "flat", count: 5 },
    { label: "Mibm", accidental: "flat", count: 6 }
  ]
};

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getCurrentSet() {
  const mode = modeSelect.value;
  if (mode === "mixed") {
    const all = [
      ...EXERCISES["sharp-major"],
      ...EXERCISES["sharp-minor"],
      ...EXERCISES["flat-major"],
      ...EXERCISES["flat-minor"]
    ];
    return shuffle(all).slice(0, 12);
  }
  return [...EXERCISES[mode]];
}

function createToken(note) {
  const token = document.createElement("div");
  token.className = "token";
  token.draggable = true;
  token.dataset.note = note;
  token.textContent = note;
  addTokenEvents(token);
  return token;
}

function renderBank(notes) {
  bank.innerHTML = "";
  notes.forEach((note) => bank.appendChild(createToken(note)));
}

function renderCards(exercises) {
  grid.innerHTML = "";
  exercises.forEach((exercise, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.answer = exercise.label;
    card.innerHTML = `
      <div class="staff" data-accidental="${exercise.accidental}" data-count="${exercise.count}">
        <span class="clef">𝄞</span>
        <div class="accidental-group" aria-hidden="true"></div>
      </div>
      <div class="drop-zone" data-slot="${index + 1}"></div>
      <p class="feedback"></p>
    `;
    grid.appendChild(card);
  });
}

function renderKeySignatures() {
  const staves = [...document.querySelectorAll(".staff")];

  staves.forEach((staff) => {
    const accidentalType = staff.dataset.accidental;
    const count = Number(staff.dataset.count || 0);
    const group = staff.querySelector(".accidental-group");
    if (!group) return;

    group.innerHTML = "";
    if (accidentalType === "none" || count === 0) return;

    const positions = accidentalType === "sharp" ? SHARP_TOPS : FLAT_TOPS;
    const symbol = accidentalType === "sharp" ? "♯" : "♭";
    const baseLeft = accidentalType === "sharp" ? 68 : 74;
    const step = accidentalType === "sharp" ? 24 : 23;

    for (let i = 0; i < count; i += 1) {
      const accidental = document.createElement("span");
      accidental.className = "accidental";
      accidental.textContent = symbol;
      accidental.style.left = `${baseLeft + i * step}px`;
      accidental.style.top = `${positions[i]}px`;
      group.appendChild(accidental);
    }
  });
}

function bindDropZones() {
  const dropZones = [...document.querySelectorAll(".drop-zone")];

  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("over");

      const note = e.dataTransfer.getData("text/plain") || dragNote;
      if (!note) return;

      const oldToken = zone.querySelector(".token");
      if (oldToken) bank.appendChild(oldToken);

      const draggedInBank = bank.querySelector(`.token[data-note="${note}"]`);
      if (draggedInBank) {
        zone.appendChild(draggedInBank);
      } else {
        const draggedFromAnotherZone = document.querySelector(
          `.drop-zone .token[data-note="${note}"]`
        );
        if (draggedFromAnotherZone) zone.appendChild(draggedFromAnotherZone);
      }

      clearFeedback();
    });
  });
}

function addTokenEvents(token) {
  token.addEventListener("dragstart", (e) => {
    dragNote = token.dataset.note;
    token.classList.add("dragging");
    e.dataTransfer.setData("text/plain", dragNote);
  });

  token.addEventListener("dragend", () => {
    token.classList.remove("dragging");
  });
}

function clearFeedback() {
  const dropZones = [...document.querySelectorAll(".drop-zone")];
  const cards = [...document.querySelectorAll(".card")];
  dropZones.forEach((zone) => zone.classList.remove("correct", "wrong"));
  cards.forEach((card) => {
    const feedback = card.querySelector(".feedback");
    if (feedback) feedback.textContent = "";
  });
  result.textContent = "";
}

checkBtn.addEventListener("click", () => {
  const cards = [...document.querySelectorAll(".card")];
  let correct = 0;

  cards.forEach((card) => {
    const zone = card.querySelector(".drop-zone");
    const token = zone.querySelector(".token");
    const expected = card.dataset.answer;

    zone.classList.remove("correct", "wrong");

    if (token && token.dataset.note === expected) {
      zone.classList.add("correct");
      correct += 1;
      const feedback = card.querySelector(".feedback");
      if (feedback) feedback.textContent = "Correcto";
    } else {
      zone.classList.add("wrong");
      const feedback = card.querySelector(".feedback");
      if (feedback) feedback.textContent = `Correcta: ${expected}`;
    }
  });

  const total = cards.length;
  if (correct === total) {
    result.textContent = `Perfecto: ${correct}/${total}. Todo correcto.`;
    result.style.color = "#1d8f3b";
  } else {
    result.textContent = `Resultado: ${correct}/${total} correctas.`;
    result.style.color = "#b23a3a";
  }
});

resetBtn.addEventListener("click", () => {
  const dropZones = [...document.querySelectorAll(".drop-zone")];
  const cards = [...document.querySelectorAll(".card")];
  dropZones.forEach((zone) => {
    const token = zone.querySelector(".token");
    if (token) bank.appendChild(token);
    zone.classList.remove("correct", "wrong", "over");
  });
  cards.forEach((card) => {
    const feedback = card.querySelector(".feedback");
    if (feedback) feedback.textContent = "";
  });
  result.textContent = "";
  result.style.color = "#111";
});

function loadMode() {
  const exercises = getCurrentSet();
  const notes = shuffle(exercises.map((item) => item.label));
  renderCards(exercises);
  renderBank(notes);
  renderKeySignatures();
  bindDropZones();
  clearFeedback();
}

loadModeBtn.addEventListener("click", loadMode);
modeSelect.addEventListener("change", loadMode);

loadMode();
