<div align="center">

# 新生計画 · Backend

## Shinsei Keikaku — REST API & Server

### *Track. Grow. Evolve.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Security](https://img.shields.io/badge/Bcrypt-Password_Hashing-4A154B?style=for-the-badge)](https://github.com/kelektiv/node.bcrypt.js)

</div>

---

## 📖 Overview

This is the **backend server and RESTful API** for **Shinsei Keikaku** (新生計画 — *New Life Plan*), a gamified personal growth and productivity application. Built with Node.js, Express 5, Prisma ORM, and PostgreSQL (Neon serverless), it powers user authentication, habit tracking, quest management, achievement unlocks, financial accounting, yearly reflections, and gamified dashboard statistics.

Every endpoint is built with strict multi-tenant authorization, input sanitization, safe error handling, and robust data integrity constraints.

---

## 🛠️ Tech Stack

| Technology | Version | Role |
| :--- | :--- | :--- |
| **Node.js** | `≥ 18.x` | JavaScript runtime environment |
| **Express.js** | `^5.2.1` | Web framework for routing, middleware, and HTTP APIs |
| **Prisma ORM** | `^7.8.0` | Type-safe database client, schema migrations, and query generation |
| **@prisma/adapter-pg** | `^7.8.0` | Driver adapter connecting Prisma with PostgreSQL connection pools |
| **pg (node-postgres)** | `^8.21.0` | PostgreSQL client and connection pooling for Neon serverless DB |
| **JSON Web Token (jsonwebtoken)** | `^9.0.3` | Stateless Bearer token issuance and signature verification |
| **Bcrypt** | `^6.0.0` | Password hashing with cryptographic salts (10 rounds) |
| **dotenv** | `^17.4.2` | Environment variable management |
| **CORS** | `^2.8.6` | Cross-Origin Resource Sharing control for frontend communication |
| **Nodemon** | `^3.1.14` | Development auto-reload file watcher |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **PostgreSQL** database instance (e.g., [Neon](https://neon.tech/), local PostgreSQL, Supabase, or AWS RDS)

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Port
PORT=3000

# Client Application URL (for CORS)
CLIENT_URL=http://localhost:5173

# PostgreSQL / Neon Database Connection String
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# JWT Secret Key for token signing
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Node Environment
NODE_ENV=development
```

### 2. Installation & Database Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema or run migrations on your database
npm run prisma:migrate
```

### 3. Running the Server

```bash
# Start in development mode with nodemon auto-reload
npm run dev

# Start in production mode
npm start
```

The server will start listening at `http://localhost:3000`.

### 4. Running Integration Tests

The backend includes a comprehensive, zero-dependency end-to-end integration test suite verifying health checks, auth protection, IDOR isolation, and CRUD operations across all domains:

```bash
npm test
```

> **Test Suite:** 49 test assertions verifying health, auth, transactions, savings goals, budgets, daily logs, quests, achievements, reflections, profile, settings, and error middleware.

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── migrations/                        # Versioned SQL migration files
│   └── schema.prisma                      # Prisma schema definition (models & enums)
│
├── src/
│   ├── config/
│   │   └── prisma.js                      # Prisma client instance with @prisma/adapter-pg
│   │
│   ├── controllers/                       # Request handlers & business logic
│   │   ├── achievementController.js       # Achievement catalog, unlock & relock logic
│   │   ├── authController.js              # Register, login, and /me user identity
│   │   ├── dailyController.js             # Daily habit logs (create, update, upsert, date filter)
│   │   ├── dashboardController.js         # Aggregated stats, EXP/level, and streak sync
│   │   ├── financeController.js           # Transactions, savings goals, and budgets
│   │   ├── questController.js             # Quests CRUD, difficulty, and auto-completion
│   │   ├── reflectionController.js        # Yearly reflections and lessons
│   │   ├── settingsController.js          # User preferences and reset defaults
│   │   └── userController.js              # User profile management (safe fields)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js              # JWT Bearer verification & user attachment
│   │
│   ├── routes/                            # Express router definitions
│   │   ├── achievementRoutes.js           # /api/achievements
│   │   ├── authRoutes.js                  # /api/auth
│   │   ├── dailyRoutes.js                 # /api/daily & /api/daily-logs
│   │   ├── dashboardRoutes.js             # /api/dashboard
│   │   ├── financeRoutes.js               # /api/finance
│   │   ├── questRoutes.js                 # /api/quests
│   │   ├── reflectionRoutes.js            # /api/reflections
│   │   ├── settingsRoutes.js              # /api/settings
│   │   ├── testRoutes.js                  # /api/health & /api/db-test
│   │   └── userRoutes.js                  # /api/profile & /api/user
│   │
│   ├── services/
│   │   ├── financeServices.js             # Financial calculations helper
│   │   └── statsService.js                # EXP, level progress, and streak calculator
│   │
│   ├── utils/
│   │   └── generateToken.js               # JWT generator (30-day expiration)
│   │
│   └── server.js                          # Express entry point & centralized error handler
│
├── tests/
│   └── integration.test.js                # 49 end-to-end integration tests
│
├── .env                                   # Local environment variables (git-ignored)
├── .gitignore
├── package.json
└── prisma.config.ts
```

---

## 🗄️ Database Schema & Models

The PostgreSQL database is managed via Prisma (`prisma/schema.prisma`) with 11 relational models and 7 enums:

### Enums

- **`QuestCategory`**: `FITNESS`, `STUDY`, `DISCIPLINE`, `HEALTH`, `LEETCODE`, `PRODUCTIVITY`, `CUSTOM`
- **`QuestDifficulty`**: `EASY`, `NORMAL`, `HARD`, `EXTREME`
- **`AchievementCategory`**: `MILESTONE`, `STREAK`, `FITNESS`, `INTELLECT`, `DISCIPLINE`, `SPECIAL`
- **`AchievementRarity`**: `COMMON`, `UNCOMMON`, `RARE`, `EPIC`, `LEGENDARY`
- **`TransactionType`**: `INCOME`, `EXPENSE`
- **`TransactionCategory`**: `FOOD`, `FITNESS`, `LEARNING`, `ENTERTAINMENT`, `TRANSPORT`, `HEALTH`, `SHOPPING`, `HOUSING`, `SAVINGS`, `OTHER`
- **`Language`**: `ENGLISH`, `JAPANESE`, `HINDI`

### Core Models

| Model | Table | Description | Key Constraints & Relations |
| :--- | :--- | :--- | :--- |
| **`User`** | `User` | User account credentials and timestamps | Unique `email`, unique `username`. Cascade deletes all related records. |
| **`UserStats`** | `UserStats` | Gamification stats: EXP, level, streaks, counts | 1-to-1 with `User`. Unique `userId`. |
| **`Quest`** | `Quest` | Trackable quests with difficulty & EXP rewards | Belongs to `User`. Auto-calculates `isCompleted`. |
| **`DailyLog`** | `DailyLog` | Calendar day logs (sleep, water, study, workout, mistakes) | Unique composite `@@unique([userId, date])` for idempotent upserting. |
| **`Achievement`** | `Achievement` | Predefined global achievement catalog | Unique `title`, rarity glow tiers, EXP rewards. |
| **`UserAchievement`** | `UserAchievement` | Junction record of user-unlocked achievements | Composite unique `@@unique([userId, achievementId])`. |
| **`Transaction`** | `Transaction` | Financial records (income / expense) | Decimal precision for currency amounts, categorized. |
| **`SavingsGoal`** | `SavingsGoal` | Savings target amounts and progress | Auto-marks `completed: true` when `current >= target`. |
| **`Budget`** | `Budget` | Category monthly spending limits | Composite unique `@@unique([userId, category, month, year])`. |
| **`UserSettings`** | `UserSettings` | User UI and notification preferences | 1-to-1 with `User`. Unique `userId`. Defaults to dark mode. |
| **`Reflection`** | `Reflection` | Annual reviews, key lessons, and visions | Composite unique `@@unique([userId, year])`. |

---

## 🔌 API Endpoints Reference

All `/api/*` endpoints (except Auth register/login and Health) require the `Authorization: Bearer <jwt_token>` header.

### 1. Health & Diagnostics

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Root status message |
| `GET` | `/api/health` | Public | Service health check |
| `GET` | `/api/db-test` | Public | Sanitized database connectivity test |

### 2. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user. Returns JWT token and sanitized profile. |
| `POST` | `/api/auth/login` | Public | Authenticate user with email/username and password. |
| `GET` | `/api/auth/me` | Protected | Fetch current user session profile without password hash. |

### 3. Finance Tracker (`/api/finance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/transactions` | Protected | List user transactions with optional filters (`type`, `category`, `limit`) |
| `POST` | `/api/finance/transactions` | Protected | Create new transaction (`description`, `category`, `amount`, `type`, `date`) |
| `DELETE` | `/api/finance/transactions/:id` | Protected | Delete user transaction (enforces ownership isolation) |
| `GET` | `/api/finance/goals` | Protected | List user savings goals |
| `GET` | `/api/finance/goals/:id` | Protected | Get savings goal details by ID |
| `POST` | `/api/finance/goals` | Protected | Create savings goal (`title`, `icon`, `target`, `current`) |
| `PUT` | `/api/finance/goals/:id` | Protected | Update goal progress (auto-marks completed if target met) |
| `DELETE` | `/api/finance/goals/:id` | Protected | Delete savings goal |
| `GET` | `/api/finance/budgets` | Protected | List budgets with optional `?month=M` and `?year=YYYY` filters |
| `GET` | `/api/finance/budgets/:id` | Protected | Get single budget by ID |
| `POST` | `/api/finance/budgets` | Protected | Create monthly category budget (prevents duplicate month/category) |
| `PUT` | `/api/finance/budgets/:id` | Protected | Update budget amount |
| `DELETE` | `/api/finance/budgets/:id` | Protected | Delete budget |

### 4. Daily Habit Tracking (`/api/daily` & `/api/daily-logs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/daily` | Protected | List user daily logs (optional `?startDate`, `?endDate`, `?limit`) |
| `GET` | `/api/daily/date/:date` | Protected | Retrieve specific daily log by ISO date (`YYYY-MM-DD`) |
| `GET` | `/api/daily/:id` | Protected | Retrieve daily log by ID |
| `POST` | `/api/daily` | Protected | Create or idempotently upsert daily log for date |
| `PUT` | `/api/daily/:id` | Protected | Update daily log entries (sleep, workout, study, water, mistakes) |
| `DELETE` | `/api/daily/:id` | Protected | Delete daily log |

### 5. Quests (`/api/quests`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quests` | Protected | List user quests (filters: `?category`, `?difficulty`, `?status`) |
| `GET` | `/api/quests/:id` | Protected | Retrieve quest by ID |
| `POST` | `/api/quests` | Protected | Create custom quest with difficulty and EXP reward |
| `PUT` | `/api/quests/:id` | Protected | Update quest progress / toggle completion |
| `DELETE` | `/api/quests/:id` | Protected | Delete quest |

### 6. Achievements (`/api/achievements`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/achievements` | Protected | List full achievement catalog with authenticated user unlock status |
| `GET` | `/api/achievements/unlocked` | Protected | List only unlocked achievements for current user |
| `GET` | `/api/achievements/:id` | Protected | Get achievement by ID |
| `POST` | `/api/achievements/:id/unlock` | Protected | Unlock achievement for user (prevents duplicate unlocks) |
| `DELETE` | `/api/achievements/:id/unlock` | Protected | Revoke / relock achievement |

### 7. Reflections (`/api/reflections`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reflections` | Protected | List reflections (optional `?year=YYYY`, `?order=asc\|desc`) |
| `GET` | `/api/reflections/year/:year` | Protected | Retrieve reflection for specific year |
| `POST` | `/api/reflections` | Protected | Create or upsert yearly reflection |
| `PUT` | `/api/reflections/year/:year` | Protected | Update yearly reflection |
| `DELETE` | `/api/reflections/year/:year` | Protected | Delete yearly reflection |

### 8. User Profile & Settings

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Protected | Get sanitized profile details |
| `PUT` | `/api/profile` | Protected | Update allowed profile fields (username, email) |
| `GET` | `/api/settings` | Protected | Get user preferences (auto-creates default settings if missing) |
| `PUT` | `/api/settings` | Protected | Update UI theme, notifications, or quest preferences |
| `POST` | `/api/settings/reset` | Protected | Reset preferences back to defaults |

### 9. Dashboard (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Protected | Aggregate user stats, level progress, streaks, active quests, and finance summary |
| `POST` | `/api/dashboard/sync-stats` | Protected | Idempotently recalculate and synchronize user EXP, level, and streak |

---

## 🛡️ Security & Architecture Best Practices

- **Strict Tenant & IDOR Protection**: All reads, updates, and deletes scope Prisma queries to `where: { id, userId: req.user.id }`. Attempts by users to read or mutate another tenant's records return `403 Forbidden` or `404 Not Found`.
- **Zero-Trust Password Storage**: Passwords hashed with `bcrypt` (10 salt rounds). Password hashes are systematically stripped from Prisma results using `{ select: ... }` projections or explicit object sanitization.
- **Strict Input Validation**: Route controllers sanitize and validate IDs, numerical bounds, enum values, and calendar dates before sending queries to Prisma.
- **Centralized Error Handling**: Standardized JSON error response format (`{ success: false, message: "..." }`) preventing server crash or internal stack leak.
- **Rate-Limiting & Payload Bounds**: Body parsing constrained to `1mb` to prevent memory exhaustion attacks.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **dev** | `npm run dev` | Run backend in development mode with `nodemon` |
| **start** | `npm start` | Run backend in production mode with Node.js |
| **test** | `npm test` | Run the complete 49-assertion integration test suite |
| **prisma:generate** | `npm run prisma:generate` | Generate the Prisma Client from schema |
| **prisma:migrate** | `npm run prisma:migrate` | Apply schema migrations in development |

---

<div align="center">

*Built with Node.js, Express, Prisma & PostgreSQL · Architected for reliability.*

**新生計画 · Shinsei Keikaku Backend**

</div>
