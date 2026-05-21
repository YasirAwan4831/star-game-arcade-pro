/* ============================================================
   STAR GAME — script.js
   Full arcade game logic: stars, bombs, power-ups, levels,
   lives, leaderboard, sound, particles, animations.
   ============================================================ */

"use strict";

/* ============================================================
   1. CONFIGURATION — Difficulty presets
   ============================================================ */
const DIFFICULTY = {
  easy: {
    timerStart:   35,
    starCount:    3,
    bombCount:    1,
    starSpeed:    1.5,
    bombSpeed:    1.2,
    spawnRate:    3500,   // ms between new spawns
    missChance:   true,   // clicking empty area costs a life
    livesStart:   5,
  },
  medium: {
    timerStart:   30,
    starCount:    4,
    bombCount:    2,
    starSpeed:    2.5,
    bombSpeed:    2.0,
    spawnRate:    2800,
    missChance:   true,
    livesStart:   3,
  },
  hard: {
    timerStart:   25,
    starCount:    5,
    bombCount:    3,
    starSpeed:    3.8,
    bombSpeed:    3.0,
    spawnRate:    2000,
    missChance:   true,
    livesStart:   2,
  },
};

// Power-up types
const POWERUPS = [
  { id: "freeze",  emoji: "🧊", label: "⏸ TIME FROZEN",    color: "#4ff7c1", duration: 5000 },
  { id: "double",  emoji: "✨", label: "✨ DOUBLE SCORE",   color: "#f7c948", duration: 7000 },
  { id: "slow",    emoji: "🐌", label: "🐌 SLOW MOTION",   color: "#c084fc", duration: 6000 },
  { id: "life",    emoji: "💖", label: "💖 EXTRA LIFE",     color: "#ff4fa3", duration: 0 },
];

/* ============================================================
   2. STATE
   ============================================================ */
let state = {
  running:      false,
  paused:       false,
  difficulty:   "easy",
  score:        0,
  level:        1,
  lives:        3,
  timeLeft:     30,
  highScore:    0,
  activePowerup: null,    // { id, timeoutId }
  musicOn:      false,
  objects:      [],       // { id, type, x, y, dx, dy, el }
  objIdCounter: 0,
};

let loopId       = null;   // requestAnimationFrame id
let timerIntId   = null;   // setInterval for countdown
let spawnIntId   = null;   // setInterval for spawning

// Leaderboard (stored in LocalStorage)
const LB_KEY       = "starGameLeaderboard";
const HS_KEY       = "starGameHighScore";
const HS_LEVEL_KEY = "starGameHighLevel";

/* ============================================================
   3. DOM REFS
   ============================================================ */
const $ = id => document.getElementById(id);

const screens = {
  start:      $("startScreen"),
  game:       $("gameScreen"),
  pause:      $("pauseScreen"),
  gameover:   $("gameOverScreen"),
  leaderboard:$("leaderboardModal"),
};

const hud = {
  score:     $("scoreDisplay"),
  level:     $("levelDisplay"),
  timer:     $("timerDisplay"),
  lives:     $("livesDisplay"),
  highScore: $("highScoreDisplay"),
};

const gameArea   = $("gameArea");
const bgCanvas   = $("bgCanvas");
const ctx        = bgCanvas.getContext("2d");

/* ============================================================
   4. SCREEN MANAGEMENT
   ============================================================ */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.remove("active");
    el.style.display = "";
  });
  const s = screens[name];
  s.style.display = "flex";
  s.classList.add("active");
}

/* ============================================================
   5. BACKGROUND PARTICLE CANVAS
   ============================================================ */
let bgParticles = [];

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function initBgParticles(count = 120) {
  bgParticles = [];
  for (let i = 0; i < count; i++) {
    bgParticles.push({
      x:    Math.random() * bgCanvas.width,
      y:    Math.random() * bgCanvas.height,
      r:    Math.random() * 1.5 + 0.3,
      dx:   (Math.random() - 0.5) * 0.25,
      dy:   (Math.random() - 0.5) * 0.25,
      a:    Math.random(),
      da:   (Math.random() - 0.5) * 0.005,
    });
  }
}

function animateBg() {
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgParticles.forEach(p => {
    p.x  = (p.x + p.dx + bgCanvas.width)  % bgCanvas.width;
    p.y  = (p.y + p.dy + bgCanvas.height) % bgCanvas.height;
    p.a += p.da;
    if (p.a < 0) p.da = Math.abs(p.da);
    if (p.a > 1) p.da = -Math.abs(p.da);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(247,201,72,${p.a * 0.6})`;
    ctx.fill();
  });
  requestAnimationFrame(animateBg);
}

window.addEventListener("resize", () => { resizeBg(); initBgParticles(); });
resizeBg();
initBgParticles();
animateBg();

/* ============================================================
   6. AUDIO — Web Audio API (no external deps)
   ============================================================ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Generic beep generator
function playBeep({ frequency = 440, type = "sine", duration = 0.15, gain = 0.3, ramp = true } = {}) {
  try {
    const ac  = getAudioCtx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type      = type;
    osc.frequency.value = frequency;
    g.gain.value  = state.musicOn ? gain : 0;
    osc.start();
    if (ramp) {
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.stop(ac.currentTime + duration);
    } else {
      osc.stop(ac.currentTime + duration);
    }
  } catch(e) { /* silence errors in restricted environments */ }
}

const sounds = {
  starClick:  () => playBeep({ frequency: 880, type: "triangle", duration: 0.12, gain: 0.4 }),
  bombHit:    () => { playBeep({ frequency: 120, type: "sawtooth", duration: 0.3, gain: 0.5 }); },
  levelUp:    () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playBeep({ frequency: f, duration: 0.15, gain: 0.35 }), i * 100)
    );
  },
  gameOver:   () => [440, 350, 280, 220].forEach((f, i) =>
    setTimeout(() => playBeep({ frequency: f, type: "sawtooth", duration: 0.25, gain: 0.4 }), i * 120)
  ),
  powerUp:    () => [660, 770, 880].forEach((f, i) =>
    setTimeout(() => playBeep({ frequency: f, type: "triangle", duration: 0.12, gain: 0.3 }), i * 80)
  ),
  btnClick:   () => playBeep({ frequency: 600, type: "square", duration: 0.07, gain: 0.2 }),
  miss:       () => playBeep({ frequency: 200, type: "sawtooth", duration: 0.1, gain: 0.25 }),
};

// Background music (simple oscillator loop)
let bgMusicNodes = null;

function startBgMusic() {
  if (bgMusicNodes) return;
  try {
    const ac    = getAudioCtx();
    const osc   = ac.createOscillator();
    const g     = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.value = 110;
    g.gain.value = 0.04;
    osc.start();
    bgMusicNodes = { osc, g };
  } catch(e) {}
}

function stopBgMusic() {
  if (!bgMusicNodes) return;
  try { bgMusicNodes.osc.stop(); } catch(e) {}
  bgMusicNodes = null;
}

/* ============================================================
   7. HIGHSCORE & LEADERBOARD (LocalStorage)
   ============================================================ */
function loadHighScore() {
  return parseInt(localStorage.getItem(HS_KEY) || "0", 10);
}
function saveHighScore(s) {
  if (s > loadHighScore()) localStorage.setItem(HS_KEY, s);
}

function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || "[]"); }
  catch(e) { return []; }
}

function saveToLeaderboard(name, score, level) {
  const lb  = loadLeaderboard();
  lb.push({ name: name || "Anonymous", score, level, date: Date.now() });
  lb.sort((a, b) => b.score - a.score);
  lb.splice(10); // keep top 10
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

function renderLeaderboard() {
  const list = $("leaderboardList");
  const lb   = loadLeaderboard();
  list.innerHTML = "";
  if (!lb.length) {
    list.innerHTML = "<li style='justify-content:center;color:var(--text-dim);font-size:0.9rem'>No scores yet — play first!</li>";
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  lb.forEach((entry, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="lb-rank">${medals[i] || (i + 1)}</span>
      <span class="lb-name">${escapeHtml(entry.name)}</span>
      <span class="lb-score">${entry.score}</span>
      <span style="font-size:0.7rem;color:var(--text-dim);margin-left:8px">Lv${entry.level}</span>
    `;
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}

/* ============================================================
   8. HUD UPDATES
   ============================================================ */
function updateHUD() {
  hud.score.textContent     = state.score;
  hud.level.textContent     = state.level;
  hud.timer.textContent     = state.timeLeft;
  hud.timer.classList.toggle("danger", state.timeLeft <= 8);
  hud.highScore.textContent = Math.max(state.score, loadHighScore());
  updateLivesDisplay();
}

function updateLivesDisplay() {
  hud.lives.textContent = "❤️".repeat(Math.max(0, state.lives)) || "💔";
}

/* ============================================================
   9. GAME OBJECTS — Creation & Removal
   ============================================================ */

/**
 * Create a DOM element for a game object and start tracking it.
 * @param {string} type  "star" | "bomb" | "powerup"
 * @param {object} extra Optional extra data (powerup index)
 */
function createObject(type, extra = {}) {
  const area  = gameArea.getBoundingClientRect();
  const conf  = DIFFICULTY[state.difficulty];
  const id    = ++state.objIdCounter;

  // Sizing
  const size  = (type === "powerup") ? 44 : 48;

  // Random position, ensure fully inside
  const x     = Math.random() * (area.width  - size - 10) + 5;
  const y     = Math.random() * (area.height - size - 10) + 5;

  // Speed based on type + level multiplier
  const lvlFactor = 1 + (state.level - 1) * 0.12;
  const base  = type === "bomb"
    ? conf.bombSpeed * lvlFactor
    : conf.starSpeed * lvlFactor;

  const angle = Math.random() * Math.PI * 2;
  const dx    = Math.cos(angle) * base;
  const dy    = Math.sin(angle) * base;

  // Build DOM element
  const el = document.createElement("div");
  el.classList.add("game-obj");

  if (type === "star") {
    el.classList.add("star-obj");
    el.textContent = "⭐";
    el.setAttribute("data-pts", "1");
  } else if (type === "bomb") {
    el.classList.add("bomb-obj");
    el.textContent = "💣";
  } else if (type === "powerup") {
    el.classList.add("powerup-obj");
    const pu = POWERUPS[extra.puIdx];
    el.textContent = pu.emoji;
    el.style.borderColor = pu.color;
    el.setAttribute("data-pu", extra.puIdx);
    // Auto-remove powerup after 7s
    setTimeout(() => removeObject(id), 7000);
  }

  el.style.left = x + "px";
  el.style.top  = y + "px";

  // Click / touch handler
  el.addEventListener("pointerdown", e => {
    e.stopPropagation();
    handleObjectClick(id, type, extra, el, e);
  });

  gameArea.appendChild(el);

  const obj = { id, type, x, y, dx, dy, el, puIdx: extra.puIdx };
  state.objects.push(obj);
  return obj;
}

function removeObject(id) {
  const idx = state.objects.findIndex(o => o.id === id);
  if (idx === -1) return;
  const obj = state.objects[idx];
  obj.el.remove();
  state.objects.splice(idx, 1);
}

function clearAllObjects() {
  state.objects.forEach(o => o.el.remove());
  state.objects = [];
}

/* ============================================================
   10. CLICK HANDLERS
   ============================================================ */
function handleObjectClick(id, type, extra, el, event) {
  if (!state.running || state.paused) return;

  const rect = el.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2 - areaRect.left;
  const cy   = rect.top  + rect.height / 2 - areaRect.top;

  if (type === "star") {
    // Score points
    const pts    = state.activePowerup?.id === "double" ? 2 : 1;
    state.score += pts;
    sounds.starClick();
    spawnFloatScore("+" + pts, cx, cy, "#f7c948");
    spawnBurst(cx, cy, false);
    removeObject(id);
    checkLevelUp();
    updateHUD();

  } else if (type === "bomb") {
    // Lose a life
    sounds.bombHit();
    spawnBurst(cx, cy, true);
    spawnFloatScore("💥", cx, cy, "#ff3c3c");
    removeObject(id);
    loseLife();

  } else if (type === "powerup") {
    sounds.powerUp();
    const pu = POWERUPS[extra.puIdx];
    spawnFloatScore(pu.emoji, cx, cy, pu.color);
    spawnBurst(cx, cy, false);
    removeObject(id);
    applyPowerup(extra.puIdx);
  }
}

// Clicking empty area = miss (costs a life in medium/hard)
gameArea.addEventListener("pointerdown", e => {
  if (!state.running || state.paused) return;
  if (e.target !== gameArea) return; // hit an object — handled above
  if (state.difficulty !== "easy") {
    sounds.miss();
    loseLife();
    spawnBurst(e.clientX - gameArea.getBoundingClientRect().left,
               e.clientY - gameArea.getBoundingClientRect().top, false);
  }
});

/* ============================================================
   11. GAME LOOP (requestAnimationFrame)
   ============================================================ */
let lastTs = null;

function gameLoop(ts) {
  if (!state.running || state.paused) return;
  loopId = requestAnimationFrame(gameLoop);

  const dt = lastTs ? Math.min((ts - lastTs) / 16.67, 3) : 1; // cap delta
  lastTs = ts;

  const areaW = gameArea.clientWidth;
  const areaH = gameArea.clientHeight;

  state.objects.forEach(obj => {
    // Slow motion power-up halves speed
    const speedFactor = (state.activePowerup?.id === "slow") ? 0.45 : 1;
    // Freeze stops all (stars+bombs stay still) but powerups still move slowly
    if (state.activePowerup?.id === "freeze" && obj.type !== "powerup") return;

    obj.x += obj.dx * dt * speedFactor;
    obj.y += obj.dy * dt * speedFactor;

    const size = obj.type === "powerup" ? 44 : 48;

    // Bounce off walls
    if (obj.x <= 0) { obj.x = 0; obj.dx = Math.abs(obj.dx); }
    if (obj.y <= 0) { obj.y = 0; obj.dy = Math.abs(obj.dy); }
    if (obj.x + size >= areaW) { obj.x = areaW - size; obj.dx = -Math.abs(obj.dx); }
    if (obj.y + size >= areaH) { obj.y = areaH - size; obj.dy = -Math.abs(obj.dy); }

    obj.el.style.left = obj.x + "px";
    obj.el.style.top  = obj.y + "px";
  });
}

/* ============================================================
   12. TIMER
   ============================================================ */
function startTimer() {
  clearInterval(timerIntId);
  timerIntId = setInterval(() => {
    if (state.paused || state.activePowerup?.id === "freeze") return;
    state.timeLeft--;
    updateHUD();
    if (state.timeLeft <= 0) endGame("time");
  }, 1000);
}

/* ============================================================
   13. SPAWNING
   ============================================================ */
function startSpawning() {
  clearInterval(spawnIntId);
  const conf = DIFFICULTY[state.difficulty];
  spawnIntId = setInterval(() => {
    if (state.paused || !state.running) return;
    spawnExtra();
  }, conf.spawnRate);
}

/**
 * Spawn an extra random object (star, bomb, or powerup).
 * Stars are most common; powerups rare.
 */
function spawnExtra() {
  const roll = Math.random();
  if (roll < 0.55) {
    createObject("star");
  } else if (roll < 0.85) {
    const conf = DIFFICULTY[state.difficulty];
    const currentBombs = state.objects.filter(o => o.type === "bomb").length;
    if (currentBombs < conf.bombCount + state.level) createObject("bomb");
  } else {
    // Powerup (rare)
    if (!state.activePowerup) {
      const puIdx = Math.floor(Math.random() * POWERUPS.length);
      createObject("powerup", { puIdx });
    }
  }
}

/* ============================================================
   14. POWER-UPS
   ============================================================ */
function applyPowerup(puIdx) {
  const pu = POWERUPS[puIdx];

  // Clear existing powerup timer
  if (state.activePowerup?.timeoutId) clearTimeout(state.activePowerup.timeoutId);

  if (pu.id === "life") {
    // Instant: extra life
    state.lives = Math.min(state.lives + 1, 5);
    updateHUD();
    showPowerupIndicator("💖 +1 LIFE", pu.color);
    setTimeout(() => $("powerupIndicator").classList.add("hidden"), 2000);
    state.activePowerup = null;
    return;
  }

  state.activePowerup = { id: pu.id };
  showPowerupIndicator(pu.label, pu.color);

  const tid = setTimeout(() => {
    state.activePowerup = null;
    $("powerupIndicator").classList.add("hidden");
  }, pu.duration);
  state.activePowerup.timeoutId = tid;
}

function showPowerupIndicator(label, color) {
  const ind = $("powerupIndicator");
  ind.textContent    = label;
  ind.style.color    = color;
  ind.style.borderColor = color;
  ind.style.boxShadow   = `0 0 18px ${color}aa, 0 0 40px ${color}40`;
  ind.classList.remove("hidden");
}

/* ============================================================
   15. LIVES
   ============================================================ */
function loseLife() {
  state.lives--;
  updateHUD();
  // Screen shake
  gameArea.classList.remove("shake");
  void gameArea.offsetWidth; // reflow trick to restart animation
  gameArea.classList.add("shake");
  // Red flash overlay
  const flash = document.createElement("div");
  flash.className = "damage-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);

  if (state.lives <= 0) endGame("lives");
}

/* ============================================================
   16. LEVEL SYSTEM
   ============================================================ */
function checkLevelUp() {
  const newLevel = Math.floor(state.score / 10) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    sounds.levelUp();
    showLevelUpOverlay();
    // Increase speed of existing objects slightly
    const speedBoost = 1 + state.level * 0.05;
    state.objects.forEach(o => {
      o.dx *= speedBoost;
      o.dy *= speedBoost;
    });
    // Possibly spawn extra bomb
    if (state.level % 3 === 0) createObject("bomb");
  }
}

function showLevelUpOverlay() {
  const overlay = $("levelUpOverlay");
  overlay.classList.remove("hidden");
  overlay.querySelector("span").textContent = `LEVEL ${state.level}!`;
  setTimeout(() => overlay.classList.add("hidden"), 1200);
}

/* ============================================================
   17. VISUAL FX
   ============================================================ */

/** Spawn a floating score text at game-area-relative position */
function spawnFloatScore(text, x, y, color) {
  const el = document.createElement("div");
  el.className    = "float-score";
  el.textContent  = text;
  el.style.color  = color;
  el.style.left   = x + "px";
  el.style.top    = y + "px";
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/** Spawn a click burst effect */
function spawnBurst(x, y, isBomb) {
  const el = document.createElement("div");
  el.className = "click-burst" + (isBomb ? " bomb-burst" : "");
  el.style.left = x + "px";
  el.style.top  = y + "px";
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

/* ============================================================
   18. GAME FLOW — Start, End, Restart, Pause
   ============================================================ */

/** Show pre-game countdown (3, 2, 1, GO!) then start. */
function startCountdown(callback) {
  const overlay = $("countdownOverlay");
  const numEl   = $("countdownNum");
  overlay.classList.remove("hidden");
  overlay.style.display = "flex";

  const steps = ["3", "2", "1", "GO!"];
  let i = 0;

  const tick = () => {
    numEl.textContent = steps[i];
    // restart animation
    numEl.style.animation = "none";
    void numEl.offsetWidth;
    numEl.style.animation = "";
    i++;
    if (i < steps.length) {
      setTimeout(tick, 900);
    } else {
      setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.style.display = "";
        callback();
      }, 700);
    }
  };
  tick();
}

function startGame() {
  sounds.btnClick();

  const conf = DIFFICULTY[state.difficulty];

  // Reset state
  state.score        = 0;
  state.level        = 1;
  state.lives        = conf.livesStart;
  state.timeLeft     = conf.timerStart;
  state.running      = false;
  state.paused       = false;
  state.activePowerup = null;
  lastTs             = null;

  // Load high score
  state.highScore = loadHighScore();

  // Show game screen first (so getBoundingClientRect works)
  showScreen("game");
  $("diffBadge").textContent = state.difficulty.toUpperCase();
  clearAllObjects();
  updateHUD();
  $("powerupIndicator").classList.add("hidden");
  $("levelUpOverlay").classList.add("hidden");

  // Countdown then begin
  startCountdown(() => {
    state.running = true;

    // Spawn initial objects
    const c = DIFFICULTY[state.difficulty];
    for (let i = 0; i < c.starCount; i++) createObject("star");
    for (let i = 0; i < c.bombCount; i++) createObject("bomb");

    startTimer();
    startSpawning();
    loopId = requestAnimationFrame(gameLoop);

    if (state.musicOn) startBgMusic();
  });
}

function pauseGame() {
  if (!state.running) return;
  state.paused = true;
  sounds.btnClick();
  showScreen("pause");
}

function resumeGame() {
  state.paused = false;
  sounds.btnClick();
  showScreen("game");
  lastTs = null;
  loopId = requestAnimationFrame(gameLoop);
}

function stopTimers() {
  cancelAnimationFrame(loopId);
  clearInterval(timerIntId);
  clearInterval(spawnIntId);
}

function endGame(reason) {
  state.running = false;
  stopTimers();
  stopBgMusic();
  sounds.gameOver();

  saveHighScore(state.score);

  // Prepare game over screen
  $("finalScore").textContent = state.score;
  $("finalLevel").textContent = state.level;
  $("gameOverTitle").textContent = reason === "lives" ? "💔 OUT OF LIVES" : "⏰ TIME'S UP";
  $("newRecordBadge").style.display = state.score >= loadHighScore() && state.score > 0 ? "flex" : "none";
  $("playerNameInput").value = "";

  setTimeout(() => showScreen("gameover"), 400);
}

function restartGame() {
  sounds.btnClick();
  clearAllObjects();
  stopTimers();
  startGame();
}

/* ============================================================
   19. UI EVENT LISTENERS
   ============================================================ */

// -- Start screen --
document.querySelectorAll(".diff-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.difficulty = btn.dataset.diff;
    sounds.btnClick();
  });
});

$("startBtn").addEventListener("click", startGame);

$("leaderboardBtn").addEventListener("click", () => {
  sounds.btnClick();
  renderLeaderboard();
  showScreen("leaderboard");
});

// -- Game controls --
$("pauseBtn").addEventListener("click", pauseGame);

$("musicBtn").addEventListener("click", () => {
  state.musicOn = !state.musicOn;
  $("musicBtn").textContent = state.musicOn ? "🔊 MUSIC" : "🔇 MUTED";
  sounds.btnClick();
  if (state.musicOn && state.running && !state.paused) {
    startBgMusic();
  } else {
    stopBgMusic();
  }
});

// -- Pause screen --
$("resumeBtn").addEventListener("click", resumeGame);
$("pauseRestartBtn").addEventListener("click", restartGame);
$("pauseMenuBtn").addEventListener("click", () => {
  sounds.btnClick();
  clearAllObjects();
  stopTimers();
  state.running = false;
  showScreen("start");
  $("startHighScore").textContent = loadHighScore();
});

// -- Game over screen --
$("saveScoreBtn").addEventListener("click", () => {
  const name = $("playerNameInput").value.trim();
  saveToLeaderboard(name, state.score, state.level);
  sounds.btnClick();
  $("saveScoreBtn").textContent = "✅ SAVED!";
  $("saveScoreBtn").disabled = true;
});

$("restartBtn").addEventListener("click", restartGame);

$("menuBtn").addEventListener("click", () => {
  sounds.btnClick();
  clearAllObjects();
  stopTimers();
  showScreen("start");
  $("startHighScore").textContent = loadHighScore();
});

// -- Leaderboard --
$("closeLbBtn").addEventListener("click", () => {
  sounds.btnClick();
  showScreen("start");
});

// -- Keyboard: Escape = pause/resume --
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (state.running && !state.paused) pauseGame();
    else if (state.paused) resumeGame();
  }
  // P = pause toggle
  if (e.key === "p" || e.key === "P") {
    if (state.running && !state.paused) pauseGame();
    else if (state.paused) resumeGame();
  }
});

/* ============================================================
   20. INIT on load
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  $("startHighScore").textContent = loadHighScore();
  showScreen("start");
});