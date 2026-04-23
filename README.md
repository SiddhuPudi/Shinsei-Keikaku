<div align="center">

# 新生計画

# Shinsei Keikaku

### *Track. Grow. Evolve.*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-f59e0b?style=for-the-badge)]()

---

**A gamified personal growth web application that transforms your daily life into an RPG-style progression system.**

*Level up your habits. Conquer your quests. Master your finances. Become the best version of yourself.*

</div>

---

## 📖 About

**Shinsei Keikaku** (新生計画 — *New Life Plan*) is a full-stack personal growth operating system designed for people who treat their life like a game worth mastering. It combines habit tracking, fitness goals, financial management, and analytics into a single unified experience — wrapped in a sleek, gamified interface.

> **⚠️ Current Status:** This repository contains **only the frontend** implementation. The backend is planned and will be developed using Node.js, Express, PostgreSQL, and Prisma ORM.

---

## ✨ Core Features

### 🎮 Gamified Dashboard
- **Player level & rank system** — progress from *E-Rank Trainee* to *S-Rank Elite*
- **Experience (EXP) tracking** with visual progress bars
- **Combat stats** — Strength 💪, Intellect 🧠, Discipline ⚡️, Vitality ❤️, Focus 🎯
- **Rangers (Friends) system** — search, add, and manage fellow players with online status
- **Quick access grid** for instant navigation to key modules

### ⚔️ Quest System
- **Daily, Weekly, and Long-term quests** with EXP and stat rewards
- **Custom quest creation** with difficulty tiers (Easy → Extreme)
- **Auto-classification** of quest type based on deadline
- **Progress tracking** with visual completion bars
- **Stat category rewards** — each quest contributes to specific combat stats

### 🏆 Achievement System
- **Unlockable achievements** across categories: Streaks, Fitness, Intellect, Discipline, Milestones
- **Rarity tiers** — Common, Uncommon, Rare, Epic, Legendary — with color-coded glow effects
- **Progress tracking** for locked achievements
- **Filterable achievement grid** with overall completion statistics

### 💰 Finance Tracker
- **Income & expense tracking** with categorized transactions
- **Budget management** with per-category progress bars and overspend alerts
- **Savings goals** — create custom goals with icon selection and progress visualization
- **Financial analysis** — month-by-month and year-by-year bar charts with KPI breakdowns
- **Net balance, savings rate, and trend analysis**

### 📊 Analytics
- **Daily tracking** — log sleep, habits, study hours, wake time, and mistakes
- **Weekly performance** summaries
- **Monthly performance** charts and insights
- **Yearly insights** and progress visualization

### ⚙️ Settings System
- **Profile management** — username, email, bio, password
- **Preferences** — dark mode, accent color (5 themes), compact view, animations, language (EN/JP/HI)
- **Notifications** — daily reminders, streak alerts, weekly reports, achievement pop-ups, quest deadlines
- **Quest behavior** — auto-complete, EXP display, penalty system, default difficulty
- **Data & Privacy** — export/import JSON, clear logs, delete account with confirmation modals

---

## 🖼️ UI Design

Shinsei Keikaku features a modern, premium interface built from scratch:

- **Glassmorphism UI** — frosted-glass cards with translucent backgrounds and subtle blur effects
- **Gradient-based styling** — vibrant gradient accents and glowing elements throughout
- **Dark theme by default** — designed for extended use with eye-friendly contrast
- **Responsive layout** — dashboard-style experience that adapts to different screen sizes
- **Micro-animations** — smooth transitions on cards, progress bars, and interactive elements
- **RPG-inspired aesthetics** — rarity glows, stat bars, and rank badges for an immersive feel

---

## 🏗️ Project Structure

```
Shinsei-Keikaku/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── DashboardHeader.jsx      # Welcome header with username
│   │   │   ├── DashboardHeader.css
│   │   │   ├── Header.jsx              # Global nav bar with auth-aware links
│   │   │   ├── Header.css
│   │   │   ├── PlayerStatusPanel.jsx    # Avatar, level, EXP, combat stats
│   │   │   ├── PlayerStatusPanel.css
│   │   │   ├── FriendsPanel.jsx         # Rangers — search, add, manage friends
│   │   │   ├── FriendsPanel.css
│   │   │   ├── QuickAccessGrid.jsx      # Dashboard shortcut cards
│   │   │   ├── QuickAccessCard.jsx
│   │   │   └── QuickAccess.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Authentication state (localStorage)
│   │   ├── Pages/
│   │   │   ├── Home.jsx / Home.css        # Landing page + authenticated dashboard
│   │   │   ├── Auth.jsx / Auth.css        # Login & registration
│   │   │   ├── Daily.jsx / Daily.css      # Daily habit & task tracking
│   │   │   ├── Weekly.jsx / Weekly.css    # Weekly performance overview
│   │   │   ├── Monthly.jsx / Monthly.css  # Monthly analytics
│   │   │   ├── Yearly.jsx / Yearly.css    # Yearly insights
│   │   │   ├── Quests.jsx / Quests.css    # Quest log & custom quest creator
│   │   │   ├── Achievements.jsx / Achievements.css  # Achievement showcase
│   │   │   ├── Finance.jsx / Finance.css  # Full finance management suite
│   │   │   └── Settings.jsx / Settings.css # App configuration & data management
│   │   ├── App.jsx                      # Route definitions
│   │   ├── App.css
│   │   ├── main.jsx                     # Entry point with AuthProvider
│   │   └── index.css                    # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
└── backend/                             # 🔜 Planned
    ├── controllers/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── models/
    └── prisma/
```

---

## 🛠️ Tech Stack

### Frontend (Active)

| Technology | Version | Purpose |
|:---|:---|:---|
| **React** | 19.2 | UI library with hooks & context |
| **Vite** | 7.2 | Build tool & dev server |
| **React Router DOM** | 7.10 | Client-side routing |
| **Context API** | — | Global state management (auth) |
| **Vanilla CSS** | — | Custom glassmorphism styling |

### Backend (Planned)

| Technology | Purpose |
|:---|:---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Database schema & queries |
| **JWT** | Token-based authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SiddhuPudi/Shinsei-Keikaku.git

# 2. Navigate to the frontend directory
cd Shinsei-Keikaku/frontend

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗺️ Roadmap

- [x] Gamified dashboard with player stats
- [x] Quest system with custom quest creation
- [x] Achievement system with rarity tiers
- [x] Finance tracker with budgets, goals, and analysis
- [x] Daily, Weekly, Monthly, Yearly tracking pages
- [x] Settings panel with preferences, notifications, and data management
- [x] Authentication UI (login/register)
- [x] Rangers (friends) system
- [ ] Full backend API implementation
- [ ] Database-backed user authentication (JWT)
- [ ] Cloud deployment (Vercel + Railway/Render)
- [ ] Real-time data sync & persistence
- [ ] Mobile responsiveness improvements
- [ ] Push notifications
- [ ] Leaderboard system
- [ ] Social features expansion

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's fixing a bug, improving the UI, or building out the backend — all contributions help.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

> **Tip:** Check the [Roadmap](#-roadmap) for ideas on what to work on next.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 新生計画 · Shinsei Keikaku

*A personal growth OS for those who treat their life like a game worth mastering.*

**Level up every single day.**

---

Built with 💜 as a full-stack personal productivity system.

</div>
