const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = 'https://kassabox-bot.onrender.com';
let currentWalletId = null;
let currentInitData = tg.initData;

const screens = {
  walletSelect: document.getElementById('wallet-select-screen'),
  main: document.getElementById('main-screen')
};

// Модальные окна

const createWalletBtn = document.getElementById('create-wallet-btn');
const joinWalletBtn = document.getElementById('join-wallet-btn');
const confirmCreateBtn = document.getElementById('confirm-create-btn');
const confirmJoinBtn = document.getElementById('confirm-join-btn');
const menuBtn = document.getElementById('menu-btn');
const logoutBtn = document.getElementById('logout-btn');

createWalletBtn.addEventListener('click', () => {
  document.getElementById('create-wallet-modal').classList.remove('hidden');
});

joinWalletBtn.addEventListener('click', () => {
  document.getElementById('join-wallet-modal').classList.remove('hidden');
});

confirmCreateBtn.addEventListener('click', async () => {
  const name = document.getElementById('wallet-name').value;
  if (!name) return tg.showAlert('Название обязательно');
  try {
    const res = await fetch(`${API_URL}/api/wallet/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, initData: currentInitData })
    });
    const data = await res.json();
    if (data.wallet_id) {
      currentWalletId = data.wallet_id;
      localStorage.setItem('walletId', data.wallet_id);
      showMainScreen();
    }
  } catch (e) {
    tg.showAlert('Ошибка: ' + e.message);
  }
});

confirmJoinBtn.addEventListener('click', async () => {
  const walletId = document.getElementById('wallet-id-input').value;
  if (!walletId || walletId.length !== 8) return tg.showAlert('Код должен быть 8 символов');
  try {
    const res = await fetch(`${API_URL}/api/wallet/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_id: walletId, initData: currentInitData })
    });
    if (res.ok) {
      currentWalletId = walletId;
      localStorage.setItem('walletId', walletId);
      showMainScreen();
    } else {
      tg.showAlert('Неверный код');
    }
  } catch (e) {
    tg.showAlert('Ошибка: ' + e.message);
  }
});

menuBtn.addEventListener('click', () => {
  document.getElementById('menu-modal').classList.remove('hidden');
});

logoutBtn.addEventListener('click', () => {
  currentWalletId = null;
  localStorage.removeItem('walletId');
  screens.walletSelect.classList.remove('hidden');
  screens.main.classList.add('hidden');
  document.getElementById('menu-modal').classList.add('hidden');
});

function showMainScreen() {
  screens.walletSelect.classList.add('hidden');
  screens.main.classList.remove('hidden');
  document.getElementById('create-wallet-modal').classList.add('hidden');
  document.getElementById('join-wallet-modal').classList.add('hidden');
  loadBalancesAndHistory();
}

async function loadBalancesAndHistory() {
  try {
    const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/balances`, {
      headers: { 'X-Init-Data': currentInitData }
    });
    const data = await res.json();
    document.getElementById('balance-card').textContent = data.card.toFixed(2);
    document.getElementById('balance-safe1').textContent = data.safe1.toFixed(2);
    document.getElementById('balance-safe2').textContent = data.safe2.toFixed(2);
    document.getElementById('total-balance').textContent = data.total.toFixed(2);
  } catch (e) {
    console.error(e);
  }

  try {
    const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/operations?limit=20`, {
      headers: { 'X-Init-Data': currentInitData }
    });
    const data = await res.json();
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    data.operations.forEach(op => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<small>${op.date.substring(0, 10)} ${op.type === 'expense' ? '💴' : '🖄'} ${op.amount.toFixed(2)} ${op.comment}</small>`;
      historyList.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('expense-btn').addEventListener('click', () => {
document.getElementById('expense-modal').classList.remove('hidden');
});

const confirmExpenseBtn = document.getElementById('confirm-expense-btn');
confirmExpenseBtn.addEventListener('click', async () => {
    const source = document.getElementById('expense-source').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const comment = document.getElementById('expense-comment').value;
    if (!amount || amount <= 0) return tg.showAlert('Сумма должна быть больше 0');
    try {
          const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/expense`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Init-Data': currentInitData },
                  body: JSON.stringify({ source, amount, comment })
                        });
          if (res.ok) {
                  document.getElementById('expense-modal').classList.add('hidden');
                  document.getElementById('expense-amount').value = '';
                  document.getElementById('expense-comment').value = '';
                  loadBalancesAndHistory();
                  tg.showAlert('Расход добавлен');
                } else {
                  tg.showAlert('Недостаточно средств');
                }
        } catch (e) {
          tg.showAlert('Ошибка: ' + e.message);
        }
  });

document.getElementById('transfer-btn').addEventListener('click', () => {
document.getElementById('transfer-modal').classList.remove('hidden');
  });

const confirmTransferBtn = document.getElementById('confirm-transfer-btn');
confirmTransferBtn.addEventListener('click', async () => {
    const transferType = document.getElementById('transfer-from').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    if (!amount || amount <= 0) return tg.showAlert('Сумма должна быть больше 0');
    try {
          const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/transfer`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Init-Data': currentInitData },
                  body: JSON.stringify({ type: transferType, amount })
                });
          if (res.ok) {
                  document.getElementById('transfer-modal').classList.add('hidden');
                  document.getElementById('transfer-amount').value = '';
                  loadBalancesAndHistory();
                  tg.showAlert('Инкассация выполнена');
                } else {
                  tg.showAlert('Недостаточно средств');
                }
                      } catch (e) {
          tg.showAlert('Ошибка: ' + e.message);
        }
  });
});

// Проверка сохранённого кошелька
const savedWalletId = localStorage.getItem('walletId');
if (savedWalletId) {
  currentWalletId = savedWalletId;
  showMainScreen();
}

