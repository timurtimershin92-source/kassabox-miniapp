const tg = window.Telegram.WebApp;

// Сразу готовимся и расширяем
tg.ready();

// Расширяем немедленно, до любого другого кода
if (!tg.isExpanded) {
  tg.expand();
}

// Слушаем изменения viewport
tg.onEvent('viewportChanged', () => {
  if (!tg.isExpanded) {
    tg.expand(); // если пользователь минимизировал, снова расширяем
  }
});

const balances = {
  card: 0,
  safe1: 0,
  safe2: 0,
};

const BALANCES_KEY = "kassabox_balances_v1";

function loadBalances() {
  const raw = window.localStorage.getItem(BALANCES_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    balances.card = Number(data.card) || 0;
    balances.safe1 = Number(data.safe1) || 0;
    balances.safe2 = Number(data.safe2) || 0;
  } catch {
    // ignore
  }
}

function saveBalances() {
  window.localStorage.setItem(BALANCES_KEY, JSON.stringify(balances));
}

function renderBalances() {
  document.getElementById("balance-card").textContent = balances.card.toFixed(2);
  document.getElementById("balance-safe1").textContent = balances.safe1.toFixed(2);
  document.getElementById("balance-safe2").textContent = balances.safe2.toFixed(2);
  const total = balances.card + balances.safe1 + balances.safe2;
  document.getElementById("total-balance").textContent = total.toFixed(2);
}

const modal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editTitle = document.getElementById("edit-title");

let currentAccount = null;

function openEditModal(accountKey, title) {
  currentAccount = accountKey;
  editTitle.textContent = `Редактировать: ${title}`;
  editInput.value = balances[accountKey].toString();
  modal.classList.remove("hidden");
  setTimeout(() => editInput.focus(), 100); // задержка для iOS
}

function closeEditModal() {
  modal.classList.add("hidden");
  currentAccount = null;
}

document.getElementById("edit-cancel").addEventListener("click", closeEditModal);
document.getElementById("edit-save").addEventListener("click", () => {
  if (!currentAccount) return;
  const value = parseFloat(editInput.value.replace(",", "."));
  if (Number.isNaN(value)) {
    tg.showAlert("Введите корректное число");
    return;
  }
  balances[currentAccount] = value;
  saveBalances();
  renderBalances();
  closeEditModal();
});

document.querySelectorAll(".balance-card").forEach((card) => {
  card.addEventListener("click", () => {
    const account = card.dataset.account;
    const title = card.querySelector(".balance-title").textContent;
    openEditModal(account, title);
  });
});

document.getElementById("expense-btn").addEventListener("click", () => {
  tg.showAlert("Форма расхода ещё в разработке");
});

document.getElementById("transfer-btn").addEventListener("click", () => {
  tg.showAlert("Форма инкассации ещё в разработке");
});

// Инициализация
loadBalances();
renderBalances();
