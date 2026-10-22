import prisma from "../config/prisma.js";

/**
 * Calculates current and longest streaks from an array of Date objects or ISO strings.
 * Dates are normalized to UTC calendar days (YYYY-MM-DD).
 */
export const calculateStreaks = (dates, referenceDate = new Date()) => {
    if (!dates || dates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Convert dates to sorted unique YYYY-MM-DD timestamps (midnight UTC)
    const uniqueTimestamps = Array.from(
        new Set(
            dates.map((d) => {
                const dt = new Date(d);
                return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
            })
        )
    ).sort((a, b) => a - b);

    if (uniqueTimestamps.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Calculate longest streak across history
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < uniqueTimestamps.length; i++) {
        const diff = uniqueTimestamps[i] - uniqueTimestamps[i - 1];
        if (diff === ONE_DAY_MS) {
            tempStreak++;
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
        } else {
            tempStreak = 1;
        }
    }

    // Calculate current streak relative to reference date (today)
    const refUtc = Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate()
    );

    const latestLogged = uniqueTimestamps[uniqueTimestamps.length - 1];
    const daysSinceLatest = (refUtc - latestLogged) / ONE_DAY_MS;

    let currentStreak = 0;
    // Streak is active if the latest log is today (0 days) or yesterday (1 day)
    if (daysSinceLatest === 0 || daysSinceLatest === 1) {
        currentStreak = 1;
        let expectedPrev = latestLogged - ONE_DAY_MS;
        for (let i = uniqueTimestamps.length - 2; i >= 0; i--) {
            if (uniqueTimestamps[i] === expectedPrev) {
                currentStreak++;
                expectedPrev -= ONE_DAY_MS;
            } else {
                break;
            }
        }
    }

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
    };
};

/**
 * Calculates deterministic, idempotent stats for a user directly from schema source records.
 */
export const calculateStatsForUser = async (userId) => {
    // 1. EXP from completed Quests
    const completedQuests = await prisma.quest.findMany({
        where: {
            userId,
            isCompleted: true,
        },
        select: {
            expReward: true,
        },
    });

    const questExp = completedQuests.reduce((sum, q) => sum + (q.expReward || 0), 0);

    // 2. EXP from unlocked Achievements
    const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: {
            achievement: {
                select: {
                    expReward: true,
                },
            },
        },
    });

    const achievementExp = userAchievements.reduce(
        (sum, ua) => sum + (ua.achievement?.expReward || 0),
        0
    );

    const totalExp = questExp + achievementExp;

    // Level calculation (100 EXP per level)
    const level = Math.floor(totalExp / 100) + 1;
    const levelProgress = totalExp % 100;

    // 3. Totals and Streaks from Daily Logs
    const dailyLogs = await prisma.dailyLog.findMany({
        where: { userId },
        orderBy: { date: "asc" },
    });

    const logDates = dailyLogs.map((l) => l.date);
    const { currentStreak, longestStreak } = calculateStreaks(logDates);

    let totalWorkouts = 0;
    let totalStudyHrs = 0;
    let totalLeetcode = 0;
    let totalMistakes = 0;
    let perfectDays = 0;

    for (const log of dailyLogs) {
        if (log.workoutDone) totalWorkouts++;
        if (log.studyHours) totalStudyHrs += log.studyHours;
        if (log.leetcodeSolved) totalLeetcode += log.leetcodeSolved;
        if (log.mistakesCount) totalMistakes += log.mistakesCount;

        // A perfect day has workout done, leetcode solved, study done, and 0 mistakes
        if (
            log.workoutDone &&
            (log.leetcodeSolved || 0) > 0 &&
            (log.studyHours || 0) > 0 &&
            (log.mistakesCount || 0) === 0
        ) {
            perfectDays++;
        }
    }

    return {
        totalExp,
        level,
        levelProgress,
        currentStreak,
        longestStreak,
        perfectDays,
        totalWorkouts,
        totalStudyHrs: Math.round(totalStudyHrs * 10) / 10,
        totalLeetcode,
        totalMistakes,
    };
};

/**
 * Idempotently synchronizes the user's UserStats record in the database.
 */
export const syncUserStats = async (userId) => {
    const computed = await calculateStatsForUser(userId);

    const stats = await prisma.userStats.upsert({
        where: { userId },
        update: computed,
        create: {
            userId,
            ...computed,
        },
    });

    return stats;
};
