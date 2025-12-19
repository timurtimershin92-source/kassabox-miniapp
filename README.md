# Kassabox - Telegram Mini App for Money Accounting

## Overview

Kassabox is a fully functional Telegram Mini App for managing personal finances across three separate accounts (Card, Cash Register/Safe1, and Safe2). It provides real-time balance tracking, expense logging, and fund transfers with a complete transaction history.

## Features

### Core Functionality

✅ **Wallet Management**
- Create new wallets with custom names
- Join existing wallets using 8-character codes
- Multi-user collaboration support
- Secure Telegram authentication

✅ **Account Balances** (Three independent accounts)
- 💳 **Card** - for card payments
- 🔒 **Cash Register (Safe1)** - for physical cash
- 🔐 **Safe 2** - for secured storage
- Real-time total balance calculation

✅ **Transaction Management**
- **Expenses**: Record withdrawals from any account with optional comments
- **Incassation/Transfers**: Move funds between accounts
  - Касса → Сейф 2 (Cash to Safe 2)
  - Карта → Касса (Card to Cash Register)
- Input validation and overdraft prevention

✅ **Operation History**
- Display last 20 transactions
- Shows date, type, amount, and description
- Real-time updates

### Technical Features

- Responsive mobile-first design
- Dark theme with Telegram styling
- iPhone safe area support (notch handling)
- Persistent storage with localStorage
- Secure authentication via Telegram initData
- Complete audit trail of all transactions

## Tech Stack

### Frontend
- **Language**: JavaScript (228 lines)
- **Markup**: HTML5 (149 lines)
- **Styling**: CSS3 (280 lines)
- **Framework**: Telegram WebApp API
- **Deployment**: Vercel
- **URL**: https://kassabox-miniapp.vercel.app

### Backend
- **Language**: Python 3.13
- **Framework**: FastAPI + aiogram
- **Database**: SQLite3
- **Deployment**: Render
- **URL**: https://kassabox-bot.onrender.com
- **API Documentation**: REST API with Telegram signature validation

## API Endpoints

All endpoints require Telegram `initData` header for authentication.

### Wallet Management
- `POST /api/wallet/create` - Create new wallet
- `POST /api/wallet/join` - Join existing wallet

### Account Operations
- `GET /api/wallet/{id}/balances` - Get current account balances
- `POST /api/wallet/{id}/expense` - Record expense transaction
- `POST /api/wallet/{id}/transfer` - Execute transfer between accounts
- `GET /api/wallet/{id}/operations` - Get transaction history
- `GET /api/wallet/{id}/users` - Get wallet members

## File Structure

```
kassabox-miniapp/
├── app.js          # Main application logic
├── index.html      # HTML structure with modals
├── style.css       # Responsive styling
└── README.md       # This file
```

## Installation & Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Vercel automatically deploys on every push to main branch
3. Environment variables: None required

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set start command: `python main.py`
4. Add environment variable: `BOT_TOKEN` (from @BotFather)
5. Service runs on port 8000 (auto-exposed)

## Usage

### User Flow

1. Open Telegram bot that triggers this Mini App
2. Click button to open Kassabox
3. Create new wallet or join existing one (8-char code)
4. View balances across three accounts
5. Record expenses or transfers
6. Check transaction history

### Creating a Wallet
- Click "Создать кошелёк" (Create Wallet)
- Enter wallet name (1-20 characters)
- Click "Создать" (Create)
- Share 8-character wallet code with others

### Recording Transactions
- Click "Расход" (Expense) to record withdrawals
- Click "Инкассация" (Transfer) to move funds between accounts
- Fill form with amount and optional comment
- Submit to update balances in real-time

## Security

- Telegram signature validation on all API requests
- User isolation by wallet ID
- No sensitive data stored in localStorage
- CORS configured for Vercel frontend only
- SQLite3 database with proper schema design

## Git Commits (17 Total)

Projects includes full commit history showing development progression:
- Initial wallet selection UI
- Balance display implementation
- Expense and transfer modals
- CSS styling refinement  
- App.js rewrite with syntax fixes

## Deployment Status

- ✅ Frontend: Live on Vercel (17 deployments)
- ✅ Backend: Live on Render (production)
- ✅ Database: SQLite3 persistent storage
- ✅ All API endpoints functional

## Testing

UI testing performed:
- ✅ Wallet creation modal opens/closes
- ✅ Join wallet modal displays correctly
- ✅ Form inputs accept text
- ✅ Cancel buttons close modals
- ✅ Balance cards display
- ✅ All buttons render correctly

## Future Enhancements

Potential features for v2:
- Wallet code display/sharing in menu
- User management (add users to wallet)
- Edit wallet name
- Recurring transactions
- Monthly reports
- Multiple currency support
- Export transaction history

## Support

For issues or questions, contact the development team or check GitHub issues.

## License

This project is proprietary software created for personal finance management via Telegram.

---

**Last Updated**: December 19, 2025
**Status**: ✅ Production Ready - MVP Complete
