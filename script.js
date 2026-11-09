
/* =========================================
   SPENDWISE JAVASCRIPT
   EXPENSE TRACKER AND BUDGET MANAGEMENT
========================================= */

"use strict";

/* =========================================
   1. STORAGE AND DEFAULT DATA
========================================= */

const STORAGE_KEYS = {
    expenses: "spendwise_expenses",
    budget: "spendwise_budget",
    savings: "spendwise_savings"
};

const DEFAULT_BUDGET = 150000;
const MONTHLY_INCOME = 150000;
const DEFAULT_SAVINGS = 20000;

const DEMO_EXPENSES = [
    {
        id: 1,
        name: "Monthly Rent",
        amount: 45000,
        category: "Rent",
        date: "2026-11-02"
    },
    {
        id: 2,
        name: "Groceries",
        amount: 12500,
        category: "Food",
        date: "2026-11-03"
    },
    {
        id: 3,
        name: "Transport",
        amount: 8350,
        category: "Transport",
        date: "2026-11-04"
    },
    {
        id: 4,
        name: "Electricity and Water",
        amount: 9000,
        category: "Utilities",
        date: "2026-11-05"
    },
    {
        id: 5,
        name: "Shopping",
        amount: 15000,
        category: "Shopping",
        date: "2026-11-06"
    },
    {
        id: 6,
        name: "Entertainment",
        amount: 6500,
        category: "Entertainment",
        date: "2026-11-07"
    }
];

const CATEGORY_DETAILS = {
    Food: {
        icon: "🍔",
        color: "#2563eb"
    },
    Transport: {
        icon: "🚗",
        color: "#16a36a"
    },
    Rent: {
        icon: "🏠",
        color: "#8b5cf6"
    },
    Entertainment: {
        icon: "🎬",
        color: "#f59e0b"
    },
    Savings: {
        icon: "💰",
        color: "#14b8a6"
    },
    Utilities: {
        icon: "💡",
        color: "#ec4899"
    },
    Shopping: {
        icon: "🛒",
        color: "#84a34b"
    },
    Other: {
        icon: "📦",
        color: "#64748b"
    }
};


/* =========================================
   2. LOAD SAVED DATA
========================================= */

function loadData(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);

        return saved === null
            ? defaultValue
            : JSON.parse(saved);

    } catch (error) {
        console.error("Error loading data:", error);
        return defaultValue;
    }
}

let expenses = loadData(
    STORAGE_KEYS.expenses,
    DEMO_EXPENSES
);

if (!Array.isArray(expenses)) {
    expenses = DEMO_EXPENSES.map(item => ({ ...item }));
}

let budget = Number(
    loadData(STORAGE_KEYS.budget, DEFAULT_BUDGET)
);

let savings = Number(
    loadData(STORAGE_KEYS.savings, DEFAULT_SAVINGS)
);

if (!Number.isFinite(budget) || budget <= 0) {
    budget = DEFAULT_BUDGET;
}

if (!Number.isFinite(savings) || savings < 0) {
    savings = DEFAULT_SAVINGS;
}

let editingId = null;
let sortByAmount = false;


/* =========================================
   3. GET HTML ELEMENTS
========================================= */

const expenseForm = document.getElementById("expenseForm");

const budgetForm = document.getElementById("budgetForm");

const expenseName = document.getElementById("expenseName");

const expenseAmount = document.getElementById("expenseAmount");

const expenseCategory = document.getElementById("expenseCategory");

const expenseDate = document.getElementById("expenseDate");

const budgetInput = document.getElementById("budgetInput");

const budgetMessage = document.getElementById("budgetMessage");

const searchInput = document.getElementById("searchInput");

const categoryGrid = document.getElementById("categoryGrid");

const transactionList = document.getElementById("transactionList");


/* =========================================
   4. SAVE DATA
========================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEYS.expenses,
        JSON.stringify(expenses)
    );

    localStorage.setItem(
        STORAGE_KEYS.budget,
        JSON.stringify(budget)
    );

    localStorage.setItem(
        STORAGE_KEYS.savings,
        JSON.stringify(savings)
    );

}


/* =========================================
   5. FORMAT CURRENCY
========================================= */

function formatMoney(amount) {

    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2
    }).format(amount);

}


/* =========================================
   6. CALCULATE TOTAL EXPENSES
========================================= */

function calculateTotalExpenses() {

    return expenses.reduce(
        (total, expense) => {
            return total + Number(expense.amount);
        },
        0
    );

}


/* =========================================
   7. UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const total = calculateTotalExpenses();

    const balance = MONTHLY_INCOME - total;

    const percentage = MONTHLY_INCOME > 0
        ? (total / MONTHLY_INCOME) * 100
        : 0;

    const budgetPercentage = budget > 0
        ? (total / budget) * 100
        : 0;

    const categories = getCategoryTotals();

    document.getElementById("totalBalance").textContent =
        formatMoney(balance);

    document.getElementById("monthlyIncome").textContent =
        formatMoney(MONTHLY_INCOME);

    document.getElementById("totalExpenses").textContent =
        formatMoney(total);

    document.getElementById("expensePercentage").textContent =
        percentage.toFixed(1) + "% of income";

    document.getElementById("expensePercentage").className =
        percentage > 80 ? "negative" : "positive";

    document.getElementById("recordCount").textContent =
        expenses.length;

    document.getElementById("categoryCount").textContent =
        Object.keys(categories).length;

    document.getElementById("sidebarBudget").textContent =
        formatMoney(budget);

    document.getElementById("sidebarProgress").style.width =
        Math.min(budgetPercentage, 100) + "%";

    document.getElementById("sidebarBudgetText").textContent =
        budgetPercentage.toFixed(1) + "% of your budget used";

    updateBudgetStatus();

    document.getElementById("savingsAmount").textContent =
        formatMoney(savings);

}


/* =========================================
   8. UPDATE BUDGET STATUS
========================================= */

function updateBudgetStatus() {

    const total = calculateTotalExpenses();

    const remaining = budget - total;

    const percentage = budget > 0
        ? (total / budget) * 100
        : 0;

    const status = document.getElementById("budgetStatus");

    status.className = "budget-status";

    let message = "";

    if (remaining < 0) {

        status.classList.add("danger");

        message =
            "You have exceeded your budget by " +
            formatMoney(Math.abs(remaining));

    } else if (percentage >= 80) {

        status.classList.add("warning");

        message =
            "Warning! You are approaching your budget limit.";

    } else {

        message =
            "You have " +
            formatMoney(remaining) +
            " remaining in your budget.";

    }

    status.innerHTML = "";

    const heading = document.createElement("strong");

    heading.textContent = "Budget Status";

    const description = document.createElement("span");

    description.textContent = message;

    status.append(heading, description);

}


/* =========================================
   9. CALCULATE CATEGORY TOTALS
========================================= */

function getCategoryTotals() {

    const totals = {};

    expenses.forEach(expense => {

        const category = expense.category;

        totals[category] =
            (totals[category] || 0) +
            Number(expense.amount);

    });

    return totals;

}


/* =========================================
   10. DISPLAY EXPENSE CATEGORIES
========================================= */

function renderCategories() {

    categoryGrid.innerHTML = "";

    let categories = Object.entries(
        getCategoryTotals()
    );

    if (sortByAmount) {

        categories.sort((a, b) => b[1] - a[1]);

    } else {

        categories.sort((a, b) => a[0].localeCompare(b[0]));

    }

    if (categories.length === 0) {

        categoryGrid.innerHTML =
            '<p class="empty-state">No expense categories available.</p>';

        return;
    }

    const highest = Math.max(
        ...categories.map(item => item[1]),
        1
    );

    categories.forEach(([category, amount]) => {

        const details =
            CATEGORY_DETAILS[category] ||
            CATEGORY_DETAILS.Other;

        const percentage =
            (amount / highest) * 100;

        const share =
            calculateTotalExpenses() > 0
                ? (amount / calculateTotalExpenses()) * 100
                : 0;

        const count = expenses.filter(
            expense => expense.category === category
        ).length;

        const card = document.createElement("div");

        card.className = "category-card";

        const top = document.createElement("div");

        top.className = "category-top";

        const name = document.createElement("span");

        name.className = "category-name";

        name.textContent = category;

        const icon = document.createElement("span");

        icon.className = "category-icon";

        icon.textContent = details.icon;

        top.append(name, icon);

        const amountElement = document.createElement("div");

        amountElement.className = "category-amount";

        amountElement.textContent = formatMoney(amount);

        const track = document.createElement("div");

        track.className = "category-track";

        const fill = document.createElement("div");

        fill.className = "category-fill";

        fill.style.width = percentage + "%";

        fill.style.background = details.color;

        track.appendChild(fill);

        const meta = document.createElement("div");

        meta.className = "category-meta";

        meta.innerHTML = `
            <span>${share.toFixed(1)}% of expenses</span>
            <span>${count} record(s)</span>
        `;

        card.append(
            top,
            amountElement,
            track,
            meta
        );

        categoryGrid.appendChild(card);

    });

}


/* =========================================
   11. DISPLAY TRANSACTIONS
========================================= */

function renderTransactions() {

    transactionList.innerHTML = "";

    const search = searchInput.value
        .trim()
        .toLowerCase();

    const filteredExpenses = expenses
        .filter(expense => {

            return (
                expense.name.toLowerCase().includes(search) ||
                expense.category.toLowerCase().includes(search) ||
                expense.date.includes(search)
            );

        })
        .sort((a, b) => {

            return b.date.localeCompare(a.date) ||
                b.id - a.id;

        });

    if (filteredExpenses.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-state";

        empty.textContent = search
            ? "No matching transactions found."
            : "No expenses recorded yet.";

        transactionList.appendChild(empty);

        return;
    }

    filteredExpenses.forEach(expense => {

        const row = document.createElement("div");

        row.className = "transaction-item";

        const name = document.createElement("span");

        name.className = "transaction-name";

        name.textContent = expense.name;

        const category = document.createElement("span");

        category.className = "transaction-category";

        const details =
            CATEGORY_DETAILS[expense.category] ||
            CATEGORY_DETAILS.Other;

        category.textContent =
            details.icon + " " + expense.category;

        const date = document.createElement("span");

        date.className = "transaction-date";

        date.textContent = new Date(
            expense.date + "T00:00:00"
        ).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        const amount = document.createElement("strong");

        amount.className = "transaction-amount";

        amount.textContent =
            "− " + formatMoney(expense.amount);

        const actions = document.createElement("div");

        actions.className = "transaction-actions";

        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {

            editExpense(expense.id);

        });

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-transaction";

        deleteButton.addEventListener("click", () => {

            deleteExpense(expense.id);

        });

        actions.append(editButton, deleteButton);

        row.append(
            name,
            category,
            date,
            amount,
            actions
        );

        transactionList.appendChild(row);

    });

}


/* =========================================
   12. ADD NEW EXPENSE
========================================= */

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = expenseName.value.trim();

    const amount = Number(expenseAmount.value);

    const category = expenseCategory.value;

    const date = expenseDate.value;

    if (
        !name ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !category ||
        !date
    ) {

        alert("Please enter valid expense information.");

        return;
    }

    if (editingId !== null) {

        const existingExpense = expenses.find(
            expense => expense.id === editingId
        );

        if (existingExpense) {

            existingExpense.name = name;

            existingExpense.amount = amount;

            existingExpense.category = category;

            existingExpense.date = date;

        }

        editingId = null;

        expenseForm.querySelector(".add-button").textContent =
            "+ Add Expense";

    } else {

        const newExpense = {

            id: Date.now(),

            name: name,

            amount: amount,

            category: category,

            date: date

        };

        expenses.push(newExpense);

    }

    saveData();

    expenseForm.reset();

    renderAll();

});


/* =========================================
   13. EDIT EXPENSE
========================================= */

function editExpense(id) {

    const expense = expenses.find(
        item => item.id === id
    );

    if (!expense) return;

    editingId = id;

    expenseName.value = expense.name;

    expenseAmount.value = expense.amount;

    expenseCategory.value = expense.category;

    expenseDate.value = expense.date;

    expenseForm.querySelector(".add-button").textContent =
        "Update Expense";

    expenseForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================
   14. DELETE EXPENSE
========================================= */

function deleteExpense(id) {

    const expense = expenses.find(
        item => item.id === id
    );

    if (!expense) return;

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    expenses = expenses.filter(
        item => item.id !== id
    );

    if (editingId === id) {

        editingId = null;

        expenseForm.reset();

        expenseForm.querySelector(".add-button").textContent =
            "+ Add Expense";

    }

    saveData();

    renderAll();

}


/* =========================================
   15. SET MONTHLY BUDGET
========================================= */

budgetForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newBudget = Number(budgetInput.value);

    if (
        !Number.isFinite(newBudget) ||
        newBudget <= 0
    ) {

        budgetMessage.textContent =
            "Please enter a valid budget amount.";

        return;
    }

    budget = newBudget;

    saveData();

    updateDashboard();

    budgetMessage.textContent =
        "Your monthly budget has been updated successfully.";

    budgetInput.value = "";

});


/* =========================================
   16. SEARCH TRANSACTIONS
========================================= */

searchInput.addEventListener("input", function() {

    renderTransactions();

});


/* =========================================
   17. SORT CATEGORIES
========================================= */

document.getElementById(
    "sortCategoriesButton"
).addEventListener("click", function() {

    sortByAmount = !sortByAmount;

    this.textContent = sortByAmount
        ? "Sort A-Z"
        : "Sort by Amount";

    renderCategories();

});


/* =========================================
   18. CLEAR TRANSACTIONS
========================================= */

document.getElementById("clearButton")
    .addEventListener("click", function() {

        if (expenses.length === 0) {

            alert("There are no expenses to clear.");

            return;
        }

        const confirmClear = confirm(
            "Are you sure you want to clear all transactions?"
        );

        if (!confirmClear) return;

        expenses = [];

        editingId = null;

        expenseForm.reset();

        expenseForm.querySelector(".add-button").textContent =
            "+ Add Expense";

        saveData();

        renderAll();

    });


/* =========================================
   19. RESET APPLICATION
========================================= */

document.getElementById("resetButton")
    .addEventListener("click", function() {

        const confirmReset = confirm(
            "Restore the original SpendWise demo data?"
        );

        if (!confirmReset) return;

        expenses = DEMO_EXPENSES.map(
            expense => ({ ...expense })
        );

        budget = DEFAULT_BUDGET;

        savings = DEFAULT_SAVINGS;

        editingId = null;

        expenseForm.reset();

        budgetInput.value = "";

        budgetMessage.textContent =
            "Demo data has been restored.";

        searchInput.value = "";

        expenseForm.querySelector(".add-button").textContent =
            "+ Add Expense";

        saveData();

        renderAll();

    });


/* =========================================
   20. NOTIFICATIONS
========================================= */

document.getElementById("notificationButton")
    .addEventListener("click", function() {

        const total = calculateTotalExpenses();

        const remaining = budget - total;

        const percentage = budget > 0
            ? (total / budget) * 100
            : 0;

        if (remaining < 0) {

            alert(
                "Budget Alert!\n\nYou have exceeded your budget by " +
                formatMoney(Math.abs(remaining))
            );

        } else if (percentage >= 80) {

            alert(
                "Budget Warning!\n\nYou have used " +
                percentage.toFixed(1) +
                "% of your monthly budget."
            );

        } else {

            alert(
                "Good job!\n\nYou still have " +
                formatMoney(remaining) +
                " remaining."
            );

        }

    });


/* =========================================
   21. NAVIGATION ACTIVE STATE
========================================= */

document.querySelectorAll(".nav-item")
    .forEach(link => {

        link.addEventListener("click", function() {

            document.querySelectorAll(".nav-item")
                .forEach(item => {

                    item.classList.remove("active");

                });

            this.classList.add("active");

        });

    });


/* =========================================
   22. RENDER EVERYTHING
========================================= */

function renderAll() {

    updateDashboard();

    renderCategories();

    renderTransactions();

}


/* =========================================
   23. INITIALIZE APPLICATION
========================================= */

function initializeSpendWise() {

    saveData();

    renderAll();

    console.log("SpendWise application loaded successfully!");

}

initializeSpendWise();
