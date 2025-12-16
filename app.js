// app.js
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand(); // просим максимум высоты [web:2][web:22]

tg.MainButton.setText('Обновить');
tg.MainButton.show();
tg.onEvent('mainButtonClicked', () => {
  tg.showAlert('Mini App работает 🚀');
});
