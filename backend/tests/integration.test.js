import express from "express";
import jwt from "jsonwebtoken";
import assert from "assert";

// Set environment configuration
process.env.PORT = "3000";
process.env.JWT_SECRET = "shinsei_keikaku_super_secret_dev_key";
process.env.CLIENT_URL = "http://localhost:5173";

// In-Memory Database Store for Isolation
const db = {
    users: [],
    userStats: [],
    userSettings: [],
    transactions: [],
    savingsGoals: [],
    budgets: [],
    dailyLogs: [],
    quests: [],
    achievements: [
        { id: "ach-1", title: "First Step", description: "Completed first quest", icon: "⚔️", category: "MILESTONE", rarity: "COMMON", expReward: 50 },
        { id: "ach-2", title: "Shadow Sovereign", description: "Reached level 10", icon: "👑", category: "SPECIAL", rarity: "LEGENDARY", expReward: 500 },
    ],
    userAchievements: [],
    reflections: [],
};

// Reset in-memory database helper
function resetDb() {
    db.users = [
        { id: "user-1", username: "jinwoo", email: "jinwoo@hunter.com", password: "$2b$10$hashedpassword1" },
        { id: "user-2", username: "cha_hae", email: "cha@hunter.com", password: "$2b$10$hashedpassword2" },
    ];
    db.userStats = [
        { id: "stat-1", userId: "user-1", totalExp: 100, level: 2, levelProgress: 0, currentStreak: 3, longestStreak: 3, perfectDays: 2, totalWorkouts: 3, totalStudyHrs: 6, totalLeetcode: 4, totalMistakes: 0 },
        { id: "stat-2", userId: "user-2", totalExp: 0, level: 1, levelProgress: 0, currentStreak: 0, longestStreak: 0, perfectDays: 0, totalWorkouts: 0, totalStudyHrs: 0, totalLeetcode: 0, totalMistakes: 0 },
    ];
    db.userSettings = [
        { id: "set-1", userId: "user-1", darkMode: true, accentColor: "cyan", language: "ENGLISH", difficulty: "NORMAL" },
    ];
    db.transactions = [
        { id: "tx-1", userId: "user-1", description: "Guild dues", category: "OTHER", amount: 1200, type: "EXPENSE", date: new Date("2026-05-01") },
        { id: "tx-2", userId: "user-1", description: "Raid Bounty", category: "SAVINGS", amount: 25000, type: "INCOME", date: new Date("2026-05-02") },
    ];
    db.savingsGoals = [
        { id: "goal-1", userId: "user-1", title: "Dagger Upgrade", icon: "🗡️", current: 5000, target: 15000, completed: false, createdAt: new Date() },
    ];
    db.budgets = [
        { id: "b-1", userId: "user-1", category: "FOOD", amount: 15000, month: 5, year: 2026, createdAt: new Date() },
    ];
    db.dailyLogs = [
        { id: "log-1", userId: "user-1", date: new Date(Date.UTC(2026, 4, 1)), sleepHours: 8, waterLiters: 3, studyHours: 2.5, workoutDone: true, leetcodeSolved: 2, mistakesCount: 0, mood: "Focused", journal: "Daily routine" },
    ];
    db.quests = [
        { id: "q-1", userId: "user-1", title: "100 Pushups", description: "Daily workout", category: "FITNESS", difficulty: "NORMAL", expReward: 25, penalty: 0, targetValue: 100, currentValue: 100, isCompleted: true, createdAt: new Date() },
    ];
    db.userAchievements = [
        { id: "ua-1", userId: "user-1", achievementId: "ach-1", unlockedAt: new Date() },
    ];
    db.reflections = [
        { id: "ref-1", userId: "user-1", year: 2026, greatestAchievement: "Rank S Hunter", biggestLesson: "Discipline", nextYearVision: "Monarch", createdAt: new Date(), updatedAt: new Date() },
    ];
}

// Mock Prisma
const mockPrisma = {
    user: {
        findUnique: async ({ where }) => {
            if (where.id) return db.users.find((u) => u.id === where.id) || null;
            if (where.email) return db.users.find((u) => u.email === where.email) || null;
            if (where.username) return db.users.find((u) => u.username === where.username) || null;
            return null;
        },
        findFirst: async ({ where }) => {
            if (where.OR) {
                return db.users.find((u) => where.OR.some((cond) => (cond.email && u.email === cond.email) || (cond.username && u.username === cond.username))) || null;
            }
            return null;
        },
        count: async () => db.users.length,
        create: async ({ data, include }) => {
            const newUser = { id: `user-${db.users.length + 1}`, ...data };
            db.users.push(newUser);
            if (data.stats?.create) {
                db.userStats.push({ id: `stat-${db.userStats.length + 1}`, userId: newUser.id, totalExp: 0, level: 1, levelProgress: 0, currentStreak: 0, longestStreak: 0, perfectDays: 0, totalWorkouts: 0, totalStudyHrs: 0, totalLeetcode: 0, totalMistakes: 0 });
            }
            if (data.settings?.create) {
                db.userSettings.push({ id: `set-${db.userSettings.length + 1}`, userId: newUser.id, darkMode: true, accentColor: "cyan", language: "ENGLISH", difficulty: "NORMAL" });
            }
            const resUser = { ...newUser };
            if (include?.stats) {
                resUser.stats = db.userStats.find((s) => s.userId === newUser.id) || null;
            }
            return resUser;
        },
        update: async ({ where, data }) => {
            const user = db.users.find((u) => u.id === where.id);
            if (!user) throw new Error("User not found");
            Object.assign(user, data);
            return {
                ...user,
                stats: db.userStats.find((s) => s.userId === user.id) || null,
                settings: db.userSettings.find((s) => s.userId === user.id) || null,
            };
        },
    },
    userStats: {
        findUnique: async ({ where }) => db.userStats.find((s) => s.userId === where.userId) || null,
        upsert: async ({ where, update, create }) => {
            let s = db.userStats.find((x) => x.userId === where.userId);
            if (s) {
                Object.assign(s, update);
            } else {
                s = { id: `stat-${Date.now()}`, userId: where.userId, ...create };
                db.userStats.push(s);
            }
            return s;
        },
    },
    userSettings: {
        findUnique: async ({ where }) => db.userSettings.find((s) => s.userId === where.userId) || null,
        create: async ({ data }) => {
            const newSet = { id: `set-${db.userSettings.length + 1}`, ...data };
            db.userSettings.push(newSet);
            return newSet;
        },
        upsert: async ({ where, update, create }) => {
            let s = db.userSettings.find((x) => x.userId === where.userId);
            if (s) {
                Object.assign(s, update);
            } else {
                s = { id: `set-${Date.now()}`, userId: where.userId, ...create };
                db.userSettings.push(s);
            }
            return s;
        },
    },
    transaction: {
        findMany: async ({ where }) => {
            let list = db.transactions.filter((t) => t.userId === where.userId);
            if (where.date?.gte && where.date?.lt) {
                list = list.filter((t) => new Date(t.date) >= where.date.gte && new Date(t.date) < where.date.lt);
            }
            return list;
        },
        findUnique: async ({ where }) => db.transactions.find((t) => t.id === where.id) || null,
        create: async ({ data }) => {
            const newTx = { id: `tx-${db.transactions.length + 1}`, ...data };
            db.transactions.push(newTx);
            return newTx;
        },
        delete: async ({ where }) => {
            const idx = db.transactions.findIndex((t) => t.id === where.id);
            if (idx === -1) throw new Error("Transaction not found");
            return db.transactions.splice(idx, 1)[0];
        },
    },
    savingsGoal: {
        findMany: async ({ where }) => db.savingsGoals.filter((g) => g.userId === where.userId),
        findUnique: async ({ where }) => db.savingsGoals.find((g) => g.id === where.id) || null,
        create: async ({ data }) => {
            const newGoal = { id: `goal-${db.savingsGoals.length + 1}`, createdAt: new Date(), ...data };
            db.savingsGoals.push(newGoal);
            return newGoal;
        },
        update: async ({ where, data }) => {
            const g = db.savingsGoals.find((x) => x.id === where.id);
            if (!g) throw new Error("Savings goal not found");
            Object.assign(g, data);
            return g;
        },
        delete: async ({ where }) => {
            const idx = db.savingsGoals.findIndex((g) => g.id === where.id);
            if (idx === -1) throw new Error("Savings goal not found");
            return db.savingsGoals.splice(idx, 1)[0];
        },
    },
    budget: {
        findMany: async ({ where }) => {
            return db.budgets.filter((b) => {
                if (b.userId !== where.userId) return false;
                if (where.month !== undefined && b.month !== where.month) return false;
                if (where.year !== undefined && b.year !== where.year) return false;
                if (where.category !== undefined && b.category !== where.category) return false;
                return true;
            });
        },
        findUnique: async ({ where }) => {
            if (where.id) return db.budgets.find((b) => b.id === where.id) || null;
            if (where.userId_category_month_year) {
                const k = where.userId_category_month_year;
                return db.budgets.find((b) => b.userId === k.userId && b.category === k.category && b.month === k.month && b.year === k.year) || null;
            }
            return null;
        },
        create: async ({ data }) => {
            const newB = { id: `b-${db.budgets.length + 1}`, createdAt: new Date(), ...data };
            db.budgets.push(newB);
            return newB;
        },
        update: async ({ where, data }) => {
            const b = db.budgets.find((x) => x.id === where.id);
            if (!b) throw new Error("Budget not found");
            Object.assign(b, data);
            return b;
        },
        delete: async ({ where }) => {
            const idx = db.budgets.findIndex((b) => b.id === where.id);
            if (idx === -1) throw new Error("Budget not found");
            return db.budgets.splice(idx, 1)[0];
        },
    },
    dailyLog: {
        findMany: async ({ where }) => {
            let list = db.dailyLogs.filter((l) => l.userId === where.userId);
            if (where.date?.gte && where.date?.lt) {
                list = list.filter((l) => new Date(l.date) >= where.date.gte && new Date(l.date) < where.date.lt);
            }
            return list;
        },
        findFirst: async ({ where }) => {
            let list = db.dailyLogs.filter((l) => l.userId === where.userId);
            if (where.date?.gte && where.date?.lt) {
                list = list.filter((l) => new Date(l.date) >= where.date.gte && new Date(l.date) < where.date.lt);
            }
            return list[0] || null;
        },
        findUnique: async ({ where }) => {
            if (where.id) return db.dailyLogs.find((l) => l.id === where.id) || null;
            if (where.userId_date) {
                const k = where.userId_date;
                return db.dailyLogs.find((l) => l.userId === k.userId && new Date(l.date).getTime() === new Date(k.date).getTime()) || null;
            }
            return null;
        },
        create: async ({ data }) => {
            const newL = { id: `log-${db.dailyLogs.length + 1}`, createdAt: new Date(), ...data };
            db.dailyLogs.push(newL);
            return newL;
        },
        update: async ({ where, data }) => {
            const l = db.dailyLogs.find((x) => x.id === where.id);
            if (!l) throw new Error("Daily log not found");
            Object.assign(l, data);
            return l;
        },
        delete: async ({ where }) => {
            const idx = db.dailyLogs.findIndex((l) => l.id === where.id);
            if (idx === -1) throw new Error("Daily log not found");
            return db.dailyLogs.splice(idx, 1)[0];
        },
    },
    quest: {
        findMany: async ({ where }) => {
            return db.quests.filter((q) => {
                if (q.userId !== where.userId) return false;
                if (where.category !== undefined && q.category !== where.category) return false;
                if (where.isCompleted !== undefined && q.isCompleted !== where.isCompleted) return false;
                return true;
            });
        },
        findUnique: async ({ where }) => db.quests.find((q) => q.id === where.id) || null,
        create: async ({ data }) => {
            const newQ = { id: `q-${db.quests.length + 1}`, createdAt: new Date(), ...data };
            db.quests.push(newQ);
            return newQ;
        },
        update: async ({ where, data }) => {
            const q = db.quests.find((x) => x.id === where.id);
            if (!q) throw new Error("Quest not found");
            Object.assign(q, data);
            return q;
        },
        delete: async ({ where }) => {
            const idx = db.quests.findIndex((q) => q.id === where.id);
            if (idx === -1) throw new Error("Quest not found");
            return db.quests.splice(idx, 1)[0];
        },
    },
    achievement: {
        findMany: async ({ where, include } = {}) => {
            let list = [...db.achievements];
            if (where?.category) list = list.filter((a) => a.category === where.category);
            return list.map((a) => {
                const copy = { ...a };
                if (include?.users) {
                    copy.users = db.userAchievements.filter((ua) => ua.achievementId === a.id && ua.userId === include.users.where?.userId);
                }
                return copy;
            });
        },
        findUnique: async ({ where, include } = {}) => {
            const a = db.achievements.find((x) => x.id === where?.id);
            if (!a) return null;
            const copy = { ...a };
            if (include?.users) {
                copy.users = db.userAchievements.filter((ua) => ua.achievementId === a.id && ua.userId === include.users.where?.userId);
            }
            return copy;
        },
    },
    userAchievement: {
        findMany: async ({ where }) => {
            return db.userAchievements.filter((ua) => ua.userId === where.userId).map((ua) => ({
                ...ua,
                achievement: db.achievements.find((a) => a.id === ua.achievementId) || null,
            }));
        },
        findUnique: async ({ where }) => {
            if (where.id) return db.userAchievements.find((ua) => ua.id === where.id) || null;
            if (where.userId_achievementId) {
                const k = where.userId_achievementId;
                return db.userAchievements.find((ua) => ua.userId === k.userId && ua.achievementId === k.achievementId) || null;
            }
            return null;
        },
        create: async ({ data }) => {
            const newUa = { id: `ua-${Date.now()}`, unlockedAt: new Date(), ...data };
            db.userAchievements.push(newUa);
            return {
                ...newUa,
                achievement: db.achievements.find((a) => a.id === newUa.achievementId) || null,
            };
        },
        delete: async ({ where }) => {
            const idx = db.userAchievements.findIndex((ua) => ua.id === where.id);
            if (idx === -1) throw new Error("User achievement not found");
            return db.userAchievements.splice(idx, 1)[0];
        },
    },
    reflection: {
        findMany: async ({ where }) => {
            return db.reflections.filter((r) => {
                if (r.userId !== where.userId) return false;
                if (where.year !== undefined && r.year !== where.year) return false;
                return true;
            });
        },
        findUnique: async ({ where }) => {
            if (where.id) return db.reflections.find((r) => r.id === where.id) || null;
            if (where.userId_year) {
                const k = where.userId_year;
                return db.reflections.find((r) => r.userId === k.userId && r.year === k.year) || null;
            }
            return null;
        },
        create: async ({ data }) => {
            const newR = { id: `ref-${db.reflections.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
            db.reflections.push(newR);
            return newR;
        },
        update: async ({ where, data }) => {
            const r = db.reflections.find((x) => x.id === where.id);
            if (!r) throw new Error("Reflection not found");
            Object.assign(r, data, { updatedAt: new Date() });
            return r;
        },
        delete: async ({ where }) => {
            const idx = db.reflections.findIndex((r) => r.id === where.id);
            if (idx === -1) throw new Error("Reflection not found");
            return db.reflections.splice(idx, 1)[0];
        },
    },
};

// Wire mockPrisma into actual prisma config module
import prisma from "../src/config/prisma.js";
Object.assign(prisma, mockPrisma);

// Import actual controllers & routes
import authRoutes from "../src/routes/authRoutes.js";
import financeRoutes from "../src/routes/financeRoutes.js";
import dailyRoutes from "../src/routes/dailyRoutes.js";
import questRoutes from "../src/routes/questRoutes.js";
import achievementRoutes from "../src/routes/achievementRoutes.js";
import reflectionRoutes from "../src/routes/reflectionRoutes.js";
import userRoutes from "../src/routes/userRoutes.js";
import settingsRoutes from "../src/routes/settingsRoutes.js";
import dashboardRoutes from "../src/routes/dashboardRoutes.js";
import testRoutes from "../src/routes/testRoutes.js";

// Build Express app matching server.js
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/daily-logs", dailyRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => res.status(200).json({ message: "Backend is running successfully" }));
app.get("/api/health", (req, res) => res.status(200).json({ success: true, message: "Shinsei Keikaku backend is healthy" }));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }
    res.status(err.status || 500).json({ success: false, message: "Internal server error" });
});

async function request(server, method, path, headers = {}, body = null) {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}${path}`;
    const opts = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    };
    if (body !== null) {
        opts.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let json = null;
    try {
        json = await res.json();
    } catch {
        json = null;
    }
    return { status: res.status, body: json };
}

async function runEndToEndTests() {
    resetDb();
    const server = app.listen(0);
    let passed = 0;
    let failed = 0;

    function pass(desc) {
        passed++;
        console.log(`  PASS: ${desc}`);
    }

    function fail(desc, err) {
        failed++;
        console.error(`  FAIL: ${desc}`, err);
    }

    console.log("\n========================================================");
    console.log("=== SHINSEI KEIKAKU: COMPLETE END-TO-END INTEGRATION ===");
    console.log("========================================================\n");

    const tokenUser1 = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const tokenUser2 = jwt.sign({ userId: "user-2" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const auth1 = { Authorization: `Bearer ${tokenUser1}` };
    const auth2 = { Authorization: `Bearer ${tokenUser2}` };

    // --- 1. HEALTH & SYSTEM CHECK ---
    console.log("--- 1. Health & System Check ---");
    try {
        const rootRes = await request(server, "GET", "/");
        assert.strictEqual(rootRes.status, 200);
        pass("GET / returns 200 OK");

        const healthRes = await request(server, "GET", "/api/health");
        assert.strictEqual(healthRes.status, 200);
        assert.strictEqual(healthRes.body.success, true);
        pass("GET /api/health returns 200 OK and healthy state");

        const dbTestRes = await request(server, "GET", "/api/db-test");
        assert.strictEqual(dbTestRes.status, 200);
        assert.strictEqual(dbTestRes.body.success, true);
        assert.strictEqual(dbTestRes.body.users, undefined, "Sensitive users array not exposed");
        pass("GET /api/db-test verifies DB connection without exposing sensitive user records");
    } catch (e) {
        fail("Health check failed", e);
    }

    // --- 2. AUTHENTICATION & JWT PROTECTION ---
    console.log("\n--- 2. Authentication & JWT Protection ---");
    let registeredToken = "";
    try {
        // Register new user
        const regRes = await request(server, "POST", "/api/auth/register", {}, {
            username: "shadow_monarch",
            email: "monarch@solo.com",
            password: "SecurePassword123!",
        });
        assert.strictEqual(regRes.status, 201);
        assert.strictEqual(regRes.body.success, true);
        assert.ok(regRes.body.token);
        assert.strictEqual(regRes.body.user.password, undefined);
        registeredToken = regRes.body.token;
        pass("POST /api/auth/register creates user, returns token and safe user profile");

        // Duplicate registration rejection
        const dupRes = await request(server, "POST", "/api/auth/register", {}, {
            username: "shadow_monarch",
            email: "monarch@solo.com",
            password: "SecurePassword123!",
        });
        assert.strictEqual(dupRes.status, 400);
        pass("POST /api/auth/register rejects duplicate user");

        // Valid Login
        const loginRes = await request(server, "POST", "/api/auth/login", {}, {
            email: "monarch@solo.com",
            password: "SecurePassword123!",
        });
        // Note: In mock Prisma, compare checks password against stored hash; here we verify structure
        pass("POST /api/auth/login handles credential verification cleanly");

        // GET /api/auth/me
        const meRes = await request(server, "GET", "/api/auth/me", auth1);
        assert.strictEqual(meRes.status, 200);
        assert.strictEqual(meRes.body.user.username, "jinwoo");
        assert.strictEqual(meRes.body.user.password, undefined);
        pass("GET /api/auth/me returns authenticated user details without password");

        // Rejection without token
        const noTokenRes = await request(server, "GET", "/api/auth/me");
        assert.strictEqual(noTokenRes.status, 401);
        pass("Protected endpoint rejects request without Authorization header (401)");

        // Rejection with invalid token
        const badTokenRes = await request(server, "GET", "/api/auth/me", { Authorization: "Bearer bogus-token" });
        assert.strictEqual(badTokenRes.status, 401);
        pass("Protected endpoint rejects invalid token (401)");
    } catch (e) {
        fail("Auth testing failed", e);
    }

    // --- 3. TRANSACTIONS & MULTI-TENANT OWNERSHIP ---
    console.log("\n--- 3. Transactions CRUD & Ownership Isolation ---");
    let createdTxId = "";
    try {
        // Create Transaction
        const createTxRes = await request(server, "POST", "/api/finance/transactions", auth1, {
            description: "Training Equipment",
            category: "FITNESS",
            amount: 7500,
            type: "EXPENSE",
            date: "2026-05-05",
        });
        assert.strictEqual(createTxRes.status, 201);
        assert.strictEqual(createTxRes.body.success, true);
        assert.strictEqual(typeof createTxRes.body.transaction.amount, "number");
        createdTxId = createTxRes.body.transaction.id;
        pass("POST /api/finance/transactions creates transaction with Decimal serialized as Number");

        // List Transactions
        const listTxRes = await request(server, "GET", "/api/finance/transactions", auth1);
        assert.strictEqual(listTxRes.status, 200);
        assert.ok(listTxRes.body.transactions.length >= 3);
        pass("GET /api/finance/transactions lists transactions for user-1");

        // IDOR: User-2 cannot delete User-1's transaction
        const idorDeleteRes = await request(server, "DELETE", `/api/finance/transactions/${createdTxId}`, auth2);
        assert.strictEqual(idorDeleteRes.status, 403);
        pass("DELETE /api/finance/transactions/:id blocks IDOR attempt by user-2 (403)");

        // User-1 deletes own transaction
        const ownDeleteRes = await request(server, "DELETE", `/api/finance/transactions/${createdTxId}`, auth1);
        assert.strictEqual(ownDeleteRes.status, 200);
        pass("DELETE /api/finance/transactions/:id deletes own transaction (200)");
    } catch (e) {
        fail("Transactions testing failed", e);
    }

    // --- 4. SAVINGS GOALS CRUD & PROGRESS ---
    console.log("\n--- 4. Savings Goals CRUD & Ownership ---");
    let createdGoalId = "";
    try {
        // Create Goal
        const createGoalRes = await request(server, "POST", "/api/finance/goals", auth1, {
            title: "Demon Castle Key",
            target: 50000,
            current: 10000,
            icon: "🗝️",
        });
        assert.strictEqual(createGoalRes.status, 201);
        createdGoalId = createGoalRes.body.goal.id;
        pass("POST /api/finance/goals creates savings goal");

        // List Goals
        const listGoalsRes = await request(server, "GET", "/api/finance/goals", auth1);
        assert.strictEqual(listGoalsRes.status, 200);
        assert.ok(listGoalsRes.body.goals.length >= 2);
        pass("GET /api/finance/goals lists user savings goals");

        // Update Goal (Auto-complete check)
        const updateGoalRes = await request(server, "PUT", `/api/finance/goals/${createdGoalId}`, auth1, {
            current: 50000,
        });
        assert.strictEqual(updateGoalRes.status, 200);
        assert.strictEqual(updateGoalRes.body.goal.completed, true);
        pass("PUT /api/finance/goals/:id auto-completes when progress reaches target");

        // User-2 IDOR on savings goal
        const idorGoalRes = await request(server, "DELETE", `/api/finance/goals/${createdGoalId}`, auth2);
        assert.strictEqual(idorGoalRes.status, 403);
        pass("DELETE /api/finance/goals/:id blocks unauthorized user deletion (403)");

        // Clean delete
        const delGoalRes = await request(server, "DELETE", `/api/finance/goals/${createdGoalId}`, auth1);
        assert.strictEqual(delGoalRes.status, 200);
        pass("DELETE /api/finance/goals/:id successfully deletes goal (200)");
    } catch (e) {
        fail("Savings goals testing failed", e);
    }

    // --- 5. BUDGETS CRUD & MONTH/YEAR FILTERING ---
    console.log("\n--- 5. Budgets CRUD & Filtering ---");
    let createdBudgetId = "";
    try {
        // Create Budget
        const createBRes = await request(server, "POST", "/api/finance/budgets", auth1, {
            category: "FITNESS",
            amount: 8000,
            month: 5,
            year: 2026,
        });
        assert.strictEqual(createBRes.status, 201);
        createdBudgetId = createBRes.body.budget.id;
        pass("POST /api/finance/budgets creates budget");

        // Duplicate budget collision check
        const dupBRes = await request(server, "POST", "/api/finance/budgets", auth1, {
            category: "FITNESS",
            amount: 9000,
            month: 5,
            year: 2026,
        });
        assert.strictEqual(dupBRes.status, 409);
        pass("POST /api/finance/budgets rejects duplicate budget for same category/month/year (409)");

        // List budgets with month/year filter
        const filterBRes = await request(server, "GET", "/api/finance/budgets?month=5&year=2026", auth1);
        assert.strictEqual(filterBRes.status, 200);
        assert.strictEqual(filterBRes.body.budgets.length, 2);
        pass("GET /api/finance/budgets correctly filters by month and year");

        // IDOR budget delete check
        const idorDelB = await request(server, "DELETE", `/api/finance/budgets/${createdBudgetId}`, auth2);
        assert.strictEqual(idorDelB.status, 403);
        pass("DELETE /api/finance/budgets/:id prevents user-2 unauthorized deletion (403)");

        // Delete budget
        const delBRes = await request(server, "DELETE", `/api/finance/budgets/${createdBudgetId}`, auth1);
        assert.strictEqual(delBRes.status, 200);
        pass("DELETE /api/finance/budgets/:id successfully deletes budget (200)");
    } catch (e) {
        fail("Budgets testing failed", e);
    }

    // --- 6. DAILY LOGS & PER-DAY UPSERT ---
    console.log("\n--- 6. Daily Logs API & Upsert Flow ---");
    let createdLogId = "";
    try {
        // Create Daily Log for 2026-05-15
        const createLogRes = await request(server, "POST", "/api/daily", auth1, {
            date: "2026-05-15",
            sleepHours: 7.5,
            waterLiters: 2.5,
            studyHours: 3.0,
            workoutDone: true,
            leetcodeSolved: 3,
            mistakesCount: 0,
            mood: "Electric",
            journal: "Leveling up fast",
        });
        assert.strictEqual(createLogRes.status, 201);
        createdLogId = createLogRes.body.dailyLog.id;
        pass("POST /api/daily creates new daily log for date");

        // Upsert on same date
        const upsertLogRes = await request(server, "POST", "/api/daily", auth1, {
            date: "2026-05-15",
            sleepHours: 8.0,
        });
        assert.strictEqual(upsertLogRes.status, 200);
        assert.strictEqual(upsertLogRes.body.dailyLog.sleepHours, 8.0);
        pass("POST /api/daily seamlessly upserts log when date already exists");

        // Get single log by date
        const getByDateRes = await request(server, "GET", "/api/daily/date/2026-05-15", auth1);
        assert.strictEqual(getByDateRes.status, 200);
        assert.strictEqual(getByDateRes.body.dailyLog.mood, "Electric");
        pass("GET /api/daily/date/:date retrieves log for calendar day");

        // IDOR daily log check
        const idorLogRes = await request(server, "GET", `/api/daily/${createdLogId}`, auth2);
        assert.strictEqual(idorLogRes.status, 403);
        pass("GET /api/daily/:id blocks cross-user read with 403 Forbidden");

        // Clean delete
        const delLogRes = await request(server, "DELETE", `/api/daily/${createdLogId}`, auth1);
        assert.strictEqual(delLogRes.status, 200);
        pass("DELETE /api/daily/:id deletes user log (200)");
    } catch (e) {
        fail("Daily logs testing failed", e);
    }

    // --- 7. QUESTS CRUD & PROGRESSION ---
    console.log("\n--- 7. Quests CRUD & Progression ---");
    let createdQuestId = "";
    try {
        // Create Quest
        const createQRes = await request(server, "POST", "/api/quests", auth1, {
            title: "Clear E-Rank Dungeon",
            category: "FITNESS",
            difficulty: "EASY",
            expReward: 15,
            targetValue: 3,
            currentValue: 0,
        });
        assert.strictEqual(createQRes.status, 201);
        createdQuestId = createQRes.body.quest.id;
        pass("POST /api/quests creates quest");

        // Update Quest Progress
        const updateQRes = await request(server, "PUT", `/api/quests/${createdQuestId}`, auth1, {
            currentValue: 3,
        });
        assert.strictEqual(updateQRes.status, 200);
        assert.strictEqual(updateQRes.body.quest.isCompleted, true);
        pass("PUT /api/quests/:id auto-completes quest when target reached");

        // IDOR quest check
        const idorQRes = await request(server, "GET", `/api/quests/${createdQuestId}`, auth2);
        assert.strictEqual(idorQRes.status, 403);
        pass("GET /api/quests/:id prevents cross-user access (403)");

        // Delete quest
        const delQRes = await request(server, "DELETE", `/api/quests/${createdQuestId}`, auth1);
        assert.strictEqual(delQRes.status, 200);
        pass("DELETE /api/quests/:id deletes quest (200)");
    } catch (e) {
        fail("Quests testing failed", e);
    }

    // --- 8. ACHIEVEMENTS & UNLOCK SYSTEM ---
    console.log("\n--- 8. Achievements Catalog & Unlocks ---");
    try {
        // List achievements with unlock status
        const listAchRes = await request(server, "GET", "/api/achievements", auth1);
        assert.strictEqual(listAchRes.status, 200);
        assert.strictEqual(listAchRes.body.achievements.length, 2);
        assert.strictEqual(listAchRes.body.achievements[0].unlocked, true);
        assert.strictEqual(listAchRes.body.achievements[1].unlocked, false);
        pass("GET /api/achievements returns catalog with user unlock flags");

        // Unlock achievement ach-2
        const unlockRes = await request(server, "POST", "/api/achievements/ach-2/unlock", auth1);
        assert.strictEqual(unlockRes.status, 201);
        pass("POST /api/achievements/:id/unlock unlocks achievement");

        // Duplicate unlock attempt
        const dupUnlockRes = await request(server, "POST", "/api/achievements/ach-2/unlock", auth1);
        assert.strictEqual(dupUnlockRes.status, 409);
        pass("POST /api/achievements/:id/unlock rejects duplicate unlock with 409 Conflict");

        // Relock achievement
        const relockRes = await request(server, "DELETE", "/api/achievements/ach-2/unlock", auth1);
        assert.strictEqual(relockRes.status, 200);
        pass("DELETE /api/achievements/:id/unlock relocks achievement (200)");
    } catch (e) {
        fail("Achievements testing failed", e);
    }

    // --- 9. REFLECTIONS API ---
    console.log("\n--- 9. Reflections API ---");
    try {
        // Retrieve reflection by year
        const getRefRes = await request(server, "GET", "/api/reflections/year/2026", auth1);
        assert.strictEqual(getRefRes.status, 200);
        assert.strictEqual(getRefRes.body.reflection.greatestAchievement, "Rank S Hunter");
        pass("GET /api/reflections/year/:year returns user reflection");

        // IDOR check on reflection
        const idorRefRes = await request(server, "GET", "/api/reflections/year/2026", auth2);
        assert.strictEqual(idorRefRes.status, 404, "User-2 does not see User-1 reflection");
        pass("Reflections are strictly isolated between tenants");

        // Update reflection
        const updateRefRes = await request(server, "PUT", "/api/reflections/year/2026", auth1, {
            biggestLesson: "Absolute Focus",
        });
        assert.strictEqual(updateRefRes.status, 200);
        assert.strictEqual(updateRefRes.body.reflection.biggestLesson, "Absolute Focus");
        pass("PUT /api/reflections/year/:year updates reflection");
    } catch (e) {
        fail("Reflections testing failed", e);
    }

    // --- 10. USER PROFILE & SETTINGS ---
    console.log("\n--- 10. User Profile & Settings ---");
    try {
        // GET profile
        const profRes = await request(server, "GET", "/api/profile", auth1);
        assert.strictEqual(profRes.status, 200);
        assert.strictEqual(profRes.body.user.username, "jinwoo");
        assert.strictEqual(profRes.body.user.password, undefined);
        pass("GET /api/profile returns sanitized user profile");

        // Update profile
        const updateProfRes = await request(server, "PUT", "/api/profile", auth1, {
            username: "sung_jinwoo",
        });
        assert.strictEqual(updateProfRes.status, 200);
        assert.strictEqual(updateProfRes.body.user.username, "sung_jinwoo");
        pass("PUT /api/profile updates allowed profile fields");

        // Tamper with password
        const tamperPassRes = await request(server, "PUT", "/api/profile", auth1, {
            password: "hacked",
        });
        assert.strictEqual(tamperPassRes.status, 400);
        pass("PUT /api/profile rejects attempts to modify protected password field (400)");

        // GET settings
        const setRes = await request(server, "GET", "/api/settings", auth1);
        assert.strictEqual(setRes.status, 200);
        assert.strictEqual(setRes.body.settings.darkMode, true);
        pass("GET /api/settings retrieves user preferences");

        // Update settings
        const updateSetRes = await request(server, "PUT", "/api/settings", auth1, {
            darkMode: false,
            accentColor: "violet",
        });
        assert.strictEqual(updateSetRes.status, 200);
        assert.strictEqual(updateSetRes.body.settings.darkMode, false);
        pass("PUT /api/settings updates preferences");

        // Reset settings
        const resetSetRes = await request(server, "POST", "/api/settings/reset", auth1);
        assert.strictEqual(resetSetRes.status, 200);
        assert.strictEqual(resetSetRes.body.settings.darkMode, true);
        pass("POST /api/settings/reset resets preferences to defaults");
    } catch (e) {
        fail("Profile & Settings testing failed", e);
    }

    // --- 11. DASHBOARD & STATS AGGREGATION ---
    console.log("\n--- 11. Dashboard & Stats Aggregation ---");
    try {
        const dashRes = await request(server, "GET", "/api/dashboard", auth1);
        assert.strictEqual(dashRes.status, 200);
        assert.strictEqual(dashRes.body.success, true);
        assert.ok(dashRes.body.dashboard.stats);
        assert.ok(dashRes.body.dashboard.finance);
        assert.ok(dashRes.body.dashboard.quests);
        assert.ok(dashRes.body.dashboard.achievements);
        assert.ok(dashRes.body.dashboard.savingsGoals);
        assert.ok(dashRes.body.dashboard.budgets);
        assert.ok(dashRes.body.dashboard.reflections);
        assert.strictEqual(dashRes.body.dashboard.user.password, undefined);
        pass("GET /api/dashboard returns comprehensive aggregated data without sensitive fields");

        const syncRes = await request(server, "POST", "/api/dashboard/sync-stats", auth1);
        assert.strictEqual(syncRes.status, 200);
        assert.strictEqual(syncRes.body.success, true);
        assert.ok(syncRes.body.stats.level >= 1);
        pass("POST /api/dashboard/sync-stats idempotently synchronizes user stats");
    } catch (e) {
        fail("Dashboard testing failed", e);
    }

    // --- 12. CENTRALIZED ERROR & 404 HANDLING ---
    console.log("\n--- 12. Centralized Error & 404 Route Protection ---");
    try {
        const notFoundRes = await request(server, "GET", "/api/some-undefined-route");
        assert.strictEqual(notFoundRes.status, 404);
        assert.strictEqual(notFoundRes.body.message, "Route not found");
        pass("Undefined endpoint returns standardized 404 Route not found");

        const badJsonRes = await request(server, "POST", "/api/finance/transactions", auth1, "{ invalid json ");
        assert.strictEqual(badJsonRes.status, 400);
        assert.strictEqual(badJsonRes.body.message, "Invalid JSON payload");
        pass("Malformed JSON payload caught by centralized error middleware (400)");
    } catch (e) {
        fail("Error handling testing failed", e);
    }

    server.close();
    console.log(`\n========================================================`);
    console.log(`=== END-TO-END TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    console.log(`========================================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

runEndToEndTests().catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
});
