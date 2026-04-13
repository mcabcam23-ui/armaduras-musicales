const NOTES = ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"];
const COLORS = ["#e85b5b", "#f18b2d", "#f2c037", "#58b95e", "#33a8a2", "#4b8be6", "#8c63cf"];

const targetNoteEl = document.getElementById("targetNote");
const messageEl = document.getElementById("message");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const newRoundBtn = document.getElementById("newRoundBtn");

let targetNote = "";
let score = 0;
let streak = 0;
let locked = false;

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateHud() {
  scoreEl.textContent = `Puntos: ${score}`;
  streakEl.textContent = `Racha: ${streak}`;
}

function pickRoundNotes() {
  const pool = shuffle(NOTES);
  const round = pool.slice(0, 4);
  targetNote = round[Math.floor(Math.random() * round.length)];
  targetNoteEl.textContent = targetNote;
  return round;
}

function handleAnswer(btn, note) {
  if (locked) return;
  locked = true;

  if (note === targetNote) {
    btn.classList.add("correct");
    score += 10;
    streak += 1;
    messageEl.textContent = "Genial! Esa era la nota correcta.";
    messageEl.style.color = "#1f8b3b";
  } else {
    btn.classList.add("wrong");
    streak = 0;
    messageEl.textContent = `Casi! Busca "${targetNote}".`;
    messageEl.style.color = "#b23a3a";
  }

  updateHud();
  setTimeout(startRound, 700);
}

function renderOptions(roundNotes) {
  optionsEl.innerHTML = "";
  roundNotes.forEach((note) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "note-btn";
    btn.textContent = note;
    btn.style.background = COLORS[NOTES.indexOf(note)];
    btn.addEventListener("click", () => handleAnswer(btn, note));
    optionsEl.appendChild(btn);
  });
}

function startRound() {
  locked = false;
  messageEl.textContent = "Toca la nota que te pido arriba.";
  messageEl.style.color = "#4f658b";
  const roundNotes = pickRoundNotes();
  renderOptions(shuffle(roundNotes));
}

newRoundBtn.addEventListener("click", startRound);

updateHud();
startRound();
