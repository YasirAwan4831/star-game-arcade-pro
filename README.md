<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=280&color=0:0F2027,50:203A43,100:2C5364&text=⭐%20STAR%20GAME&fontSize=65&fontAlignY=38&animation=fadeIn&fontColor=ffffff&desc=Ultimate%20Cosmic%20Reflex%20Arcade&descAlignY=58&descSize=22"/>

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=24&duration=3000&pause=1000&color=F7C948&center=true&vCenter=true&width=900&lines=⭐+Click+Stars+%E2%80%94+Score+Points;💣+Dodge+Bombs+%E2%80%94+Survive+Longer;⚡+Grab+Power-Ups+%E2%80%94+Dominate+the+Board;🏆+Beat+the+Leaderboard+%E2%80%94+Claim+the+Top" />

<br>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/No%20Framework-Pure%20Vanilla-success?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20Ready-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blueviolet?style=for-the-badge)

<br>

> **A fully browser-based, zero-dependency arcade reflex game.**
> Click stars, dodge bombs, collect power-ups — beat the leaderboard.

<br>

[▶ Play Now](#-quick-start) • [✨ Features](#-features) • [🧠 Tech Stack](#-tech-stack) • [🏆 Leaderboard](#-leaderboard-system)

</div>

---

## 🌌 What is Star Game?

**Star Game** is a modern, polished, browser-based arcade game built entirely with **HTML**, **CSS**, and **Vanilla JavaScript** — no libraries, no frameworks, no dependencies.

Stars bounce around the screen. You click them. Bombs appear. You avoid them. Power-ups drop. You grab them. The clock is ticking, your lives are limited, and the leaderboard is watching.

```
⭐  Click the star   →   +1 point (or +2 with Double Score)
💣  Click the bomb   →   -1 life
🎯  Miss the area    →   -1 life (Medium / Hard only)
⚡  Grab power-up    →   Special effect activated
⏰  Timer hits zero  →   Game Over
💔  Lives hit zero   →   Game Over
```

---

## ✨ Features

### 🎮 Core Gameplay

| Feature | Description |
|---------|-------------|
| ⭐ Moving Stars | Multiple stars bounce around with real physics |
| 💣 Bombs | Dangerous objects — click them and lose a life |
| ⏰ Countdown Timer | Race against the clock to maximize your score |
| ❤️ Lives System | 2–5 lives depending on difficulty |
| 📈 Level System | Every 10 points = level up, faster objects |
| 🎯 Miss Penalty | Empty-area clicks penalized (Medium / Hard) |

### ⚡ Power-Ups

| Power-Up | Effect | Duration |
|----------|--------|----------|
| 🧊 Freeze | Stops the timer completely | 5 seconds |
| ✨ Double Score | Every star gives 2 points | 7 seconds |
| 🐌 Slow Motion | All objects move at half speed | 6 seconds |
| 💖 Extra Life | Instantly gain +1 life (max 5) | Instant |

### 🏆 Game Systems

| System | Details |
|--------|---------|
| 🎚️ Difficulty Levels | Easy / Medium / Hard — affects speed, bombs, timer, lives |
| 🏅 Leaderboard | Top 10 scores with player names stored in LocalStorage |
| 💾 High Score | Persistent best score displayed on the start screen |
| ⏸ Pause System | Pause / Resume anytime (button or keyboard shortcut) |
| 🔊 Audio | Web Audio API — star click, bomb, level up, game over |
| 🎵 Background Music | Toggleable ambient music with mute button |
| 📱 Touch Support | Full mobile & tablet support via Pointer Events |

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────────────────┐
│                  ★  STAR GAME  ★                    │
│              Cosmic Reflex Challenge                 │
│                                                      │
│          ┌─────────────────────────┐                 │
│          │  BEST SCORE:   142      │                 │
│          └─────────────────────────┘                 │
│                                                      │
│        [ EASY ]  [ MEDIUM ]  [ HARD ]                │
│                                                      │
│             ▶  START GAME                            │
│                                                      │
│   ⭐ Click stars  |  💣 Avoid bombs  |  ⚡ Grab PUs │
│                                                      │
│                🏆 LEADERBOARD                        │
└─────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  SCORE: 42  │  LEVEL: 5  │  ⏰ 18  │  LIVES: ❤️❤️❤️  │
├───────────────────────────────────────────────────────┤
│                                                       │
│          ⭐              💣                           │
│                   ✨                                  │
│   💣                        ⭐                        │
│              ⭐                    💣                 │
│                       🧊                             │
│                                                       │
│   [ ⏸ PAUSE ]      MEDIUM      [ 🔊 MUSIC ]         │
└───────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1 — Just open in browser (zero setup)

```bash
# Download the project
git clone https://github.com/yourusername/star-game.git
cd star-game

# Open directly
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

### Option 2 — Live development server

```bash
npm install
npm run dev
```

### Option 3 — Static production server

```bash
npm run start
```

> ✅ No build step. No compilation. No config. Just open and play.

---

## 📁 Project Structure

```
star-game/
│
├── 📄 index.html        →  Game structure, screens & UI modals
├── 🎨 style.css         →  Neon arcade theme, animations, responsive layout
├── ⚡ script.js         →  Complete game logic (676 lines, fully commented)
├── 📦 package.json      →  Optional dev server scripts
└── 📖 README.md         →  This file
```

### File Breakdown

```
index.html  (5.3 KB)
  ├── Start Screen      — Difficulty selector, high score, instructions
  ├── Game Screen       — HUD, game area, controls bar
  ├── Pause Screen      — Resume / Restart / Menu
  ├── Game Over Screen  — Stats, name input, save to leaderboard
  └── Leaderboard Modal — Top 10 scores display

style.css  (19 KB)
  ├── CSS Variables     — Color palette, glow effects, fonts
  ├── Screen System     — Fullscreen overlays with transitions
  ├── Game Objects      — Star, bomb, power-up animations
  ├── HUD               — Timer, score, lives display
  ├── Visual FX         — Burst, float score, shake, flash
  └── Responsive        — Mobile-first breakpoints

app.js  (24 KB)
  ├── Configuration     — Difficulty presets, power-up definitions
  ├── State Manager     — Central game state object
  ├── Audio Engine      — Web Audio API synthesis
  ├── Canvas Particles  — Background animation system
  ├── Object System     — Create, move, remove game objects
  ├── Game Loop         — requestAnimationFrame physics engine
  ├── Power-Up System   — Apply, timeout, display indicators
  ├── Level System      — Auto level-up with speed boost
  ├── Lives System      — Damage, shake, flash, game over
  └── Event Listeners   — All buttons, keyboard, touch
```

---

## 🧠 Tech Stack

| Technology | Purpose | Why Used |
|------------|---------|----------|
| **HTML5** | Game structure & screens | Semantic layout, no framework needed |
| **CSS3** | Animations, themes, responsive | Pure CSS keyframes, glassmorphism |
| **Vanilla JS** | All game logic | Zero dependencies, full control |
| **Web Audio API** | Sound effects & music | No external audio files needed |
| **Canvas API** | Background particle system | Smooth 60fps particle animation |
| **LocalStorage** | Scores & leaderboard | Persistent data without a backend |
| **Pointer Events API** | Mouse + touch input | One handler for all devices |
| **requestAnimationFrame** | Game physics loop | Smooth, frame-rate independent movement |

---

## 🎚️ Difficulty Comparison

| Setting | Timer | Stars | Bombs | Lives | Speed | Spawn Rate |
|---------|-------|-------|-------|-------|-------|------------|
| 🟢 Easy   | 35s  | 3     | 1     | 5     | 1.5x  | 3.5s |
| 🟡 Medium | 30s  | 4     | 2     | 3     | 2.5x  | 2.8s |
| 🔴 Hard   | 25s  | 5     | 3     | 2     | 3.8x  | 2.0s |

> Speed increases by **+12% per level** on all difficulties.

---

## 🏆 Leaderboard System

- Stores **Top 10 scores** in `localStorage` — persists across sessions
- Player enters their name after each game
- Entries include: **Rank**, **Player Name**, **Score**, **Level Reached**
- 🥇🥈🥉 Medal icons for top 3 positions
- Accessible from the Start Screen anytime

---

## ⌨️ Controls

| Input | Action |
|-------|--------|
| **Click / Tap** ⭐ | Score a point |
| **Click / Tap** 💣 | Lose a life |
| **Click / Tap** ⚡ | Activate power-up |
| **`P`** key | Pause / Resume |
| **`Escape`** key | Pause / Resume |
| **Pause Button** | Pause game |
| **Music Button** | Toggle background music |

---

## 📱 Device Support

| Device | Status |
|--------|--------|
| 🖥️ Desktop (Chrome, Firefox, Edge, Safari) | ✅ Full support |
| 📱 Mobile (iOS Safari, Android Chrome) | ✅ Full support |
| 📟 Tablet | ✅ Full support |
| 🖱️ Mouse | ✅ Click events |
| 👆 Touch | ✅ Pointer events |

---

## 🔧 Configuration

Want to tweak the game? All settings are in the top of `script.js`:

```javascript
const DIFFICULTY = {
  easy: {
    timerStart: 35,    // Starting seconds
    starCount:  3,     // Initial stars on screen
    bombCount:  1,     // Initial bombs on screen
    starSpeed:  1.5,   // Star movement speed
    bombSpeed:  1.2,   // Bomb movement speed
    spawnRate:  3500,  // New object every X ms
    livesStart: 5,     // Starting lives
  },
  // medium, hard...
};
```

---

## 🤝 Contributing

Contributions [!CONTRIBUTING.md](CONTRIBUTING.md)] are welcome!  Here are some ideas:

- 🎨 New themes (Halloween, Space, Ocean)
- 🔫 New game objects (shields, multipliers)
- 📊 Stats screen (accuracy, click speed)
- 🌐 Online leaderboard via API
- 🎵 Better background music system

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License


## License

This project is licensed under the [MIT License](LICENSE) — free to use, modify and distribute.
Attribution appreciated but not required.
```

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=20&duration=2500&pause=1000&color=7B2FF7&center=true&vCenter=true&width=700&lines=Thanks+for+checking+out+Star+Game!;Star+the+repo+if+you+enjoyed+it+⭐;Built+with+Passion+%26+Vanilla+JavaScript" />

<br>

![Stars](https://img.shields.io/badge/If%20you%20liked%20it-Star%20the%20Repo%20⭐-F7C948?style=for-the-badge)
![Made With Love](https://img.shields.io/badge/Made%20with-Passion%20%26%20JS-ff4fa3?style=for-the-badge&logo=javascript)
![Open Source](https://img.shields.io/badge/Open%20Source-Forever-4ff7c1?style=for-the-badge)

<br>

### 👨‍💻 Muhammad Yasir
**Full Stack Web Developer · AI Automation Learner**

<br>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=140&section=footer&color=0:0F2027,50:203A43,100:2C5364"/>

</div>