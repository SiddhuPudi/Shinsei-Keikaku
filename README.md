<div align="center">

# 新生計画

# Shinsei Keikaku

### *Track. Grow. Evolve.*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Build & Tests](https://img.shields.io/badge/Tests-49_Passed-success?style=for-the-badge)]()

---

**A full-stack, gamified personal growth operating system that transforms your daily life into an RPG-style progression system.**

*Level up your habits. Conquer your quests. Master your finances. Become the best version of yourself.*

[**Explore Frontend Docs**](frontend/README.md) · [**Explore Backend Docs**](backend/README.md)

</div>

---

## 📖 About

**Shinsei Keikaku** (新生計画 — *New Life Plan*) is a full-stack personal productivity and habit-transformation web application designed for people who treat their life like a game worth mastering. It combines daily habit tracking, fitness goals, quest management, financial accounting, analytics, and annual reflections into a single unified platform — wrapped in a sleek, glassmorphic RPG interface.

The application features a complete **React 19 + Vite** client application paired with a high-performance **Node.js + Express 5 + Prisma ORM** backend powered by a **PostgreSQL (Neon serverless)** database.

---

## ✨ Core Features

### 🎮 Gamified Dashboard

- **Player level & rank system** — progress from *E-Rank Trainee* to *S-Rank Elite*
- **Experience (EXP) tracking** with real-time level progress calculation
- **Combat stats** — Strength 💪, Intellect 🧠, Discipline ⚡️, Vitality ❤️, Focus 🎯
- **Rangers (Friends) system** — search, add, and manage fellow players with online status
- **Quick access grid** for instant navigation to daily tracking, quests, analytics, and finance
- **Live stats synchronization** endpoint (`/api/dashboard/sync-stats`)

### ⚔️ Quest System

- **Daily, Weekly, and Long-Term quests** with categorized EXP and stat rewards
- **Custom quest creation** with difficulty tiers (Easy → Normal → Hard → Extreme)
- **Auto-classification** of quest types based on due dates
- **Auto-completion logic** when current target value reaches completion threshold
- **Database persistence** with full CRUD and user ownership isolation

### 🏆 Achievement System

- **Predefined achievement catalog** across categories: Milestones, Streaks, Fitness, Intellect, Discipline, Special
- **Rarity tiers** — Common, Uncommon, Rare, Epic, Legendary — with color-coded CSS glow effects
- **Progress tracking** for locked achievements with target thresholds
- **Safe unlock & relock endpoints** with duplicate unlock prevention (409 Conflict)

### 💰 Finance Tracker

- **Income & expense management** with categorized transactions and Decimal precision
- **Budget management** with per-category limits, remaining balance, overspend alerts, and month/year filtering
- **Savings goals** — create custom goals with icons, live progress bars, and auto-completion when targets are reached
- **Financial analysis** — monthly and yearly breakdown charts with net balance, income, expense, and savings rate KPIs

### 📊 Daily Tracking & Habit Analytics

- **Daily habit logging** — sleep hours, water intake, study duration, workout status, leetcode count, and mistake logs
- **SVG circular progress ring** showing real-time daily completion percentage
- **Calendar navigation** with day-by-day lookup and idempotent date upserting (`@@unique([userId, date])`)
- **Weekly performance** heatmap matrix (4 habits × 7 days) and habit breakdowns
- **Monthly & Yearly reviews** with KPI score cards and annual reflections

### ⚙️ Settings & Customization

- **Profile management** — avatar, username, email, bio, and password updates
- **Preferences** — dark mode (default), compact view, UI animations, language selector (English / 日本語 / हिन्दी), and 5 accent color themes (Cyan, Purple, Pink, Green, Orange)
- **Notification settings** — toggles for daily reminders, streak alerts, weekly reports, achievement pop-ups, and quest deadlines
- **Data management** — export/import JSON, clear logs, and delete account with confirmation modals

### 🔐 Authentication & Multi-Tenant Security

- **JWT token authentication** (`Bearer <token>`) with 30-day validity
- **Cryptographic password hashing** via `bcrypt` (10 salt rounds)
- **Strict tenant isolation** — all database queries enforce `where: { id, userId: req.user.id }` to prevent IDOR vulnerabilities
- **Client route protection** via `<ProtectedRoute>` with session restoration from `GET /api/auth/me`

---

## 🏗️ Project Architecture

```
Shinsei-Keikaku/
│
├── frontend/                              # Client Application (React 19 + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                           # Feature API clients (e.g. financeApi.js)
│   │   ├── assets/                        # SVG icons and static assets
│   │   ├── components/                    # Reusable components (Header, PlayerStatusPanel, etc.)
│   │   │   └── ProtectedRoutes.jsx        # Route authentication guard
│   │   ├── context/                       # Global state (AuthContext.jsx)
│   │   ├── services/                      # Axios client with JWT request interceptor (api.js)
│   │   ├── Pages/                         # 10 application pages (Home, Auth, Daily, Finance, etc.)
│   │   ├── App.jsx                        # Route definitions with React Router v7
│   │   └── main.jsx                       # Client entry point
│   ├── package.json
│   ├── vite.config.js
│   └── README.md                          # Comprehensive Frontend Documentation
│
├── backend/                               # REST API Server (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── migrations/                    # Database SQL migrations
│   │   └── schema.prisma                  # 11 Prisma models, 7 enums, and relations
│   ├── src/
│   │   ├── config/                        # Prisma client & PostgreSQL pool connection
│   │   ├── controllers/                   # Route handlers (auth, finance, quests, daily, etc.)
│   │   ├── middleware/                    # JWT Bearer authentication middleware
│   │   ├── routes/                        # Express API route declarations
│   │   ├── services/                      # Stats calculations & finance helpers
│   │   ├── utils/                         # Token generator
│   │   └── server.js                      # Express server entry point & centralized error handler
│   ├── tests/
│   │   └── integration.test.js            # 49 end-to-end integration tests
│   ├── package.json
│   └── README.md                          # Comprehensive Backend Documentation
│
├── LICENSE                                # MIT License
└── README.md                              # Root Monorepo Documentation
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.2.0` | UI component library with hooks & context |
| **Vite** | `7.2.4` | Modern build tool, dev server, and production bundler |
| **React Router DOM** | `7.10.0` | Client-side routing with protected route guards |
| **Axios** | `1.16.1` | HTTP client with automatic JWT token interceptor |
| **Vanilla CSS** | — | Custom glassmorphism design with gradients & CSS variables |
| **ESLint** | `9.39.1` | Linter configured with React Hooks & Refresh plugins |

### Backend

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `≥ 18.x` | JavaScript server runtime |
| **Express.js** | `5.2.1` | Web framework for REST endpoints and middleware |
| **Prisma ORM** | `7.8.0` | Type-safe database queries, migrations, and modeling |
| **PostgreSQL / Neon** | `8.21.0` | Serverless relational database with `@prisma/adapter-pg` |
| **JSON Web Token** | `9.0.3` | Stateless Bearer token issuance and verification |
| **Bcrypt** | `6.0.0` | Password hashing with cryptographic salts (10 rounds) |
| **dotenv** | `17.4.2` | Environment variable management |
| **cors** | `2.8.6` | Cross-Origin Resource Sharing control |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **PostgreSQL** database (e.g., free tier on [Neon](https://neon.tech/), local Postgres, or Supabase)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/SiddhuPudi/Shinsei-Keikaku.git
cd Shinsei-Keikaku
```

---

### Step 2: Backend Setup & Launch

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your `.env` configuration file in `backend/`:

   ```env
   PORT=3000
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   NODE_ENV=development
   ```

4. Generate the Prisma client and apply database migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Run the automated integration test suite to verify connectivity:

   ```bash
   npm test
   ```

   *(49 tests should pass covering all endpoints)*

6. Start the backend development server:

   ```bash
   npm run dev
   ```

   *The backend will be running at `http://localhost:3000`.*

---

### Step 3: Frontend Setup & Launch

1. Open a new terminal window and navigate to the frontend folder:

   ```bash
   cd Shinsei-Keikaku/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🧪 Testing & Verification

| Suite | Scope | Command | Details |
| :--- | :--- | :--- | :--- |
| **Backend Integration Tests** | Backend API | `npm test` *(in `backend/`)* | 49 assertions testing Auth, Transactions, Budgets, Goals, Daily Logs, Quests, Achievements, Reflections, Profile, Settings, and centralized error handling. |
| **Frontend Linting** | Frontend Code | `npm run lint` *(in `frontend/`)* | ESLint 9 validation across all React components, hooks, and pages (0 errors, 0 warnings). |
| **Frontend Production Build** | Frontend Bundle | `npm run build` *(in `frontend/`)* | Validates Vite bundle generation without type or asset errors. |

---

## 🗺️ Roadmap

- [x] Gamified dashboard with player stats, level, and combat attributes
- [x] Quest system with custom quest creation and difficulty tiers
- [x] Achievement system with rarity tiers, badges, and progress tracking
- [x] Finance tracker with income/expense transactions, budgets, goals, and analysis
- [x] Daily habit logging, weekly matrix, monthly reviews, and yearly reflections
- [x] Settings panel with preferences, notifications, and data management
- [x] User authentication UI (login & register with sliding animations)
- [x] Rangers (friends) system with search and pending request management
- [x] Full REST API server built with Node.js, Express, and Prisma ORM
- [x] PostgreSQL database schema with 11 relational models and cascade integrity
- [x] JWT token-based authentication and Bcrypt password security
- [x] Client-side protected route redirection and token session restoration
- [x] Live backend API integration for transactions, budgets, and savings goals
- [x] Automated 49-assertion integration test suite
- [ ] Connect remaining frontend pages (Daily, Quests, Achievements) to live endpoints
- [ ] Production cloud deployment (e.g. Vercel for frontend + Railway/Render for backend)
- [ ] Global & Friends Leaderboards
- [ ] Push notifications for streak preservation and quest deadlines

---

## 🤝 Contributing

Contributions are welcome and appreciated!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

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
