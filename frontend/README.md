<div align="center">

# 新生計画 · Frontend

## Shinsei Keikaku — Client Application

### *Track. Grow. Evolve.*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.10-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![CSS](https://img.shields.io/badge/Vanilla_CSS-Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white)]()

</div>

---

## 📖 Overview

This is the **frontend client** for Shinsei Keikaku (新生計画 — *New Life Plan*), a gamified personal growth web application. Built with React 19 and Vite, it features a fully designed glassmorphism UI across **10 pages** and **6 reusable components**, delivering a complete RPG-style productivity experience.

> **Note:** This frontend is currently self-contained with mock/local data. All state is managed via React Context API and `localStorage`. The backend integration is planned for a future phase.

---

## 🛠️ Tech Stack

| Technology | Version | Role |
|:---|:---|:---|
| **React** | `19.2.0` | UI framework with hooks (`useState`, `useEffect`, `useMemo`, `useContext`, `useRef`) |
| **React DOM** | `19.2.0` | DOM rendering + `createPortal` for floating panels |
| **React Router DOM** | `7.10.0` | Client-side routing with `BrowserRouter`, `Routes`, `Link`, `useNavigate`, `useLocation` |
| **Vite** | `7.2.4` | Dev server, HMR, and production bundler |
| **ESLint** | `9.39.1` | Code linting with React Hooks & Refresh plugins |
| **Vanilla CSS** | — | Custom glassmorphism styling with gradients, animations, and CSS variables |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server (default: http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── react.svg                      # App icon asset
│   │
│   ├── components/                        # Reusable UI components
│   │   ├── Header.jsx                     # Global navigation bar
│   │   ├── Header.css
│   │   ├── DashboardHeader.jsx            # Welcome greeting with username
│   │   ├── DashboardHeader.css
│   │   ├── PlayerStatusPanel.jsx          # Avatar, rank, EXP bar, combat stats
│   │   ├── PlayerStatusPanel.css
│   │   ├── FriendsPanel.jsx               # Rangers system (friends management)
│   │   ├── FriendsPanel.css
│   │   ├── QuickAccessGrid.jsx            # Dashboard navigation card grid
│   │   ├── QuickAccessCard.jsx            # Individual quick access card
│   │   └── QuickAccess.css
│   │
│   ├── context/                           # Global state management
│   │   └── AuthContext.jsx                # Auth provider (login/logout/localStorage)
│   │
│   ├── Pages/                             # Application pages (10 total)
│   │   ├── Home.jsx / Home.css            # Landing hero + authenticated dashboard
│   │   ├── Auth.jsx / Auth.css            # Login/Register with sliding panels
│   │   ├── Daily.jsx / Daily.css          # Daily habit tracking & logging
│   │   ├── Weekly.jsx / Weekly.css        # Weekly habit heatmap & performance
│   │   ├── Monthly.jsx / Monthly.css      # Monthly KPIs, goals & reflections
│   │   ├── Yearly.jsx / Yearly.css        # Yearly overview with score charts
│   │   ├── Quests.jsx / Quests.css        # Quest log & custom quest creator
│   │   ├── Achievements.jsx / Achievements.css  # Achievement grid with rarity system
│   │   ├── Finance.jsx / Finance.css      # Full finance management (5 tabs)
│   │   └── Settings.jsx / Settings.css    # App settings (6 sections)
│   │
│   ├── App.jsx                            # Root component with route definitions
│   ├── App.css                            # App-level styles
│   ├── main.jsx                           # Entry point — StrictMode + AuthProvider
│   └── index.css                          # Global base styles
│
├── index.html                             # HTML entry point
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 🗺️ Routing Map

All routes are defined in `App.jsx` using React Router v7:

| Route | Page Component | Description |
|:---|:---|:---|
| `/` | `Home` | Landing page (unauthenticated) / Dashboard (authenticated) |
| `/auth` | `Auth` | Login & Register with animated sliding panel |
| `/daily` | `Daily` | Daily habit tracking, quests, calendar, reflections |
| `/weekly` | `Weekly` | Weekly heatmap, daily performance chart, goals |
| `/monthly` | `Monthly` | Monthly KPIs, goals, activity summary, reflections |
| `/yearly` | `Yearly` | Yearly score chart, KPIs, highlights, goals |
| `/quests` | `Quests` | Quest log with filters and custom quest creation |
| `/achievements` | `Achievements` | Achievement showcase with rarity and progress |
| `/finance` | `Finance` | Finance tracker with 5 tabs |
| `/settings` | `Settings` | Full settings panel with 6 sections |

---

## ✨ Feature Breakdown

### 🏠 Home Page (`/`)

**Unauthenticated view:**
- Hero landing with Japanese kanji logo (新)
- Glowing animated title with tagline *"Track. Grow. Evolve."*
- Sign In / Sign Up navigation buttons

**Authenticated Dashboard:**
- `DashboardHeader` — personalized welcome greeting
- `PlayerStatusPanel` — avatar with level badge, EXP bar (0/100), rank (*E-Rank Trainee*), and 5 combat stats:
  - 💪 Strength · 🧠 Intellect · ⚡️ Discipline · ❤️ Vitality · 🎯 Focus
- `QuickAccessGrid` — 4 shortcut cards: Daily Tracking, Quest Log, Analytics, Finance Tracker
- **Rangers Panel** — floating friends system rendered via `createPortal`:
  - **Friends tab** — list with online/offline status and remove
  - **Search tab** — search players by username, send friend requests with toast notifications
  - **Requests tab** — accept/decline pending friend requests

---

### 🔐 Auth Page (`/auth`)

- **Dual-panel layout** with animated sliding glass panel
- **Login form** — email + password with submit animation
- **Register form** — username + email + password
- **Mode switching** — smooth panel transitions between Login ↔ Register
- **Success overlay** — animated checkmark with *"System Approved"* message
- **LocalStorage persistence** via `AuthContext` — stores `shinsei_user` JSON
- Auth-aware navigation: `Header` shows links only when authenticated

---

### 🗓️ Daily Tracking (`/daily`)

- **SVG circular progress ring** — animated gradient ring showing daily completion %
- **Level & EXP system** — level = `Math.floor(totalExp / 50) + 1`, progress bar
- **Daily Quests** (4 default):
  - Wake Up Early (+15 EXP) · LeetCode Problem (+20 EXP) · Workout Session (+25 EXP) · Study 1 Hour (+30 EXP)
  - Checkbox toggles with progress bar per quest
- **EXP Calculation** — quest EXP earned minus mistake penalties (-5 EXP per mistake)
- **Streak Cards** — visual streak grid per quest (🔥 Active / Start your streak)
- **Interactive Calendar** — month navigation, today highlight, date selection
- **Sleep & Wake Tracker** — datetime inputs with auto-calculated duration and mini progress bar
- **Activities / Workout** — workout type selector (Gym/Running/Home/Rest), steps walked, start/end time with duration
- **Study & Screen Time** — study duration (auto-completes quest if ≥ 1 hour), phone + laptop screen hours, water intake (litres)
- **Mistakes Logger** — checkboxes for Junk Food, Skipped Workout, Overslept, Overused Phone, Other (expandable text input)
- **Reflections** — "What I learned", "One thing I'm proud of", "To improve tomorrow" textareas + mood slider (1–10)
- **Save Progress** button with loading animation + **Finalize Day** button

---

### 📅 Weekly Overview (`/weekly`)

- **KPI Stats** — consistency %, tasks done, tasks missed, perfect days
- **Habit Heatmap Grid** — 4 habits × 7 days color-coded matrix (Wake Early 🌅, Workout ⚔️, LeetCode 💻, Study 📚)
- **Daily Performance Bar Chart** — vertical bars per day showing tasks completed out of total
- **Habit Breakdown** — horizontal progress bars per habit with completion count (/7) and distinct colors
- **Weekly Goals** — 4 goals with progress bars, targets, and EXP rewards

---

### 📊 Monthly Review (`/monthly`)

- **Tab navigation** — "This Month" / "History" views
- **Current Month KPIs** — consistency %, EXP earned, perfect days, mistakes
- **Monthly Goals** — 4 trackable goals (workouts, study hours, wake early, LeetCode) with progress and EXP
- **Activity Summary** — horizontal progress bars for each activity with icons and color-coded completion
- **Month Reflection** — key win, biggest challenge, focus for next month textareas
- **History View** — past months listed with score bars, EXP, and breakdown stats (💪 workouts | 📚 study hours | 🔥 streak)
- **Export Report** button

---

### 🗓️ Yearly Overview (`/yearly`)

- **Primary KPI** — total EXP earned (hero card with ⚡ icon)
- **Secondary KPIs** — workouts, study hours, LeetCode, perfect days, mistakes
- **Monthly Score Chart** — 12-month vertical bar chart with hover tooltips (score % + EXP), best month highlighted in gold
- **Stat Highlights** — 4 cards: Best Month 👑, Worst Month 📉, Max Streak 🔥, Total Level ⚡
- **Yearly Goals** — 4 long-term goals with horizontal progress bars and EXP rewards
- **Year Reflection** — greatest achievement, biggest lesson, vision for next year + Export Report

---

### ⚔️ Quest Log (`/quests`)

- **Custom Quest Creation** with modal:
  - Quest name, description, stat category (Strength/Intellect/Discipline/Vitality/Focus)
  - Difficulty tiers: Easy (15 EXP, +1 stat) → Normal (25, +1) → Hard (35, +2) → Extreme (50, +3)
  - Deadline-based auto-classification (Long-term)
  - Auto-calculated EXP and stat rewards
- **Quest Filters** — all, daily, weekly, long, completed
- **Quest Cards** — title, description, progress bar, EXP badge, stat badge with color, active/completed status
- **Default Quests** — Wake Up Early, Workout, Study Consistency (weekly, 3/5), Build Coding Discipline (long-term, 40%)
- **Empty state** design for empty quest lists

---

### 🏆 Achievements (`/achievements`)

- **Stats Row** — unlocked count, legendary count, total EXP earned, completion %
- **Overall Progress Bar** — gradient-filled completion tracker
- **Filter System** — all, 🔓 unlocked, 🔒 locked, 🔥 streak, ⚔️ fitness, 🧠 intellect, 🎯 discipline, 🏆 milestone
- **Achievement Cards** with:
  - Icon, title, description, rarity badge with color + glow (CSS variables `--rarity-color`, `--rarity-glow`)
  - Rarity tiers: Common (#94a3b8) → Uncommon (#34d399) → Rare (#38bdf8) → Epic (#a78bfa) → Legendary (#f59e0b)
  - EXP reward badge
  - Unlocked: completion date + ✓ COMPLETED badge
  - Locked: progress bar with count and percentage
- **9 pre-defined achievements**: First Step, Iron Will, Warrior's Path, Scholar, Legendary Streak, Code Master, Early Bird, Hydration Hero, Zero Mistakes

---

### 💰 Finance Tracker (`/finance`)

**5-tab system:**

| Tab | Features |
|:---|:---|
| **📊 Overview** | Net balance, total income/expense, savings rate cards; budget category bars (6 categories); recent transactions list |
| **📋 Transactions** | Full transaction list with type filters (all/income/expense); add transaction modal with type toggle, category selector, date picker |
| **🗂️ Budgets** | Detailed budget view with per-category spend vs. budget, remaining amount, overspend alerts |
| **🎯 Goals** | Savings goals with icon picker (10 icons), progress bars, current/target amounts; add goal modal with live preview |
| **📈 Analysis** | Monthly/Yearly toggle; KPI cards per period (income, expense, net, savings rate); horizontal bar chart comparing income vs expense |

- **27 pre-loaded transactions** across Jan–Mar 2025
- **6 budget categories**: Food 🍔, Fitness ⚔️, Learning 📚, Entertainment 🎮, Transport 🚗, Savings 💰
- **3 default savings goals**: Emergency Fund 🛡️, New Laptop 💻, Travel Fund ✈️
- **Currency**: ₹ (Indian Rupee)
- **Transaction categories**: food, fitness, learning, entertainment, transport, health, shopping, other, income

---

### ⚙️ Settings (`/settings`)

**6-section sidebar layout:**

| Section | Features |
|:---|:---|
| **👤 Profile** | Avatar with initial, username, email, bio textarea, password change with confirmation |
| **⚙️ Preferences** | Dark mode toggle, compact view toggle, animations toggle, language select (English / 日本語 / हिन्दी), accent color picker (cyan / purple / pink / green / orange) |
| **🔔 Notifications** | 5 toggles: Daily Reminder, Streak Alert, Weekly Report, Achievement Unlocked, Quest Deadline |
| **⚔️ Quests** | Auto-complete toggle, show EXP toggle, mistake penalty system toggle, default difficulty select (Easy/Normal/Hard/Extreme) |
| **🗄️ Data** | Export All Data (JSON), Import Data, Clear Daily Logs (with confirmation), Delete Account (with confirmation modal — ⚠️ warning, Go Back / Yes action) |
| **ℹ️ About** | App logo, name, tagline, version (v1.0.0), build (2025.03), philosophy (新生計画 · New Life Plan), description |

- **Custom Toggle component** — animated track + thumb switch used across Preferences, Notifications, and Quests sections

---

## 🧩 Components Reference

### Global Components

| Component | File | Description |
|:---|:---|:---|
| `Header` | `components/Header.jsx` | Persistent top navigation bar. Shows logo (新 kanji), title, nav links (Daily/Quests/Achievements/Weekly/Monthly/Yearly/Finance/Settings — visible only when authenticated), username display, and Login/Logout button. |
| `DashboardHeader` | `components/DashboardHeader.jsx` | Simple welcome header displaying `"Welcome back, {username}"` on the dashboard. |
| `PlayerStatusPanel` | `components/PlayerStatusPanel.jsx` | Left-side dashboard panel: avatar circle with initial, level badge (Lvl 1), player name, rank (E-Rank Trainee), EXP bar (0/100), and 5 stat bars (Strength, Intellect, Discipline, Vitality, Focus). Includes Rangers button that opens the FriendsPanel. |
| `FriendsPanel` | `components/FriendsPanel.jsx` | Floating panel rendered via React `createPortal` to escape stacking contexts. Contains 3 tabs: Friends list (with online dots), Search (username-based with send request + toast), Requests (accept/decline). 8 mock search users, 3 initial friends, 2 initial pending requests. |
| `QuickAccessGrid` | `components/QuickAccessGrid.jsx` | 2×2 grid of `QuickAccessCard` components linking to Daily Tracking, Quest Log, Analytics, and Finance Tracker with icons and descriptions. |
| `QuickAccessCard` | `components/QuickAccessCard.jsx` | Individual card component accepting `icon`, `title`, `desc`, and `to` (route path) props. Renders as a navigable link. |

---

## 🔐 State Management

### AuthContext (`context/AuthContext.jsx`)

Provides global authentication state via React Context API:

```jsx
// Exposed values
{
  user,              // { username, email } | null
  isAuthenticated,   // boolean
  login({ username, email }),   // stores to localStorage key "shinsei_user"
  logout()           // clears localStorage and resets state
}
```

- **Persistence**: User session persists across page refreshes via `localStorage`
- **Wrapping**: `AuthProvider` wraps the entire `<App />` in `main.jsx`
- **Usage**: Consumed via `useAuth()` hook in Header, Home, Settings, and Auth pages

---

## 🎨 Design System

### Visual Language

- **Glassmorphism** — semi-transparent card backgrounds with `backdrop-filter: blur()` and subtle borders
- **Dark theme** — deep dark backgrounds (`#0a0a0f`, `#111`) with high-contrast text
- **Gradient accents** — cyan-to-purple gradients on progress bars, buttons, and highlights
- **Rarity glow system** — CSS custom properties (`--rarity-color`, `--rarity-glow`) for achievement card borders and shadows
- **SVG animations** — circular progress ring in Daily page with animated `strokeDashoffset`

### Color Palette

| Color | Hex | Usage |
|:---|:---|:---|
| Cyan | `#00cfff` | Primary accent, EXP bars, default theme |
| Purple | `#a78bfa` | Epic rarity, study stats, secondary accent |
| Pink | `#fb7185` | Expense values, errors, fitness stats |
| Green | `#34d399` | Income values, success, vitality stat |
| Amber | `#f59e0b` | Legendary rarity, warnings, wake early |
| Blue | `#38bdf8` | Rare rarity, LeetCode stats, info |

### Accent Colors (Settings)

Users can select from 5 accent themes:
`Cyan (#00cfff)` · `Purple (#a855f7)` · `Pink (#ec4899)` · `Green (#34d399)` · `Orange (#f97316)`

---

## 📜 Available Scripts

| Script | Command | Description |
|:---|:---|:---|
| **Dev** | `npm run dev` | Start Vite dev server with HMR |
| **Build** | `npm run build` | Create optimized production bundle |
| **Preview** | `npm run preview` | Preview production build locally |
| **Lint** | `npm run lint` | Run ESLint with React plugins |

---

## 📦 Dependencies

### Runtime

| Package | Version |
|:---|:---|
| `react` | `^19.2.0` |
| `react-dom` | `^19.2.0` |
| `react-router-dom` | `^7.10.0` |

### Development

| Package | Version |
|:---|:---|
| `vite` | `^7.2.4` |
| `@vitejs/plugin-react` | `^5.1.1` |
| `eslint` | `^9.39.1` |
| `@eslint/js` | `^9.39.1` |
| `eslint-plugin-react-hooks` | `^7.0.1` |
| `eslint-plugin-react-refresh` | `^0.4.24` |
| `globals` | `^16.5.0` |
| `@types/react` | `^19.2.5` |
| `@types/react-dom` | `^19.2.3` |

---

## 🔮 What's Next

This frontend is designed to be **backend-ready**. The planned integration includes:

- [ ] Replace `localStorage` auth with JWT-based authentication
- [ ] Connect all data (quests, achievements, finance, stats) to REST API endpoints
- [ ] Implement real-time data sync and persistence via PostgreSQL
- [ ] Add loading states, error boundaries, and optimistic updates
- [ ] Progressive mobile responsiveness enhancements
- [ ] Push notification integration for streak alerts and quest deadlines

---

<div align="center">

*Built with React 19 · Styled with pure CSS · Designed for growth.*

**新生計画 · Shinsei Keikaku Frontend**

</div>