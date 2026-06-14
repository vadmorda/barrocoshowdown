const QUESTIONS = [
  {
    category: "Inglaterra contra el rey",
    items: [
      { points: 100, q: "¿A qué dinastía pasó la Corona inglesa en 1603?", a: "A la dinastía de los Estuardo." },
      { points: 200, q: "Jacobo I y Carlos I intentaron gobernar sin respetar suficientemente a una institución. ¿Cuál?", a: "El Parlamento." },
      { points: 300, q: "¿Qué rey inglés fue ejecutado tras la guerra civil?", a: "Carlos I." },
      { points: 400, q: "¿Qué ocurrió en Inglaterra en 1688?", a: "La Revolución Gloriosa." },
      { points: 500, q: "¿Qué sistema político nació tras la Revolución Gloriosa y la Declaración de Derechos?", a: "La monarquía parlamentaria." }
    ]
  },
  {
    category: "Los Austrias menores",
    items: [
      { points: 100, q: "¿Cómo se llama el grupo formado por Felipe III, Felipe IV y Carlos II?", a: "Los Austrias menores." },
      { points: 200, q: "Ordena correctamente: Carlos II, Felipe IV, Felipe III.", a: "Felipe III → Felipe IV → Carlos II." },
      { points: 300, q: "¿Qué era un valido?", a: "Un hombre de confianza del rey que gobernaba en su nombre." },
      { points: 400, q: "¿Quién fue el valido de Felipe III?", a: "El duque de Lerma." },
      { points: 500, q: "¿Quién fue el valido de Felipe IV?", a: "El conde-duque de Olivares." }
    ]
  },
  {
    category: "Crisis hispánica",
    items: [
      { points: 100, q: "¿Qué política inicial de Felipe III buscó acuerdos de paz?", a: "La Pax Hispánica." },
      { points: 200, q: "¿En qué año se expulsó a los moriscos?", a: "En 1609." },
      { points: 300, q: "¿Qué pretendía la Unión de Armas de Olivares?", a: "Que todos los reinos de la monarquía contribuyeran a formar y financiar un ejército permanente." },
      { points: 400, q: "¿Qué territorios se rebelaron en la crisis de 1640?", a: "Cataluña, Portugal y otros territorios de la monarquía." },
      { points: 500, q: "¿En qué año consiguió Portugal la independencia de la monarquía hispánica?", a: "En 1668." }
    ]
  },
  {
    category: "Francia absoluta",
    items: [
      { points: 100, q: "¿Qué rey francés fue conocido como el Rey Sol?", a: "Luis XIV." },
      { points: 200, q: "¿Qué tipo de monarquía representa Luis XIV?", a: "La monarquía absoluta." },
      { points: 300, q: "Según el absolutismo, ¿ante quién respondía el rey?", a: "Ante Dios." },
      { points: 400, q: "¿Qué institución dejó de convocar Luis XIV?", a: "Los Estados Generales." },
      { points: 500, q: "¿Para qué sirvió Versalles en la política de Luis XIV?", a: "Para atraer, vigilar y controlar a la nobleza, haciéndola depender de los favores del rey." }
    ]
  },
  {
    category: "Comercio y Provincias Unidas",
    items: [
      { points: 100, q: "¿Qué compañía creó Inglaterra en 1600 para comerciar con Asia?", a: "La Compañía Inglesa de las Indias Orientales." },
      { points: 200, q: "Madrás, Bombay y Calcuta fueron factorías inglesas en…", a: "La India." },
      { points: 300, q: "¿En qué año lograron su independencia las Provincias Unidas?", a: "En 1648." },
      { points: 400, q: "¿En qué actividad basaron su riqueza las Provincias Unidas?", a: "En el comercio marítimo." },
      { points: 500, q: "¿Quién controlaba políticamente los Estados Generales de las Provincias Unidas?", a: "Una poderosa burguesía enriquecida por el comercio." }
    ]
  }
];

const STORAGE_KEY = "barroco_showdown_jeopardy_v1";
const HISTORY_KEY = "barroco_showdown_jeopardy_history_v1";

const $ = (id) => document.getElementById(id);

let state = {
  teams: [],
  used: {},
  current: null,
  startedAt: null
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.teams) && saved.teams.length) {
      state = saved;
      return true;
    }
  } catch {}
  return false;
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function saveHistory(finalState) {
  const history = getHistory();
  history.unshift({
    date: new Date().toISOString(),
    teams: finalState.teams.map(t => ({ name: t.name, score: t.score }))
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
}

function initTeamInputs() {
  const count = Number($("team-count").value);
  const box = $("team-inputs");
  box.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "team-field";
    wrap.innerHTML = `
      <label for="team-${i}">Equipo ${i + 1}</label>
      <input id="team-${i}" maxlength="28" value="Equipo ${i + 1}" />
    `;
    box.appendChild(wrap);
  }
}

function showHistoryPreview() {
  const history = getHistory();
  const target = $("history-preview");
  if (!history.length) {
    target.innerHTML = "No hay partidas guardadas todavía.";
    return;
  }
  const last = history[0];
  const winner = [...last.teams].sort((a,b) => b.score - a.score)[0];
  target.innerHTML = `Última partida: <strong>${winner.name}</strong> ganó con <strong>${winner.score}</strong> puntos.`;
}

function startGame() {
  const count = Number($("team-count").value);
  const teams = [];
  for (let i = 0; i < count; i++) {
    const name = $(`team-${i}`).value.trim() || `Equipo ${i + 1}`;
    teams.push({ name, score: 0 });
  }
  state = { teams, used: {}, current: null, startedAt: Date.now() };
  saveState();
  showScreen("game");
  renderGame();
}

function showScreen(name) {
  $("setup-screen").classList.toggle("hidden", name !== "setup");
  $("game-screen").classList.toggle("hidden", name !== "game");
  $("final-screen").classList.toggle("hidden", name !== "final");
}

function renderGame() {
  renderScoreboard();
  renderBoard();
}

function renderScoreboard() {
  $("scoreboard").innerHTML = state.teams.map((team, index) => `
    <article class="team-score">
      <div class="team-name">${escapeHtml(team.name)}</div>
      <div class="team-points">${team.score}</div>
    </article>
  `).join("");
}

function renderBoard() {
  const board = $("board");
  board.innerHTML = "";
  QUESTIONS.forEach(cat => {
    const header = document.createElement("div");
    header.className = "category";
    header.textContent = cat.category;
    board.appendChild(header);
  });

  for (let row = 0; row < 5; row++) {
    QUESTIONS.forEach((cat, col) => {
      const item = cat.items[row];
      const key = `${col}-${row}`;
      const btn = document.createElement("button");
      btn.className = `cell ${state.used[key] ? "used" : ""}`;
      btn.textContent = state.used[key] ? "—" : item.points;
      btn.disabled = Boolean(state.used[key]);
      btn.addEventListener("click", () => openQuestion(col, row));
      board.appendChild(btn);
    });
  }
}

function openQuestion(col, row) {
  const cat = QUESTIONS[col];
  const item = cat.items[row];
  state.current = { col, row };
  $("modal-category").textContent = cat.category;
  $("modal-points").textContent = `${item.points} puntos`;
  $("question-text").textContent = item.q;
  $("answer-box").innerHTML = `<strong>Respuesta:</strong> ${escapeHtml(item.a)}`;
  $("answer-box").classList.add("hidden");
  $("show-answer").classList.remove("hidden");
  renderAwardButtons(false);
  $("question-modal").showModal();
}

function renderAwardButtons(show) {
  const box = $("award-buttons");
  if (!show) {
    box.innerHTML = "";
    return;
  }
  const { col, row } = state.current;
  const points = QUESTIONS[col].items[row].points;
  box.innerHTML = state.teams.map((team, idx) => `
    <button class="btn" data-team="${idx}">+${points} para ${escapeHtml(team.name)}</button>
  `).join("");
  box.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => award(Number(btn.dataset.team)));
  });
}

function revealAnswer() {
  $("answer-box").classList.remove("hidden");
  $("show-answer").classList.add("hidden");
  renderAwardButtons(true);
}

function markUsedAndClose() {
  if (!state.current) return;
  const key = `${state.current.col}-${state.current.row}`;
  state.used[key] = true;
  state.current = null;
  saveState();
  $("question-modal").close();
  renderGame();
  if (Object.keys(state.used).length === 25) finishGame();
}

function award(teamIndex) {
  const { col, row } = state.current;
  const points = QUESTIONS[col].items[row].points;
  state.teams[teamIndex].score += points;
  markUsedAndClose();
}

function finishGame() {
  saveHistory(state);
  localStorage.removeItem(STORAGE_KEY);
  renderFinal();
  showScreen("final");
  showHistoryPreview();
}

function renderFinal() {
  const sorted = [...state.teams].sort((a,b) => b.score - a.score);
  $("final-ranking").innerHTML = sorted.map((team, idx) => `
    <div class="rank-row">
      <div class="rank-pos">${idx + 1}</div>
      <div class="rank-name">${escapeHtml(team.name)}</div>
      <div class="rank-score">${team.score} pts</div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;"
  }[c]));
}

function wireEvents() {
  $("team-count").addEventListener("change", initTeamInputs);
  $("start-game").addEventListener("click", startGame);
  $("load-last").addEventListener("click", () => {
    if (loadState()) {
      showScreen("game");
      renderGame();
    } else {
      alert("No hay una partida en curso guardada.");
    }
  });
  $("clear-history").addEventListener("click", () => {
    if (confirm("¿Borrar historial de partidas?")) {
      localStorage.removeItem(HISTORY_KEY);
      showHistoryPreview();
    }
  });
  $("reset-board").addEventListener("click", () => {
    if (confirm("¿Empezar una partida nueva y perder la actual?")) {
      localStorage.removeItem(STORAGE_KEY);
      showScreen("setup");
    }
  });
  $("finish-game").addEventListener("click", finishGame);
  $("show-answer").addEventListener("click", revealAnswer);
  $("no-one").addEventListener("click", markUsedAndClose);
  $("close-modal").addEventListener("click", () => $("question-modal").close());
  $("play-again").addEventListener("click", () => {
    initTeamInputs();
    showScreen("setup");
  });
  $("back-home").addEventListener("click", () => showScreen("setup"));
  $("question-modal").addEventListener("cancel", (e) => {
    e.preventDefault();
    $("question-modal").close();
  });
}

initTeamInputs();
showHistoryPreview();
wireEvents();
