import prisma from "../config/prisma.js";
import { calculateStatsForUser, syncUserStats } from "../services/statsService.js";

/**
 * Validates a 4-digit calendar year (1900 - 2100).
 */
const validateYear = (val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    if (!Number.isInteger(num)) return null;
    if (num < 1900 || num > 2100) return null;
    return num;
};

/**
 * Validates a month number (1 - 12).
 */
const validateMonth = (val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    if (!Number.isInteger(num)) return null;
    if (num < 1 || num > 12) return null;
    return num;
};

/**
 * Normalizes date to midnight UTC.
 */
const normalizeDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Retrieve comprehensive dashboard overview for authenticated user.
 * Read-only operation: does not mutate database records.
 * Supports optional query parameters:
 * - ?month=1..12 (default: current UTC month)
 * - ?year=1900..2100 (default: current UTC year)
 * - ?date=YYYY-MM-DD (default: current UTC day)
 */
export const getDashboardData = async (req, res) => {
    try {
        const now = new Date();
        const { month, year, date } = req.query;

        // Validate month
        let targetMonth = now.getUTCMonth() + 1;
        if (month !== undefined) {
            const parsedMonth = validateMonth(month);
            if (parsedMonth === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid month parameter. Expected integer between 1 and 12.",
                });
            }
            targetMonth = parsedMonth;
        }

        // Validate year
        let targetYear = now.getUTCFullYear();
        if (year !== undefined) {
            const parsedYear = validateYear(year);
            if (parsedYear === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year parameter. Expected integer between 1900 and 2100.",
                });
            }
            targetYear = parsedYear;
        }

        // Validate date
        let targetDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (date !== undefined) {
            const parsedDate = normalizeDate(date);
            if (!parsedDate || String(date).trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date parameter. Expected format YYYY-MM-DD or ISO 8601 string.",
                });
            }
            targetDay = parsedDate;
        }

        const userId = req.user.id;

        // 1. User Stats (stored stats with fallback to calculated live stats)
        let stats = await prisma.userStats.findUnique({
            where: { userId },
        });

        if (!stats) {
            // Calculate live stats if no record is stored yet
            const liveStats = await calculateStatsForUser(userId);
            stats = {
                id: null,
                userId,
                ...liveStats,
            };
        }

        // 2. Daily Logs Summary
        const nextDay = new Date(targetDay.getTime() + 24 * 60 * 60 * 1000);
        const todayLog = await prisma.dailyLog.findFirst({
            where: {
                userId,
                date: {
                    gte: targetDay,
                    lt: nextDay,
                },
            },
        });

        const recentLogs = await prisma.dailyLog.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 7,
        });

        // 3. Quests Summary
        const allQuests = await prisma.quest.findMany({
            where: { userId },
            orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
        });

        const completedQuests = allQuests.filter((q) => q.isCompleted);
        const activeQuests = allQuests.filter((q) => !q.isCompleted);
        const questExpEarned = completedQuests.reduce((sum, q) => sum + (q.expReward || 0), 0);
        const questCompletionRate =
            allQuests.length > 0 ? Math.round((completedQuests.length / allQuests.length) * 100) : 0;

        const activeToday = activeQuests.filter((q) => {
            if (!q.dueDate) return true;
            const due = new Date(q.dueDate).getTime();
            return due <= nextDay.getTime();
        });

        // 4. Achievements Summary
        const allCatalogAchievements = await prisma.achievement.findMany();
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
            orderBy: { unlockedAt: "desc" },
        });

        const unlockedCount = userAchievements.length;
        const totalCatalogCount = allCatalogAchievements.length;
        const achievementExpEarned = userAchievements.reduce(
            (sum, ua) => sum + (ua.achievement?.expReward || 0),
            0
        );
        const achievementCompletionRate =
            totalCatalogCount > 0 ? Math.round((unlockedCount / totalCatalogCount) * 100) : 0;

        // 5. Finance Summary for targetMonth & targetYear
        const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
        const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));

        const monthTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                },
            },
        });

        let totalIncome = 0;
        let totalExpense = 0;
        for (const t of monthTransactions) {
            const amt = Number(t.amount);
            if (t.type === "INCOME") totalIncome += amt;
            else if (t.type === "EXPENSE") totalExpense += amt;
        }

        const netBalance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

        // 6. Budgets for targetMonth & targetYear
        const monthBudgets = await prisma.budget.findMany({
            where: {
                userId,
                month: targetMonth,
                year: targetYear,
            },
        });

        const totalBudgeted = monthBudgets.reduce((sum, b) => sum + Number(b.amount), 0);

        // 7. Savings Goals Summary
        const savingsGoals = await prisma.savingsGoal.findMany({
            where: { userId },
            orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
        });

        const completedGoals = savingsGoals.filter((g) => g.isCompleted);
        const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
        const totalCurrent = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
        const overallSavingsProgress =
            totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

        // 8. Year Reflection Summary
        const reflection = await prisma.reflection.findUnique({
            where: {
                userId_year: {
                    userId,
                    year: targetYear,
                },
            },
        });

        res.status(200).json({
            success: true,
            dashboard: {
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    email: req.user.email,
                },
                period: {
                    month: targetMonth,
                    year: targetYear,
                    date: targetDay.toISOString().split("T")[0],
                },
                stats: {
                    totalExp: stats.totalExp,
                    level: stats.level,
                    levelProgress: stats.levelProgress,
                    currentStreak: stats.currentStreak,
                    longestStreak: stats.longestStreak,
                    perfectDays: stats.perfectDays,
                    totalWorkouts: stats.totalWorkouts,
                    totalStudyHrs: stats.totalStudyHrs,
                    totalLeetcode: stats.totalLeetcode,
                    totalMistakes: stats.totalMistakes,
                },
                dailyLogs: {
                    today: todayLog,
                    recent: recentLogs,
                },
                quests: {
                    total: allQuests.length,
                    completed: completedQuests.length,
                    active: activeQuests.length,
                    completionRate: questCompletionRate,
                    expEarned: questExpEarned,
                    activeTodayCount: activeToday.length,
                    activeToday: activeToday.slice(0, 5),
                },
                achievements: {
                    total: totalCatalogCount,
                    unlocked: unlockedCount,
                    completionRate: achievementCompletionRate,
                    expEarned: achievementExpEarned,
                    recentUnlocked: userAchievements.slice(0, 5).map((ua) => ({
                        id: ua.achievementId,
                        title: ua.achievement.title,
                        icon: ua.achievement.icon,
                        category: ua.achievement.category,
                        rarity: ua.achievement.rarity,
                        expReward: ua.achievement.expReward,
                        unlockedAt: ua.unlockedAt,
                    })),
                },
                finance: {
                    month: targetMonth,
                    year: targetYear,
                    totalIncome,
                    totalExpense,
                    netBalance,
                    savingsRate,
                    transactionCount: monthTransactions.length,
                },
                budgets: {
                    month: targetMonth,
                    year: targetYear,
                    totalBudgeted,
                    count: monthBudgets.length,
                    items: monthBudgets.map((b) => ({
                        id: b.id,
                        category: b.category,
                        amount: Number(b.amount),
                        month: b.month,
                        year: b.year,
                    })),
                },
                savingsGoals: {
                    totalGoals: savingsGoals.length,
                    completedGoals: completedGoals.length,
                    totalTarget,
                    totalCurrent,
                    overallProgress: overallSavingsProgress,
                    activeGoals: savingsGoals.filter((g) => !g.isCompleted).slice(0, 5).map((g) => ({
                        id: g.id,
                        title: g.title,
                        targetAmount: Number(g.targetAmount),
                        currentAmount: Number(g.currentAmount),
                        progress: Number(g.currentAmount),
                        target: Number(g.targetAmount),
                        isCompleted: g.isCompleted,
                        deadline: g.deadline,
                    })),
                },
                reflections: {
                    year: targetYear,
                    hasReflection: Boolean(reflection),
                    reflection,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Idempotently synchronize the authenticated user's stats based on actual schema source records.
 */
export const syncDashboardStats = async (req, res) => {
    try {
        const updatedStats = await syncUserStats(req.user.id);

        res.status(200).json({
            success: true,
            message: "User stats synchronized successfully",
            stats: {
                totalExp: updatedStats.totalExp,
                level: updatedStats.level,
                levelProgress: updatedStats.levelProgress,
                currentStreak: updatedStats.currentStreak,
                longestStreak: updatedStats.longestStreak,
                perfectDays: updatedStats.perfectDays,
                totalWorkouts: updatedStats.totalWorkouts,
                totalStudyHrs: updatedStats.totalStudyHrs,
                totalLeetcode: updatedStats.totalLeetcode,
                totalMistakes: updatedStats.totalMistakes,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
