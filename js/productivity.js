/* =========================================================
   productivity.js  –  LifeQuest: Productivity Arena
   ========================================================= */

"use strict";

/* ── Constants ───────────────────────────────────────────── */
const POINTS_PER_GOAL    = 20;
const POINTS_PER_SESSION = 15;
const POMODORO_SECONDS   = 25 * 60;   // 25 minutes

const MILESTONES = [
  { id: "streak3",   label: "🔥 3-Day Streak",       reward: "+50 bonus points", threshold: () => getStreak() >= 3,              onUnlock: () => addPoints(50) },
  { id: "sessions5", label: "⚡ 5 Focus Sessions",    reward: "Productivity Badge unlocked!", threshold: () => getSessions() >= 5, onUnlock: () => {} },
  { id: "goals10",   label: "🏆 10 Goals Completed",  reward: "Hall of Fame!",    threshold: () => getGoalsCompleted() >= 10,     onUnlock: () => {} },
];

/* ── State ───────────────────────────────────────────────── */
let goals           = JSON.parse(localStorage.getItem("pq_goals")    || "[]");
let points          = parseInt(localStorage.getItem("pq_points")     || "0",  10);
let sessions        = parseInt(localStorage.getItem("pq_sessions")   || "0",  10);
let unlockedMiles   = JSON.parse(localStorage.getItem("pq_miles")    || "[]");
let lastActive      = localStorage.getItem("pq_lastActive")          || "";
let streak          = parseInt(localStorage.getItem("pq_streak")     || "0",  10);

let timerInterval   = null;
let timerSeconds    = POMODORO_SECONDS;
let timerRunning    = false;

/* ── Helpers ─────────────────────────────────────────────── */
const getStreak         = () => streak;
const getSessions       = () => sessions;
const getGoalsCompleted = () => goals.filter(g => g.done).length;

function save() {
  localStorage.setItem("pq_goals",      JSON.stringify(goals));
  localStorage.setItem("pq_points",     points);
  localStorage.setItem("pq_sessions",   sessions);
  localStorage.setItem("pq_miles",      JSON.stringify(unlockedMiles));
  localStorage.setItem("pq_lastActive", lastActive);
  localStorage.setItem("pq_streak",     streak);
}

function addPoints(n) {
  points += n;
  save();
  renderStats();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Streak logic ────────────────────────────────────────── */
function updateStreak() {
  const today     = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (lastActive === today) return;          // already counted today

  if (lastActive === yesterday) {
    streak++;                                // continued streak
  } else if (lastActive !== today) {
    streak = 1;                              // reset / first day
  }

  lastActive = today;
  save();
}

/* ── DOM refs ────────────────────────────────────────────── */
const goalsGrid       = document.getElementById("goalsGrid");
const addExpenseCard  = document.getElementById("addExpenseCard");
const goalModal       = document.getElementById("goalModal");
const goalNameInput   = document.getElementById("goalName");
const goalCategorySel = document.getElementById("goalCategory");
const goalSessionsIn  = document.getElementById("goalSessions");
const saveGoalBtn     = document.getElementById("saveGoalBtn");

const streakEl        = document.getElementById("streakCount");
const pointsEl        = document.getElementById("points");
const feedbackEl      = document.getElementById("productivityFeedback");
const sessionCountEl  = document.getElementById("sessionCount");
const startSessionBtn = document.getElementById("startSessionBtn");

/* ── Render: stats ───────────────────────────────────────── */
function renderStats() {
  streakEl.textContent      = streak;
  pointsEl.textContent      = points;
  sessionCountEl.textContent = sessions;

  // Feedback message
  const completed = getGoalsCompleted();
  if (completed >= 10) {
    feedbackEl.textContent = "🏆 Legendary! You're a productivity master!";
    feedbackEl.className   = "budget-feedback ok";
  } else if (completed >= 5) {
    feedbackEl.textContent = "🔥 You're on fire — keep it up!";
    feedbackEl.className   = "budget-feedback ok";
  } else if (sessions >= 3) {
    feedbackEl.textContent = "⚡ Great focus momentum today!";
    feedbackEl.className   = "budget-feedback warning";
  } else {
    feedbackEl.textContent = "Stay focused. Every session counts.";
    feedbackEl.className   = "budget-feedback";
  }
}

/* ── Render: milestones ──────────────────────────────────── */
function renderMilestones() {
  const milesGrid = document.querySelector("#milestones-heading + .grid");
  if (!milesGrid) return;
  milesGrid.innerHTML = "";

  MILESTONES.forEach(m => {
    const unlocked = unlockedMiles.includes(m.id);

    // Check if newly unlocked
    if (!unlocked && m.threshold()) {
      unlockedMiles.push(m.id);
      m.onUnlock();
      save();
      showToast(`Milestone unlocked: ${m.label}`);
    }

    const art = document.createElement("article");
    art.className = "card milestone-card" + (unlockedMiles.includes(m.id) ? " milestone-unlocked" : "");
    art.innerHTML = `
      <h4>${m.label}</h4>
      <p>${m.reward}</p>
      ${unlockedMiles.includes(m.id) ? '<p class="milestone-status">✅ Unlocked</p>' : '<p class="milestone-status locked">🔒 Locked</p>'}
    `;
    milesGrid.appendChild(art);
  });
}

/* ── Render: goals ───────────────────────────────────────── */
function renderGoals() {
  // Remove all cards except the "New Goal" button
  Array.from(goalsGrid.children).forEach(child => {
    if (child !== addExpenseCard) child.remove();
  });

  goals.forEach((goal, idx) => {
    const card = buildGoalCard(goal, idx);
    goalsGrid.insertBefore(card, addExpenseCard);
  });

  renderStats();
  renderMilestones();
}

function buildGoalCard(goal, idx) {
  const progress = goal.sessionsTotal > 0
    ? Math.min((goal.sessionsDone / goal.sessionsTotal) * 100, 100)
    : 0;

  const art = document.createElement("article");
  art.className = "card goal-card" + (goal.done ? " goal-done" : "");
  art.dataset.idx = idx;
  art.setAttribute("aria-label", `Goal: ${goal.name}`);

  art.innerHTML = `
    <button class="delete-expense" aria-label="Delete goal ${goal.name}" data-delete="${idx}">✕</button>
    <span class="goal-category">${goal.category}</span>
    <h4 class="goal-name">${escHtml(goal.name)}</h4>
    <div class="progress-wrap" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress">
      <div class="progress-bar" style="width:${progress}%"></div>
    </div>
    <p class="goal-sessions-label">${goal.sessionsDone} / ${goal.sessionsTotal} sessions</p>
    <div class="goal-actions">
      <button class="btn-session" data-session="${idx}" ${goal.done ? "disabled" : ""}>+1 Session</button>
      <button class="btn-complete" data-complete="${idx}" ${goal.done ? "disabled" : ""}>
        ${goal.done ? "✅ Done" : "Mark Complete"}
      </button>
    </div>
  `;

  return art;
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

/* ── Goal interactions (delegated) ──────────────────────── */
goalsGrid.addEventListener("click", e => {
  const delBtn      = e.target.closest("[data-delete]");
  const sessionBtn  = e.target.closest("[data-session]");
  const completeBtn = e.target.closest("[data-complete]");

  if (delBtn) {
    const idx = parseInt(delBtn.dataset.delete, 10);
    if (confirm(`Delete goal "${goals[idx].name}"?`)) {
      goals.splice(idx, 1);
      save();
      renderGoals();
    }
    return;
  }

  if (sessionBtn) {
    const idx = parseInt(sessionBtn.dataset.session, 10);
    const goal = goals[idx];
    if (!goal || goal.done) return;
    goal.sessionsDone = Math.min(goal.sessionsDone + 1, goal.sessionsTotal);
    if (goal.sessionsDone >= goal.sessionsTotal) {
      goal.done = true;
      addPoints(POINTS_PER_GOAL);
      updateStreak();
      showToast(`🎉 Goal "${goal.name}" completed! +${POINTS_PER_GOAL} pts`);
    }
    save();
    renderGoals();
    return;
  }

  if (completeBtn) {
    const idx  = parseInt(completeBtn.dataset.complete, 10);
    const goal = goals[idx];
    if (!goal || goal.done) return;
    goal.done         = true;
    goal.sessionsDone = goal.sessionsTotal;
    addPoints(POINTS_PER_GOAL);
    updateStreak();
    showToast(`🎉 Goal "${goal.name}" completed! +${POINTS_PER_GOAL} pts`);
    save();
    renderGoals();
  }
});

/* ── Modal: open / close ─────────────────────────────────── */
let validationMsgEl = null;

function openModal() {
  goalNameInput.value       = "";
  goalCategorySel.value     = "Study";
  goalSessionsIn.value      = "1";
  if (validationMsgEl) validationMsgEl.textContent = "";
  goalModal.hidden = false;
  goalNameInput.focus();
}

function closeModal() {
  goalModal.hidden = true;
}

addExpenseCard.addEventListener("click", openModal);

// Close on backdrop click
goalModal.addEventListener("click", e => {
  if (e.target === goalModal) closeModal();
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !goalModal.hidden) closeModal();
});

/* ── Validation helper ───────────────────────────────────── */
function getOrCreateValidationMsg() {
  if (!validationMsgEl) {
    validationMsgEl = document.createElement("p");
    validationMsgEl.className = "validation-error";
    validationMsgEl.setAttribute("role", "alert");
    validationMsgEl.setAttribute("aria-live", "assertive");
    saveGoalBtn.insertAdjacentElement("beforebegin", validationMsgEl);
  }
  return validationMsgEl;
}

function showValidationError(msg) {
  const el = getOrCreateValidationMsg();
  el.textContent = msg;
  goalNameInput.focus();
}

/* ── Save new goal ───────────────────────────────────────── */
saveGoalBtn.addEventListener("click", () => {
  const name     = goalNameInput.value.trim();
  const sessions = parseInt(goalSessionsIn.value, 10);
  const category = goalCategorySel.value;

  // Validation
  if (!name) {
    showValidationError("⚠ Goal name is required.");
    return;
  }
  if (name.length < 3) {
    showValidationError("⚠ Goal name must be at least 3 characters.");
    return;
  }
  if (isNaN(sessions) || sessions < 1) {
    showValidationError("⚠ Sessions must be at least 1.");
    return;
  }
  if (sessions > 100) {
    showValidationError("⚠ Sessions cannot exceed 100.");
    return;
  }

  const newGoal = {
    name,
    category,
    sessionsTotal : sessions,
    sessionsDone  : 0,
    done          : false,
    createdAt     : Date.now(),
  };

  goals.push(newGoal);
  save();
  renderGoals();
  closeModal();
  showToast(`Goal "${name}" added!`);
});

// Live validation on name input (keydown event)
goalNameInput.addEventListener("keydown", () => {
  if (validationMsgEl) validationMsgEl.textContent = "";
});

/* ── Focus / Pomodoro timer ──────────────────────────────── */

// Build the timer UI inside the focus section
const focusSection = startSessionBtn.closest("section");

// Replace the basic button with a full Pomodoro UI
focusSection.innerHTML = `
  <h3 id="focus-heading">Focus Sessions</h3>
  <p>Complete a 25-minute Pomodoro session to earn <strong>+${POINTS_PER_SESSION} pts</strong>.</p>

  <p>Sessions Completed: <strong><span id="sessionCount">0</span></strong></p>

  <div class="timer-display" aria-live="polite" aria-label="Timer">
    <span id="timerFace">25:00</span>
  </div>

  <div class="timer-controls">
    <button id="timerStartBtn"  type="button">▶ Start</button>
    <button id="timerPauseBtn"  type="button" disabled>⏸ Pause</button>
    <button id="timerResetBtn"  type="button">↺ Reset</button>
  </div>

  <p class="timer-label" id="timerLabel">Ready to focus?</p>
`;

// Re-grab refs after rebuild
const timerFaceEl   = document.getElementById("timerFace");
const timerLabelEl  = document.getElementById("timerLabel");
const timerStartBtn = document.getElementById("timerStartBtn");
const timerPauseBtn = document.getElementById("timerPauseBtn");
const timerResetBtn = document.getElementById("timerResetBtn");
const sessionCountElNew = document.getElementById("sessionCount");

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerFace() {
  timerFaceEl.textContent = formatTime(timerSeconds);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStartBtn.disabled = true;
  timerPauseBtn.disabled = false;
  timerLabelEl.textContent = "Stay focused… you've got this! 💪";

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerFace();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = POMODORO_SECONDS;
      updateTimerFace();
      timerStartBtn.disabled = false;
      timerPauseBtn.disabled = true;
      timerLabelEl.textContent = "Session complete! Great work! 🎉";

      sessions++;
      addPoints(POINTS_PER_SESSION);
      updateStreak();
      sessionCountElNew.textContent = sessions;
      save();
      renderMilestones();
      showToast(`⏱ Session done! +${POINTS_PER_SESSION} pts`);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;
  timerLabelEl.textContent = "Paused. Resume when ready.";
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning    = false;
  timerSeconds    = POMODORO_SECONDS;
  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;
  updateTimerFace();
  timerLabelEl.textContent = "Ready to focus?";
}

timerStartBtn.addEventListener("click", startTimer);
timerPauseBtn.addEventListener("click", pauseTimer);
timerResetBtn.addEventListener("click", resetTimer);

// Keyboard shortcut: Space to start/pause
document.addEventListener("keydown", e => {
  if (goalModal.hidden && e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    timerRunning ? pauseTimer() : startTimer();
  }
});

/* ── Toast notifications ─────────────────────────────────── */
function showToast(msg) {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  toastContainer.appendChild(toast);

  // Trigger reflow for animation
  void toast.offsetWidth;
  toast.classList.add("toast-show");

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}

/* ── Year in footer ──────────────────────────────────────── */
const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Init ────────────────────────────────────────────────── */
function init() {
  updateStreak();   // update streak on page load
  renderGoals();
  renderStats();
  renderMilestones();
  updateTimerFace();
}

init();