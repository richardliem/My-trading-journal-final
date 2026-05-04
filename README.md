# 📊 Trading Journal

A professional crypto trading journal built with React + Vite. Syncs data to your GitHub repository.

## Features
- ✅ Add/edit/delete trades
- 📊 Dashboard with win rate, P&L, strategy breakdown
- 📅 Calendar view by month
- 📈 Profit curve & daily P&L charts
- ☁️ GitHub sync — data stored as `trades.json` in your repo
- 🌙 Dark terminal-style UI

---

## 🚀 Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/trading-journal.git
cd trading-journal
npm install
npm run dev
```

### 2. Deploy to GitHub Pages (Auto)
Push to `main` branch — GitHub Actions will auto-build and deploy.

Enable Pages:
- Go to repo **Settings → Pages**
- Source: **GitHub Actions**

Your app will be live at: `https://YOUR_USERNAME.github.io/trading-journal`

### 3. Connect GitHub Storage
1. Go to **Settings** tab in the app
2. Create a GitHub **Personal Access Token** (PAT):
   - GitHub → Settings → Developer Settings → Fine-grained tokens
   - Give **Contents: Read & Write** for this repo
3. Enter your token, username, repo name → **Save & Connect**
4. All trades auto-sync to `trades.json` in this repo ✓

---

## 📁 Structure
```
trading-journal/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── TradeForm.jsx
│   │   ├── TradeList.jsx
│   │   ├── CalendarView.jsx
│   │   ├── ProfitChart.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── github.js
│   │   └── stats.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/workflows/deploy.yml
├── index.html
├── package.json
└── vite.config.js
```

## ⚠️ Security Note
- Use a **private repository** to keep your trade data private
- Your GitHub token is stored in browser localStorage — don't share your device
- Never commit your PAT token to the repository
