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
  tg.showAlert('Форма расхода в разработке');
});

document.getElementById('transfer-btn').addEventListener('click', () => {
  tg.showAlert('Форма инкассации в разработке');
});

// Проверка сохранённого кошелька
const savedWalletId = localStorage.getItem('walletId');
if (savedWalletId) {
  currentWalletId = savedWalletId;
  showMainScreen();
}
