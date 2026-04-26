const bank = document.querySelector(".bank");
const grid = document.querySelector(".grid");
const modeSelect = document.getElementById("modeSelect");
const loadModeBtn = document.getElementById("loadModeBtn");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");

let dragNote = null;
let mixedPool = [];
let activeTouchDrag = null;
const IS_TOUCH_DEVICE =
  window.matchMedia("(pointer: coarse)").matches ||
  "ontouchstart" in window;

const SHARP_TOPS = [-4, 14, 32, 8, 26, 2, 20];
const FLAT_TOPS = [14, -4, 20, 2, 26, 8, 32];

const EXERCISES = {
  "sharp-major": [
    { label: "Do", accidental: "none", count: 0 },
    { label: "Sol", accidental: "sharp", count: 1 },
    { label: "Re", accidental: "sharp", count: 2 },
    { label: "La", accidental: "sharp", count: 3 },
    { label: "Mi", accidental: "sharp", count: 4 },
    { label: "Si", accidental: "sharp", count: 5 },
    { label: "Fa#", accidental: "sharp", count: 6 },
    { label: "Do#", accidental: "sharp", count: 7 }
  ],
  "sharp-minor": [
    { label: "Lam", accidental: "none", count: 0 },
    { label: "Mim", accidental: "sharp", count: 1 },
    { label: "Sim", accidental: "sharp", count: 2 },
    { label: "Fa#m", accidental: "sharp", count: 3 },
    { label: "Do#m", accidental: "sharp", count: 4 },
    { label: "Sol#m", accidental: "sharp", count: 5 },
    { label: "Re#m", accidental: "sharp", count: 6 },
    { label: "La#m", accidental: "sharp", count: 7 }
  ],
  "flat-major": [
    { label: "Fa", accidental: "flat", count: 1 },
    { label: "Sib", accidental: "flat", count: 2 },
    { label: "Mib", accidental: "flat", count: 3 },
    { label: "Lab", accidental: "flat", count: 4 },
    { label: "Reb", accidental: "flat", count: 5 },
    { label: "Solb", accidental: "flat", count: 6 },
    { label: "Dob", accidental: "flat", count: 7 }
  ],
  "flat-minor": [
    { label: "Rem", accidental: "flat", count: 1 },
    { label: "Solm", accidental: "flat", count: 2 },
    { label: "Dom", accidental: "flat", count: 3 },
    { label: "Fam", accidental: "flat", count: 4 },
    { label: "Sibm", accidental: "flat", count: 5 },
    { label: "Mibm", accidental: "flat", count: 6 },
    { label: "Labm", accidental: "flat", count: 7 }
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

function roundSizeForCurrentScreen() {
  if (window.matchMedia("(max-width: 768px)").matches) return 4;
  return 6;
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

function getCurrentSet() {
  const mode = modeSelect.value;
  const size = roundSizeForCurrentScreen();
  if (mode === "major-mixed") {
    return shuffle([
      ...EXERCISES["sharp-major"],
      ...EXERCISES["flat-major"]
    ]).slice(0, size);
  }
  if (mode === "minor-mixed") {
    return shuffle([
      ...EXERCISES["sharp-minor"],
      ...EXERCISES["flat-minor"]
    ]).slice(0, size);
  }
  if (mode === "mixed") {
    const all = shuffle([
      ...EXERCISES["sharp-major"],
      ...EXERCISES["sharp-minor"],
      ...EXERCISES["flat-major"],
      ...EXERCISES["flat-minor"]
    ]);

    // Keep a rotating pool so each mixed round shows different items
    // until all options have been used once.
    if (mixedPool.length < size) {
      mixedPool = shuffle(all);
    }

    return mixedPool.splice(0, size);
  }
  return shuffle([...EXERCISES[mode]]).slice(0, size);
}

function createToken(note) {
  const token = document.createElement("div");
  token.className = "token";
  token.draggable = !IS_TOUCH_DEVICE;
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
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  staves.forEach((staff) => {
    const accidentalType = staff.dataset.accidental;
    const count = Number(staff.dataset.count || 0);
    const group = staff.querySelector(".accidental-group");
    if (!group) return;

    group.innerHTML = "";
    if (accidentalType === "none" || count === 0) return;

    const positions = accidentalType === "sharp" ? SHARP_TOPS : FLAT_TOPS;
    const symbol = accidentalType === "sharp" ? "♯" : "♭";
    const { baseLeft, step } = accidentalLayout(accidentalType);
    const mobileDrop = isMobile
      ? accidentalType === "sharp"
        ? 6
        : 13
      : 0;

    for (let i = 0; i < count; i += 1) {
      const accidental = document.createElement("span");
      accidental.className = "accidental";
      accidental.textContent = symbol;
      accidental.style.left = `${baseLeft + i * step}px`;
      accidental.style.top = `${positions[i] + mobileDrop}px`;
      group.appendChild(accidental);
    }
  });
}

function findDropZoneAt(x, y) {
  const stack = document.elementsFromPoint(x, y);
  for (let i = 0; i < stack.length; i += 1) {
    const zone = stack[i].closest(".drop-zone");
    if (zone) return zone;
  }
  return null;
}

function clearDropZoneHover() {
  [...document.querySelectorAll(".drop-zone")].forEach((zone) => zone.classList.remove("over"));
}

function placeTokenInZone(token, zone) {
  const oldToken = zone.querySelector(".token");
  if (oldToken && oldToken !== token) bank.appendChild(oldToken);
  zone.appendChild(token);
  clearFeedback();
}

function startTouchDrag(token, touch) {
  const rect = token.getBoundingClientRect();
  activeTouchDrag = {
    token,
    touchId: touch.identifier,
    originParent: token.parentNode,
    originNext: token.nextSibling,
    baseLeft: rect.left,
    baseTop: rect.top,
    startX: touch.clientX,
    startY: touch.clientY
  };

  document.body.appendChild(token);
  token.classList.add("token--touch-dragging");
  token.style.position = "fixed";
  token.style.left = `${rect.left}px`;
  token.style.top = `${rect.top}px`;
  token.style.width = `${rect.width}px`;
  token.style.zIndex = "10000";
  token.style.pointerEvents = "none";
  token.style.transform = "translate(0px, 0px)";
}

function moveTouchDrag(touch) {
  if (!activeTouchDrag) return;
  const dx = touch.clientX - activeTouchDrag.startX;
  const dy = touch.clientY - activeTouchDrag.startY;
  activeTouchDrag.token.style.transform = `translate(${dx}px, ${dy}px)`;

  clearDropZoneHover();
  const zone = findDropZoneAt(touch.clientX, touch.clientY);
  if (zone) zone.classList.add("over");
}

function restoreTouchDragToken() {
  if (!activeTouchDrag) return;
  const { token, originParent, originNext } = activeTouchDrag;
  if (!originParent) return;
  if (originNext && originNext.parentNode === originParent) {
    originParent.insertBefore(token, originNext);
  } else {
    originParent.appendChild(token);
  }
}

function endTouchDrag() {
  if (!activeTouchDrag) return;
  const { token } = activeTouchDrag;
  token.classList.remove("token--touch-dragging");
  token.style.position = "";
  token.style.left = "";
  token.style.top = "";
  token.style.width = "";
  token.style.zIndex = "";
  token.style.pointerEvents = "";
  token.style.transform = "";
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
  if (!IS_TOUCH_DEVICE) {
    token.addEventListener("dragstart", (e) => {
      dragNote = token.dataset.note;
      token.classList.add("dragging");
      e.dataTransfer.setData("text/plain", dragNote);
    });

    token.addEventListener("dragend", () => {
      token.classList.remove("dragging");
    });
  }

  token.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.changedTouches[0];
      if (!touch || activeTouchDrag) return;
      e.preventDefault();
      startTouchDrag(token, touch);
    },
    { passive: false }
  );
}

function getTouchById(touchList, id) {
  for (let i = 0; i < touchList.length; i += 1) {
    if (touchList[i].identifier === id) return touchList[i];
  }
  return null;
}

function clearFeedback() {
  const dropZones = [...document.querySelectorAll(".drop-zone")];
  const cards = [...document.querySelectorAll(".card")];
  dropZones.forEach((zone) => zone.classList.remove("correct", "wrong"));
  cards.forEach((card) => {
    const feedback = card.querySelector(".feedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("ok", "bad");
    }
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
      if (feedback) {
        feedback.textContent = "Correcto";
        feedback.classList.remove("bad");
        feedback.classList.add("ok");
      }
    } else {
      zone.classList.add("wrong");
      const feedback = card.querySelector(".feedback");
      if (feedback) {
        feedback.textContent = `Incorrecto: era ${expected}`;
        feedback.classList.remove("ok");
        feedback.classList.add("bad");
      }
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
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("ok", "bad");
    }
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

document.addEventListener(
  "touchmove",
  (e) => {
    if (!activeTouchDrag) return;
    const touch = getTouchById(e.touches, activeTouchDrag.touchId);
    if (!touch) return;
    e.preventDefault();
    moveTouchDrag(touch);
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (!activeTouchDrag) return;
    const touch = getTouchById(e.changedTouches, activeTouchDrag.touchId);
    if (!touch) return;

    const token = activeTouchDrag.token;
    const zone = findDropZoneAt(touch.clientX, touch.clientY);
    endTouchDrag();
    clearDropZoneHover();

    if (zone) {
      placeTokenInZone(token, zone);
    } else {
      restoreTouchDragToken();
    }

    activeTouchDrag = null;
  },
  { passive: true }
);

document.addEventListener(
  "touchcancel",
  (e) => {
    if (!activeTouchDrag) return;
    const touch = getTouchById(e.changedTouches, activeTouchDrag.touchId);
    if (!touch) return;

    endTouchDrag();
    clearDropZoneHover();
    restoreTouchDragToken();
    activeTouchDrag = null;
  },
  { passive: true }
);

loadModeBtn.addEventListener("click", loadMode);
modeSelect.addEventListener("change", loadMode);

loadMode();
