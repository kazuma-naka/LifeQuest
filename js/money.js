document.addEventListener("DOMContentLoaded", function () {
  const storageKey = "lifequest.money.v1";

  const currentIncomeEl = document.getElementById("currentIncome");
  const remainingEl = document.getElementById("remaining");
  const budgetBarEl = document.getElementById("budgetBar");
  const budgetBarWrapEl = document.querySelector(".budget-bar-wrap");
  const budgetFeedbackEl = document.getElementById("budgetFeedback");

  const incomeInputEl = document.getElementById("incomeInput");
  const setIncomeBtnEl = document.getElementById("setIncomeBtn");

  const expensesGridEl = document.getElementById("expensesGrid");
  const addExpenseCardEl = document.getElementById("addExpenseCard");

  const footerYearEl = document.querySelector("[data-year]");
  if (footerYearEl) {
    footerYearEl.textContent = String(new Date().getFullYear());
  }

  if (
    !currentIncomeEl ||
    !remainingEl ||
    !budgetBarEl ||
    !budgetFeedbackEl ||
    !incomeInputEl ||
    !setIncomeBtnEl ||
    !expensesGridEl ||
    !addExpenseCardEl
  ) {
    return;
  }

  const state = {
    income: 0,
    expenses: [],
  };

  function formatMoney(amount) {
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function loadState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const income = Number(parsed && parsed.income);
      const expenses = Array.isArray(parsed && parsed.expenses)
        ? parsed.expenses
            .map(function (item) {
              return {
                id: String(item.id || Date.now() + Math.random()),
                name: String(item.name || "Expense").trim() || "Expense",
                amount: Math.max(0, Number(item.amount) || 0),
              };
            })
            .filter(function (item) {
              return item.amount >= 0;
            })
        : [];

      state.income = Number.isFinite(income) ? Math.max(0, income) : 0;
      state.expenses = expenses;
    } catch (_err) {
      state.income = 0;
      state.expenses = [];
    }
  }

  function getTotalExpenses() {
    return state.expenses.reduce(function (sum, item) {
      return sum + item.amount;
    }, 0);
  }

  function setBudgetFeedback(income, remaining) {
    budgetFeedbackEl.classList.remove("ok", "warning", "over");

    if (income <= 0) {
      budgetFeedbackEl.textContent =
        "Set your monthly income to start tracking your budget.";
      return;
    }

    if (remaining < 0) {
      budgetFeedbackEl.classList.add("over");
      budgetFeedbackEl.textContent =
        "Over budget by $" + formatMoney(Math.abs(remaining)) + ".";
      return;
    }

    const ratioLeft = remaining / income;
    if (ratioLeft <= 0.2) {
      budgetFeedbackEl.classList.add("warning");
      budgetFeedbackEl.textContent =
        "Caution: Less than 20% of your budget is left.";
      return;
    }

    budgetFeedbackEl.classList.add("ok");
    budgetFeedbackEl.textContent = "Great pacing. You are within budget.";
  }

  function updateBudgetUI() {
    const totalExpenses = getTotalExpenses();
    const remaining = state.income - totalExpenses;

    currentIncomeEl.textContent = formatMoney(state.income);
    remainingEl.textContent = formatMoney(remaining);

    let usedPercent = 0;
    if (state.income > 0) {
      usedPercent = (totalExpenses / state.income) * 100;
    } else if (totalExpenses > 0) {
      usedPercent = 100;
    }

    const visualPercent = Math.max(0, Math.min(usedPercent, 100));
    budgetBarEl.style.width = visualPercent.toFixed(1) + "%";

    if (usedPercent >= 100) {
      budgetBarEl.style.background = "var(--danger)";
    } else if (usedPercent >= 80) {
      budgetBarEl.style.background = "var(--warning)";
    } else {
      budgetBarEl.style.background = "var(--success)";
    }

    if (budgetBarWrapEl) {
      budgetBarWrapEl.setAttribute(
        "aria-valuenow",
        String(Math.round(visualPercent)),
      );
    }

    setBudgetFeedback(state.income, remaining);
  }

  function createExpenseCard(expense) {
    const card = document.createElement("article");
    card.className = "card expense-card";
    card.setAttribute("data-expense-id", expense.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-expense";
    deleteBtn.setAttribute("aria-label", "Delete expense " + expense.name);
    deleteBtn.textContent = "x";

    const emoji = document.createElement("div");
    emoji.className = "expense-emoji";
    emoji.textContent = "$";

    const name = document.createElement("div");
    name.className = "expense-name";
    name.textContent = expense.name;

    const amount = document.createElement("div");
    amount.className = "expense-amount";
    amount.textContent = "$" + formatMoney(expense.amount);

    card.appendChild(deleteBtn);
    card.appendChild(emoji);
    card.appendChild(name);
    card.appendChild(amount);

    return card;
  }

  function renderExpenses() {
    const existingCards = expensesGridEl.querySelectorAll("[data-expense-id]");
    existingCards.forEach(function (el) {
      el.remove();
    });

    state.expenses.forEach(function (expense) {
      const card = createExpenseCard(expense);
      expensesGridEl.insertBefore(card, addExpenseCardEl);
    });
  }

  function addExpense() {
    const nameInput = window.prompt("Expense name:");
    if (nameInput === null) return;

    const name = nameInput.trim();
    if (!name) {
      alert("Please enter an expense name.");
      return;
    }

    const amountInput = window.prompt("Expense amount ($):");
    if (amountInput === null) return;

    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    state.expenses.push({
      id: String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000)),
      name: name,
      amount: amount,
    });

    saveState();
    renderExpenses();
    updateBudgetUI();
  }

  function setIncome() {
    const value = Number(incomeInputEl.value);
    if (!Number.isFinite(value) || value < 0) {
      alert("Please enter a valid income value.");
      return;
    }

    state.income = value;
    incomeInputEl.value = "";

    saveState();
    updateBudgetUI();
  }

  setIncomeBtnEl.addEventListener("click", setIncome);

  incomeInputEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      setIncome();
    }
  });

  addExpenseCardEl.addEventListener("click", addExpense);

  expensesGridEl.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("delete-expense")) return;

    const card = target.closest("[data-expense-id]");
    if (!card) return;

    const id = card.getAttribute("data-expense-id");
    state.expenses = state.expenses.filter(function (item) {
      return item.id !== id;
    });

    saveState();
    renderExpenses();
    updateBudgetUI();
  });

  loadState();
  renderExpenses();
  updateBudgetUI();
});
