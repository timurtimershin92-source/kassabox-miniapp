// Utility function to close modals
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Utility function to open modals
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}


const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = 'https://kassabox-bot.onrender.com';
let currentWalletId = null;
let currentInitData = tg.initData;
let walletName = '';

const screens = {
  walletSelect: document.getElementById('wallet-select-screen'),
  main: document.getElementById('main-screen')
};

// Button references
const createWalletBtn = document.getElementById('create-wallet-btn');
const joinWalletBtn = document.getElementById('join-wallet-btn');
const confirmCreateBtn = document.getElementById('confirm-create-btn');
const confirmJoinBtn = document.getElementById('confirm-join-btn');
const menuBtn = document.getElementById('menu-btn');
const logoutBtn = document.getElementById('logout-btn');
const expenseBtn = document.getElementById('expense-btn');
const transferBtn = document.getElementById('transfer-btn');
const confirmExpenseBtn = document.getElementById('confirm-expense-btn');
const confirmTransferBtn = document.getElementById('confirm-transfer-btn');

// Wallet creation
createWalletBtn.addEventListener('click', () => {
  document.getElementById('create-wallet-modal').classList.remove('hidden');
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
      walletName = name;
      localStorage.setItem('walletId', data.wallet_id);
      localStorage.setItem('walletName', name);
      showMainScreen();
    }
  } catch (e) {
    tg.showAlert('Ошибка: ' + e.message);
  }
});

// Wallet joining
joinWalletBtn.addEventListener('click', () => {
  document.getElementById('join-wallet-modal').classList.remove('hidden');
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
      walletName = 'Кошелёк';
      localStorage.setItem('walletId', walletId);
      localStorage.setItem('walletName', walletName);
      showMainScreen();
    } else {
      tg.showAlert('Неверный код');
    }
  } catch (e) {
    tg.showAlert('Ошибка: ' + e.message);
  }
});

// Menu
menuBtn.addEventListener('click', () => {
  document.getElementById('menu-modal').classList.remove('hidden');
});

logoutBtn.addEventListener('click', () => {
  currentWalletId = null;
  walletName = '';
  localStorage.removeItem('walletId');
  localStorage.removeItem('walletName');
  screens.walletSelect.classList.remove('hidden');
  screens.main.classList.add('hidden');
  document.getElementById('menu-modal').classList.add('hidden');
});

// Show main screen
function showMainScreen() {
  screens.walletSelect.classList.add('hidden');
  screens.main.classList.remove('hidden');
  document.getElementById('create-wallet-modal').classList.add('hidden');
  document.getElementById('join-wallet-modal').classList.add('hidden');
  document.getElementById('wallet-name-display').textContent = walletName || 'Кошелёк';
  loadBalancesAndHistory();
}

// Load balances and history
async function loadBalancesAndHistory() {
  // Load balances
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
    console.error('Error loading balances:', e);
  }
  
  // Load operations
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
      const icon = op.type === 'expense' ? '💴' : '🔄';
      div.innerHTML = `<small>${op.date.substring(0, 10)} ${icon} ${op.amount.toFixed(2)} ${op.comment || ''}</small>`;
      historyList.appendChild(div);
    });
  } catch (e) {
    console.error('Error loading operations:', e);
  }
}

// Expense transaction
expenseBtn.addEventListener('click', () => {
  document.getElementById('expense-modal').classList.remove('hidden');
});

confirmExpenseBtn.addEventListener('click', async () => {
  const source = document.getElementById('expense-source').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const comment = document.getElementById('expense-comment').value;
  
  if (!amount || amount <= 0) return tg.showAlert('Сумма должна быть больше 0');
  
  try {
    const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': currentInitData },
      body: JSON.stringify({ account_type: source, amount, comment })
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

// Transfer (Incassation)
transferBtn.addEventListener('click', () => {
  document.getElementById('transfer-modal').classList.remove('hidden');
});

confirmTransferBtn.addEventListener('click', async () => {
  const transferType = document.getElementById('transfer-from').value;
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  
  if (!amount || amount <= 0) return tg.showAlert('Сумма должна быть больше 0');
  
  // Map transfer types
  const mapping = {
    'safe1': { from: 'safe1', to: 'safe2' },
    'card': { from: 'card', to: 'safe1' }
  };
  
  const transfer = mapping[transferType];
  if (!transfer) return tg.showAlert('Неверный тип трансфера');
  
  try {
    const res = await fetch(`${API_URL}/api/wallet/${currentWalletId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': currentInitData },
      body: JSON.stringify({ from_type: transfer.from, to_type: transfer.to, amount, comment: '' })
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

// Close modals
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});

// Check saved wallet on load
const savedWalletId = localStorage.getItem('walletId');
const savedWalletName = localStorage.getItem('walletName');
if (savedWalletId) {
  currentWalletId = savedWalletId;
  walletName = savedWalletName || 'Кошелёк';
  showMainScreen();
}

