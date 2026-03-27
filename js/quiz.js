// ── Game Data ───────────────────────────────────────────────────
const colors = {
  red: '#FF0000', blue: '#0000FF', green: '#008000',
  yellow: '#FFD700', purple: '#800080', orange: '#FF8C00', pink: '#FF69B4'
};
const colorNames    = Object.keys(colors);
const darkColors    = ['red', 'blue', 'green', 'purple', 'orange'];
const lightBgs      = {
  lightblue: '#ADD8E6', lightgreen: '#90EE90', lightyellow: '#FFFFE0',
  lightpink: '#FFB6C1', lightorange: '#FFE4B5'
};
const lightBgKeys   = Object.keys(lightBgs);

// ── Game State ──────────────────────────────────────────────────
let currentRound = 0, score = 0, correctAnswer = '', gameActive = false;

// ── DOM References ──────────────────────────────────────────────
const startScreen  = document.getElementById('start-screen');
const playScreen   = document.getElementById('play-screen');
const resultScreen = document.getElementById('result-screen');
const statsSection = document.getElementById('stats-section');
const startBtn     = document.getElementById('start-btn');
const restartBtn   = document.getElementById('restart-btn');
const roundDisplay = document.getElementById('current-round');
const scoreDisplay = document.getElementById('current-score');
const colorCard    = document.getElementById('color-card');
const colorText    = document.getElementById('color-text');
const optionsEl    = document.getElementById('options');
const finalScore   = document.getElementById('final-score');
const accuracyEl   = document.getElementById('accuracy');
const encourageEl  = document.getElementById('encouragement-message');
const dispScore    = document.getElementById('display-score');
const dispAcc      = document.getElementById('display-accuracy');
const feedbackEl   = document.getElementById('feedback-message');

// ── Issue #47: mouseover on Start button ────────────────────────
startBtn.addEventListener('mouseover', function () { this.textContent = "Let's Go! 🎮"; });
startBtn.addEventListener('mouseout',  function () { this.textContent = 'Start Game'; });

// ── Issue #47: keyboard — press 1/2/3 to pick an option ────────
document.addEventListener('keydown', function (e) {
  if (!gameActive) return;
  const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
  if (idx !== undefined) {
    const btns = document.querySelectorAll('.option-btn:not([disabled])');
    if (btns[idx]) btns[idx].click();
  }
});

// ── Event Listeners ─────────────────────────────────────────────
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// ── Start / Restart ─────────────────────────────────────────────
function startGame() {
  currentRound = 0; score = 0; gameActive = true;
  startScreen.classList.add('hidden');
  playScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  nextRound();
}

// ── Next Round ──────────────────────────────────────────────────
function nextRound() {
  if (currentRound >= 20) { endGame(); return; }

  currentRound++;
  roundDisplay.textContent = currentRound;  // DOM: textContent
  scoreDisplay.textContent = score;

  // Determine colors by difficulty
  let bg, textColor, word;
  if (currentRound <= 2) {
    bg = '#FFFFFF'; word = randomColor(); textColor = colors[word];
  } else if (currentRound <= 7) {
    word = randomColor(); textColor = colors[word];
    bg = lightBgs[lightBgKeys[Math.floor(Math.random() * lightBgKeys.length)]];
  } else {
    word = randomColor();
    textColor = colors[darkColors[Math.floor(Math.random() * darkColors.length)]];
    bg = lightBgs[lightBgKeys[Math.floor(Math.random() * lightBgKeys.length)]];
  }
  correctAnswer = word;

  // DOM: update styles and text
  colorCard.style.backgroundColor = bg;
  colorText.style.color = textColor;
  colorText.textContent = word.toUpperCase();

  // Issue #49: setTimeout — fade in color card each round
  colorCard.style.opacity = '0';
  setTimeout(function () {
    colorCard.style.transition = 'opacity 0.25s';
    colorCard.style.opacity = '1';
  }, 10);

  buildOptions();
}

function randomColor() {
  return colorNames[Math.floor(Math.random() * colorNames.length)];
}

// ── Build Option Buttons ─────────────────────────────────────────
// Issue #46 (DOM): createElement + appendChild
function buildOptions() {
  optionsEl.innerHTML = '';
  const opts = [correctAnswer];
  while (opts.length < 3) {
    const c = randomColor();
    if (!opts.includes(c)) opts.push(c);
  }
  opts.sort(() => Math.random() - 0.5);

  opts.forEach(function (name) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = name.toUpperCase();
    btn.dataset.color = name;

    // Issue #47: mouseover on option buttons
    btn.addEventListener('mouseover', function () {
      if (!btn.disabled) btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseout', function () {
      btn.style.transform = '';
    });

    btn.addEventListener('click', function () { pickOption(name, btn); });
    optionsEl.appendChild(btn);
  });
}

// ── Handle Answer ────────────────────────────────────────────────
function pickOption(selected, btn) {
  if (!gameActive) return;
  document.querySelectorAll('.option-btn').forEach(function (b) { b.disabled = true; });

  if (selected === correctAnswer) {
    score++;
    btn.classList.add('correct');
    scoreDisplay.textContent = score; // DOM: textContent
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn').forEach(function (b) {
      if (b.dataset.color === correctAnswer) b.classList.add('correct');
    });
  }

  // Issue #49: setTimeout — wait before next round
  setTimeout(nextRound, 1000);
}

// ── End Game ─────────────────────────────────────────────────────
function endGame() {
  gameActive = false;
  playScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const acc = Math.round((score / 20) * 100);
  finalScore.textContent = score;       // DOM: textContent
  accuracyEl.textContent = acc;
  encourageEl.textContent = getMessage(acc);

  statsSection.classList.remove('hidden');
  dispScore.textContent = score;
  dispAcc.textContent = acc + '%';
  feedbackEl.textContent = getFeedback(acc);
}

function getMessage(acc) {
  if (acc === 100) return 'Perfect Score! Incredible focus!';
  if (acc >= 80)  return 'Great job! Excellent concentration!';
  if (acc >= 60)  return 'Good effort! Keep practicing!';
  return "Every attempt makes you stronger! Try again!";
}

function getFeedback(acc) {
  if (acc >= 75) return 'Strong cognitive control — keep it up!';
  if (acc >= 50) return 'The Stroop Effect is tricky. Practice will help!';
  return 'Most people find this difficult at first. Try again!';
}