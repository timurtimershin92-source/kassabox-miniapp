const tg = window.Telegram.WebApp;

tg.ready();

// Запрос safe area от Telegram
if (tg.safeAreaInset) {
  console.log('Safe Area:', {
    top: tg.safeAreaInset.top,
    bottom: tg.safeAreaInset.bottom,
    left: tg.safeAreaInset.left,
    right: tg.safeAreaInset.right
  });
}

tg.expand();

// остальной код...

const balances = {
  card: 0,
  safe1: 0,
  safe2: 0,
};

const BALANCES_KEY = "kassabox_balances_v1";

// загрузка из localStorage
function loadBalances() {
  const raw = window.localStorage.getItem(BALANCES_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    balances.card = Number(data.card) || 0;
    balances.safe1 = Number(data.safe1) || 0;
    balances.safe2 = Number(data.safe2) || 0;
  } catch {
    // игнорируем
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

// модалка редактирования
const modal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editTitle = document.getElementById("edit-title");

let currentAccount = null;

function openEditModal(accountKey, title) {
  currentAccount = accountKey;
  editTitle.textContent = `Редактировать: ${title}`;
  editInput.value = balances[accountKey].toString();
  modal.classList.remove("hidden");
  editInput.focus();
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

// клик по карточкам балансов
document.querySelectorAll(".balance-card").forEach((card) => {
  card.addEventListener("click", () => {
    const account = card.dataset.account;
    const title = card.querySelector(".balance-title").textContent;
    openEditModal(account, title);
  });
});

// заглушки на кнопки
document.getElementById("expense-btn").addEventListener("click", () => {
  tg.showAlert("Форма расхода ещё в разработке");
});

document.getElementById("transfer-btn").addEventListener("click", () => {
  tg.showAlert("Форма инкассации ещё в разработке");
});

// инициализация
loadBalances();
renderBalances();

