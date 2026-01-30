// Income
const incomeInput = document.getElementById("incomeInput");
const setIncomeBtn = document.getElementById("setIncomeBtn");
const currentIncomeEl = document.getElementById("currentIncome");
const remainingEl = document.getElementById("remaining");
const budgetBar = document.getElementById("budgetBar");

// Expenses
const expensesGrid = document.getElementById("expensesGrid");
const addExpenseCard = document.getElementById("addExpenseCard");
const modal = document.getElementById("expenseModal");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");

// Emoji for expenses
const emojiButtons = document.querySelectorAll(".emoji-btn");
let selectedEmoji = "💰";

let income = Number(localStorage.getItem("income")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

currentIncomeEl.textContent = income.toFixed(2);

/* ---------- Emoji Picker ---------- */
emojiButtons.forEach((btn) => 
{
  btn.addEventListener("click", () => {
    emojiButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedEmoji = btn.textContent;
  });
});

/* ---------- Budget ---------- */
const feedbackEl = document.getElementById("budgetFeedback");

function updateBudget() 
{
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const remaining = income - totalExpenses;
  const spentPercent =
    income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0;

  remainingEl.textContent = remaining.toFixed(2);
  budgetBar.style.width = spentPercent + "%";

  if (spentPercent < 60) 
  {
    budgetBar.style.background = "#22c55e";
    feedbackEl.textContent = "You're on track!";
    feedbackEl.className = "budget-feedback ok";
  }  
  else if (spentPercent < 99) {
    budgetBar.style.background = "#facc15";
    feedbackEl.textContent = "Almost reaching your budget limit!";
    feedbackEl.className = "budget-feedback warning";
  } 
  else 
  {
    budgetBar.style.background = "#ef4444";
    feedbackEl.textContent = "Over budget!";
    feedbackEl.className = "budget-feedback over";
  }
}


/* ---------- Income ---------- */
setIncomeBtn.addEventListener("click", () => 
{
  income = Number(incomeInput.value) || 0;
  localStorage.setItem("income", income);
  currentIncomeEl.textContent = income.toFixed(2);
  updateBudget();
});

/* ---------- Expenses ---------- */
function renderExpenses() 
{
  document.querySelectorAll(".expense-card").forEach((c) => c.remove());

  expenses.forEach((expense, index) => 
  {
    const card = document.createElement("article");
    card.className = "card expense-card";

    card.innerHTML = `
      <button class="delete-expense" aria-label="Remove expense">✕</button>
      <div class="expense-emoji">${expense.emoji}</div>
      <div class="expense-name">${expense.name}</div>
      <div class="expense-amount">$${expense.amount}</div>
    `;

    // Delete button logic
    card.querySelector(".delete-expense").addEventListener("click", (e) => {
      e.stopPropagation(); // prevent card click
      expenses.splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
    });

    expensesGrid.insertBefore(card, addExpenseCard);
  });

  updateBudget();
}

/* ---------- Modal ---------- */
addExpenseCard.addEventListener("click", () => {
  modal.hidden = false;
});

saveExpenseBtn.addEventListener("click", () => {
  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value) || 0;

  if (!name || amount <= 0) return;

  expenses.push({
    name,
    amount,
    emoji: selectedEmoji,
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));

  expenseNameInput.value = "";
  expenseAmountInput.value = "";
  selectedEmoji = "💰";
  emojiButtons.forEach((b) => b.classList.remove("selected"));

  modal.hidden = true;
  renderExpenses();
});

/* ---------- Init ---------- */
renderExpenses();
updateBudget();
