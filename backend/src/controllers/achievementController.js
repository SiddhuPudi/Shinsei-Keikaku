import prisma from "../config/prisma.js";

export const VALID_CATEGORIES = [
    "MILESTONE",
    "STREAK",
    "FITNESS",
    "INTELLECT",
    "DISCIPLINE",
    "SPECIAL",
];

export const VALID_RARITIES = [
    "COMMON",
    "UNCOMMON",
    "RARE",
    "EPIC",
    "LEGENDARY",
];

export const VALID_STATUSES = [
    "ALL",
    "UNLOCKED",
    "LOCKED",
];

/**
 * Formats an Achievement object with unlock state and convenience aliases
 * matching existing frontend conventions while strictly adhering to Prisma schema.
 */
export const formatAchievement = (achievement, userAchievement = null) => {
    if (!achievement) return null;
    const isUnlocked = Boolean(userAchievement);
    const unlockedAt = userAchievement ? userAchievement.unlockedAt : null;
    let unlockedDate = null;
    if (unlockedAt) {
        const d = new Date(unlockedAt);
        unlockedDate = isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
    }

    return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        desc: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        expReward: achievement.expReward,
        exp: achievement.expReward,
        unlocked: isUnlocked,
        unlockedAt: unlockedAt ? new Date(unlockedAt).toISOString() : null,
        unlockedDate,
        userAchievementId: userAchievement ? userAchievement.id : null,
    };
};

/**
 * List achievements for the authenticated user with optional filtering:
 * - ?category=FITNESS|STREAK|...
 * - ?rarity=COMMON|RARE|...
 * - ?status=all|unlocked|locked
 * - ?unlocked=true|false
 *
 * Scoped to req.user.id for evaluating unlock state.
 * Returns catalog achievements annotated with user's unlock details and top-level stats.
 */
export const getAchievements = async (req, res) => {
    try {
        const {
            category,
            rarity,
            status,
            unlocked,
        } = req.query;

        const whereClause = {};

        // Category validation
        if (category !== undefined) {
            const normalizedCategory = String(category).trim().toUpperCase();
            if (!VALID_CATEGORIES.includes(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category filter. Allowed: ${VALID_CATEGORIES.join(", ")}`,
                });
            }
            whereClause.category = normalizedCategory;
        }

        // Rarity validation
        if (rarity !== undefined) {
            const normalizedRarity = String(rarity).trim().toUpperCase();
            if (!VALID_RARITIES.includes(normalizedRarity)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid rarity filter. Allowed: ${VALID_RARITIES.join(", ")}`,
                });
            }
            whereClause.rarity = normalizedRarity;
        }

        // Status / unlocked validation
        let statusFilter = "ALL";
        if (status !== undefined) {
            const s = String(status).trim().toUpperCase();
            if (!VALID_STATUSES.includes(s)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status filter. Allowed: ${VALID_STATUSES.join(", ").toLowerCase()}`,
                });
            }
            statusFilter = s;
        } else if (unlocked !== undefined) {
            const u = String(unlocked).trim().toLowerCase();
            if (u === "true") {
                statusFilter = "UNLOCKED";
            } else if (u === "false") {
                statusFilter = "LOCKED";
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid unlocked query parameter. Allowed: true, false",
                });
            }
        }

        // Fetch master achievements catalogue including user's specific unlock record
        const achievements = await prisma.achievement.findMany({
            where: whereClause,
            include: {
                users: {
                    where: {
                        userId: req.user.id,
                    },
                },
            },
            orderBy: [
                { expReward: "asc" },
                { title: "asc" },
            ],
        });

        // Format items with unlock state for current user
        let formatted = achievements.map((ach) => {
            const ua = ach.users && ach.users.length > 0 ? ach.users[0] : null;
            return formatAchievement(ach, ua);
        });

        // Apply status filter if unlocked or locked
        if (statusFilter === "UNLOCKED") {
            formatted = formatted.filter((a) => a.unlocked);
        } else if (statusFilter === "LOCKED") {
            formatted = formatted.filter((a) => !a.unlocked);
        }

        // Calculate summary metrics for the user across the entire catalog
        const totalCatalog = await prisma.achievement.findMany({
            include: {
                users: {
                    where: { userId: req.user.id },
                },
            },
        });

        const totalCount = totalCatalog.length;
        const unlockedList = totalCatalog.filter((a) => a.users && a.users.length > 0);
        const unlockedCount = unlockedList.length;
        const totalExp = unlockedList.reduce((sum, a) => sum + (a.expReward || 0), 0);
        const legendaryUnlockedCount = unlockedList.filter((a) => a.rarity === "LEGENDARY").length;
        const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

        res.status(200).json({
            success: true,
            achievements: formatted,
            stats: {
                totalCount,
                unlockedCount,
                totalExp,
                legendaryUnlockedCount,
                completionRate,
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
 * Retrieve unlocked achievements belonging specifically to the authenticated user.
 */
export const getUserUnlockedAchievements = async (req, res) => {
    try {
        const { category, rarity } = req.query;

        const achievementWhere = {};
        if (category !== undefined) {
            const normalizedCategory = String(category).trim().toUpperCase();
            if (!VALID_CATEGORIES.includes(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category filter. Allowed: ${VALID_CATEGORIES.join(", ")}`,
                });
            }
            achievementWhere.category = normalizedCategory;
        }

        if (rarity !== undefined) {
            const normalizedRarity = String(rarity).trim().toUpperCase();
            if (!VALID_RARITIES.includes(normalizedRarity)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid rarity filter. Allowed: ${VALID_RARITIES.join(", ")}`,
                });
            }
            achievementWhere.rarity = normalizedRarity;
        }

        const userAchievements = await prisma.userAchievement.findMany({
            where: {
                userId: req.user.id,
                achievement: achievementWhere,
            },
            include: {
                achievement: true,
            },
            orderBy: {
                unlockedAt: "desc",
            },
        });

        const formatted = userAchievements.map((ua) => formatAchievement(ua.achievement, ua));

        res.status(200).json({
            success: true,
            achievements: formatted,
            count: formatted.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single achievement strictly scoped to the authenticated user.
 * Returns the achievement only if it belongs to (is unlocked by) the signed-in user,
 * unless ?includeLocked=true or ?scope=all is explicitly requested for catalog inspection.
 */
export const getAchievementById = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeLocked, scope } = req.query;

        if (!id || typeof id !== "string" || id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Valid achievement ID is required",
            });
        }

        const trimmedId = id.trim();

        // Check if ID matches an Achievement in catalog
        const achievement = await prisma.achievement.findUnique({
            where: { id: trimmedId },
            include: {
                users: {
                    where: { userId: req.user.id },
                },
            },
        });

        if (!achievement) {
            // Check if ID matches a UserAchievement record for this user
            const userAchievement = await prisma.userAchievement.findUnique({
                where: { id: trimmedId },
                include: { achievement: true },
            });

            if (userAchievement && userAchievement.userId === req.user.id) {
                return res.status(200).json({
                    success: true,
                    achievement: formatAchievement(userAchievement.achievement, userAchievement),
                });
            }

            return res.status(404).json({
                success: false,
                message: "Achievement not found",
            });
        }

        const userAchievement = achievement.users?.[0] || null;
        const allowLocked = includeLocked === "true" || scope === "all";

        // Strictly verify user ownership / unlock unless allowLocked is explicitly requested
        if (!userAchievement && !allowLocked) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found or not unlocked by user",
            });
        }

        res.status(200).json({
            success: true,
            achievement: formatAchievement(achievement, userAchievement),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Unlock an achievement for the authenticated user.
 * Accepts achievementId from route params or body.
 */
export const unlockAchievement = async (req, res) => {
    try {
        const achievementId = req.params.id || req.body?.achievementId || req.body?.id;

        if (!achievementId || typeof achievementId !== "string" || achievementId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "achievementId is required",
            });
        }

        const trimmedId = achievementId.trim();

        // Verify achievement exists in catalog
        const achievement = await prisma.achievement.findUnique({
            where: { id: trimmedId },
        });

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found in catalog",
            });
        }

        // Check if user has already unlocked this achievement
        const existingUnlock = await prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId: req.user.id,
                    achievementId: trimmedId,
                },
            },
        });

        if (existingUnlock) {
            return res.status(409).json({
                success: false,
                message: "Achievement is already unlocked by user",
                achievement: formatAchievement(achievement, existingUnlock),
            });
        }

        // Create UserAchievement unlock record scoped to authenticated user
        const userAchievement = await prisma.userAchievement.create({
            data: {
                userId: req.user.id,
                achievementId: trimmedId,
            },
            include: {
                achievement: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Achievement unlocked successfully",
            achievement: formatAchievement(userAchievement.achievement, userAchievement),
            userAchievement: {
                id: userAchievement.id,
                userId: userAchievement.userId,
                achievementId: userAchievement.achievementId,
                unlockedAt: userAchievement.unlockedAt,
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
 * Relock / revoke an achievement unlock for the authenticated user.
 * Removes the UserAchievement record for req.user.id without modifying the master catalog.
 */
export const relockAchievement = async (req, res) => {
    try {
        const achievementId = req.params.id;

        if (!achievementId || typeof achievementId !== "string" || achievementId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Valid achievement ID is required",
            });
        }

        const trimmedId = achievementId.trim();

        // Find user's unlock record by compound key
        let userAchievement = await prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId: req.user.id,
                    achievementId: trimmedId,
                },
            },
        });

        // If not found by compound key, check if ID was a userAchievement.id
        if (!userAchievement) {
            const byUaId = await prisma.userAchievement.findUnique({
                where: { id: trimmedId },
            });
            if (byUaId && byUaId.userId === req.user.id) {
                userAchievement = byUaId;
            }
        }

        if (!userAchievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found or not unlocked by user",
            });
        }

        // Delete user's unlock record
        await prisma.userAchievement.delete({
            where: { id: userAchievement.id },
        });

        res.status(200).json({
            success: true,
            message: "Achievement relocked successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Handle POST /api/achievements.
 * If body provides achievementId, delegates to unlockAchievement.
 * If body attempts to create catalog definitions, rejects with 403.
 */
export const createAchievement = async (req, res) => {
    if (req.body?.achievementId || (req.body?.id && !req.body?.title)) {
        return unlockAchievement(req, res);
    }

    return res.status(403).json({
        success: false,
        message: "Catalog achievements are system-defined and cannot be created by clients. Use POST /api/achievements/:id/unlock to unlock an achievement.",
    });
};

/**
 * Handle PUT/PATCH /api/achievements/:id.
 * Allows safe toggling of unlock state ({ unlocked: true | false }).
 * Rejects attempts to modify catalog definition properties with 403.
 */
export const updateAchievement = async (req, res) => {
    const { title, description, icon, category, rarity, expReward } = req.body || {};

    if (
        title !== undefined ||
        description !== undefined ||
        icon !== undefined ||
        category !== undefined ||
        rarity !== undefined ||
        expReward !== undefined
    ) {
        return res.status(403).json({
            success: false,
            message: "Catalog achievement definitions are immutable. Only user unlock status can be modified.",
        });
    }

    const { unlocked } = req.body || {};

    if (unlocked === true) {
        return unlockAchievement(req, res);
    } else if (unlocked === false) {
        return relockAchievement(req, res);
    }

    return res.status(400).json({
        success: false,
        message: "Specify { unlocked: true } to unlock or { unlocked: false } to relock.",
    });
};
