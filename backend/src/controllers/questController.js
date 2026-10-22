import prisma from "../config/prisma.js";

export const VALID_CATEGORIES = [
    "FITNESS",
    "STUDY",
    "DISCIPLINE",
    "HEALTH",
    "LEETCODE",
    "PRODUCTIVITY",
    "CUSTOM",
];

export const VALID_DIFFICULTIES = [
    "EASY",
    "NORMAL",
    "HARD",
    "EXTREME",
];

const DEFAULT_EXP_MAP = {
    EASY: 15,
    NORMAL: 25,
    HARD: 35,
    EXTREME: 50,
};

/**
 * Formats a Quest object with convenience aliases (e.g. completed, progress, target, desc)
 * matching existing frontend conventions while preserving exact schema field names.
 */
export const formatQuest = (quest) => {
    if (!quest) return null;
    return {
        ...quest,
        completed: quest.isCompleted,
        progress: quest.currentValue,
        target: quest.targetValue,
        desc: quest.description,
    };
};

/**
 * List quests for the authenticated user with optional filtering:
 * - ?category=FITNESS
 * - ?difficulty=NORMAL
 * - ?status=active|completed|all (or ?isCompleted=true|false)
 * - ?date=YYYY-MM-DD (due on this date)
 * - ?dueBefore=YYYY-MM-DD
 * - ?dueAfter=YYYY-MM-DD
 * - ?limit=N
 */
export const getQuests = async (req, res) => {
    try {
        const {
            category,
            difficulty,
            status,
            isCompleted,
            date,
            dueBefore,
            dueAfter,
            limit,
        } = req.query;

        const whereClause = {
            userId: req.user.id,
        };

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

        if (difficulty !== undefined) {
            const normalizedDifficulty = String(difficulty).trim().toUpperCase();
            if (!VALID_DIFFICULTIES.includes(normalizedDifficulty)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty filter. Allowed: ${VALID_DIFFICULTIES.join(", ")}`,
                });
            }
            whereClause.difficulty = normalizedDifficulty;
        }

        // Status / isCompleted filter
        if (status !== undefined) {
            const s = String(status).trim().toLowerCase();
            if (s === "completed" || s === "done" || s === "true") {
                whereClause.isCompleted = true;
            } else if (s === "active" || s === "pending" || s === "false") {
                whereClause.isCompleted = false;
            } else if (s === "all") {
                // No filter on isCompleted
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status filter. Allowed: active, completed, all",
                });
            }
        } else if (isCompleted !== undefined) {
            const ic = String(isCompleted).trim().toLowerCase();
            if (ic === "true") {
                whereClause.isCompleted = true;
            } else if (ic === "false") {
                whereClause.isCompleted = false;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid isCompleted filter. Expected true or false",
                });
            }
        }

        // Date filtering on dueDate
        if (date !== undefined) {
            const d = new Date(date);
            if (isNaN(d.getTime()) || String(date).trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date filter format",
                });
            }
            const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
            whereClause.dueDate = {
                gte: startOfDay,
                lt: endOfDay,
            };
        } else if (dueBefore !== undefined || dueAfter !== undefined) {
            whereClause.dueDate = {};
            if (dueBefore !== undefined) {
                const db = new Date(dueBefore);
                if (isNaN(db.getTime()) || String(dueBefore).trim() === "") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dueBefore format",
                    });
                }
                whereClause.dueDate.lt = db;
            }
            if (dueAfter !== undefined) {
                const da = new Date(dueAfter);
                if (isNaN(da.getTime()) || String(dueAfter).trim() === "") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dueAfter format",
                    });
                }
                whereClause.dueDate.gte = da;
            }
        }

        const queryOptions = {
            where: whereClause,
            orderBy: [
                { isCompleted: "asc" },
                { createdAt: "desc" },
            ],
        };

        if (limit !== undefined) {
            const parsedLimit = Number(limit);
            if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "limit must be a positive integer",
                });
            }
            queryOptions.take = parsedLimit;
        }

        const quests = await prisma.quest.findMany(queryOptions);

        res.status(200).json({
            success: true,
            quests: quests.map(formatQuest),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single quest by ID, strictly scoped to authenticated user.
 */
export const getQuestById = async (req, res) => {
    try {
        const { id } = req.params;

        const quest = await prisma.quest.findUnique({
            where: { id },
        });

        if (!quest) {
            return res.status(404).json({
                success: false,
                message: "Quest not found",
            });
        }

        if (quest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this quest",
            });
        }

        res.status(200).json({
            success: true,
            quest: formatQuest(quest),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Create a new quest for the authenticated user.
 */
export const createQuest = async (req, res) => {
    try {
        const {
            title,
            description,
            desc,
            category,
            difficulty,
            expReward,
            exp,
            penalty,
            targetValue,
            target,
            currentValue,
            progress,
            isCompleted,
            completed,
            dueDate,
        } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        let normalizedCategory = "CUSTOM";
        if (category !== undefined && category !== null && category !== "") {
            normalizedCategory = String(category).trim().toUpperCase();
            if (!VALID_CATEGORIES.includes(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
                });
            }
        }

        let normalizedDifficulty = "NORMAL";
        if (difficulty !== undefined && difficulty !== null && difficulty !== "") {
            normalizedDifficulty = String(difficulty).trim().toUpperCase();
            if (!VALID_DIFFICULTIES.includes(normalizedDifficulty)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty. Allowed: ${VALID_DIFFICULTIES.join(", ")}`,
                });
            }
        }

        // EXP Reward: defaults according to difficulty if omitted
        let numExp = DEFAULT_EXP_MAP[normalizedDifficulty] || 25;
        const expInput = expReward !== undefined ? expReward : exp;
        if (expInput !== undefined && expInput !== null && expInput !== "") {
            numExp = Number(expInput);
            if (!Number.isInteger(numExp) || numExp <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "expReward must be a positive integer",
                });
            }
        }

        // Penalty: defaults to 0
        let numPenalty = 0;
        if (penalty !== undefined && penalty !== null && penalty !== "") {
            numPenalty = Number(penalty);
            if (!Number.isInteger(numPenalty) || numPenalty < 0) {
                return res.status(400).json({
                    success: false,
                    message: "penalty must be a non-negative integer",
                });
            }
        }

        // Target Value
        let numTarget = null;
        const targetInput = targetValue !== undefined ? targetValue : target;
        if (targetInput !== undefined && targetInput !== null && targetInput !== "") {
            numTarget = Number(targetInput);
            if (!Number.isInteger(numTarget) || numTarget <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "targetValue must be a positive integer",
                });
            }
        }

        // Current Value
        let numCurrent = 0;
        const currentInput = currentValue !== undefined ? currentValue : progress;
        if (currentInput !== undefined && currentInput !== null && currentInput !== "") {
            numCurrent = Number(currentInput);
            if (!Number.isInteger(numCurrent) || numCurrent < 0) {
                return res.status(400).json({
                    success: false,
                    message: "currentValue must be a non-negative integer",
                });
            }
        }

        // Completion status
        const completedInput = isCompleted !== undefined ? isCompleted : completed;
        let finalCompleted = false;
        if (completedInput !== undefined) {
            finalCompleted = Boolean(completedInput);
        } else if (numTarget !== null && numCurrent >= numTarget) {
            finalCompleted = true;
        }

        // Due date
        let parsedDueDate = null;
        if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid dueDate format. Expected YYYY-MM-DD or ISO 8601 string",
                });
            }
        }

        const descriptionVal = description !== undefined ? description : desc;
        const cleanedDesc = descriptionVal ? String(descriptionVal).trim() : null;

        const quest = await prisma.quest.create({
            data: {
                userId: req.user.id,
                title: title.trim(),
                description: cleanedDesc,
                category: normalizedCategory,
                difficulty: normalizedDifficulty,
                expReward: numExp,
                penalty: numPenalty,
                targetValue: numTarget,
                currentValue: numCurrent,
                isCompleted: finalCompleted,
                dueDate: parsedDueDate,
            },
        });

        res.status(201).json({
            success: true,
            quest: formatQuest(quest),
            message: "Quest created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update an existing quest by ID. Supports progress and completion updates.
 */
export const updateQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            desc,
            category,
            difficulty,
            expReward,
            exp,
            penalty,
            targetValue,
            target,
            currentValue,
            progress,
            isCompleted,
            completed,
            dueDate,
        } = req.body;

        const existingQuest = await prisma.quest.findUnique({
            where: { id },
        });

        if (!existingQuest) {
            return res.status(404).json({
                success: false,
                message: "Quest not found",
            });
        }

        if (existingQuest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this quest",
            });
        }

        const updatedData = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string",
                });
            }
            updatedData.title = title.trim();
        }

        const descInput = description !== undefined ? description : desc;
        if (descInput !== undefined) {
            updatedData.description = descInput !== null ? String(descInput).trim() : null;
        }

        if (category !== undefined) {
            const normalizedCategory = String(category).trim().toUpperCase();
            if (!VALID_CATEGORIES.includes(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}`,
                });
            }
            updatedData.category = normalizedCategory;
        }

        if (difficulty !== undefined) {
            const normalizedDifficulty = String(difficulty).trim().toUpperCase();
            if (!VALID_DIFFICULTIES.includes(normalizedDifficulty)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty. Allowed: ${VALID_DIFFICULTIES.join(", ")}`,
                });
            }
            updatedData.difficulty = normalizedDifficulty;
        }

        const expInput = expReward !== undefined ? expReward : exp;
        if (expInput !== undefined) {
            const numExp = Number(expInput);
            if (!Number.isInteger(numExp) || numExp <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "expReward must be a positive integer",
                });
            }
            updatedData.expReward = numExp;
        }

        if (penalty !== undefined) {
            const numPenalty = Number(penalty);
            if (!Number.isInteger(numPenalty) || numPenalty < 0) {
                return res.status(400).json({
                    success: false,
                    message: "penalty must be a non-negative integer",
                });
            }
            updatedData.penalty = numPenalty;
        }

        const targetInput = targetValue !== undefined ? targetValue : target;
        if (targetInput !== undefined) {
            if (targetInput === null || targetInput === "") {
                updatedData.targetValue = null;
            } else {
                const numTarget = Number(targetInput);
                if (!Number.isInteger(numTarget) || numTarget <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "targetValue must be a positive integer",
                    });
                }
                updatedData.targetValue = numTarget;
            }
        }

        const currentInput = currentValue !== undefined ? currentValue : progress;
        if (currentInput !== undefined) {
            const numCurrent = Number(currentInput);
            if (!Number.isInteger(numCurrent) || numCurrent < 0) {
                return res.status(400).json({
                    success: false,
                    message: "currentValue must be a non-negative integer",
                });
            }
            updatedData.currentValue = numCurrent;
        }

        const completedInput = isCompleted !== undefined ? isCompleted : completed;
        if (completedInput !== undefined) {
            updatedData.isCompleted = Boolean(completedInput);
        } else if (updatedData.currentValue !== undefined || updatedData.targetValue !== undefined) {
            // Auto-complete if progress reaches target when completed was not explicitly provided
            const finalTarget = updatedData.targetValue !== undefined ? updatedData.targetValue : existingQuest.targetValue;
            const finalCurrent = updatedData.currentValue !== undefined ? updatedData.currentValue : existingQuest.currentValue;
            if (finalTarget && finalCurrent >= finalTarget) {
                updatedData.isCompleted = true;
            }
        }

        if (dueDate !== undefined) {
            if (dueDate === null || dueDate === "") {
                updatedData.dueDate = null;
            } else {
                const parsedDueDate = new Date(dueDate);
                if (isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dueDate format. Expected YYYY-MM-DD or ISO 8601 string",
                    });
                }
                updatedData.dueDate = parsedDueDate;
            }
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update",
            });
        }

        const updated = await prisma.quest.update({
            where: { id },
            data: updatedData,
        });

        res.status(200).json({
            success: true,
            quest: formatQuest(updated),
            message: "Quest updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Delete a quest by ID.
 */
export const deleteQuest = async (req, res) => {
    try {
        const { id } = req.params;

        const existingQuest = await prisma.quest.findUnique({
            where: { id },
        });

        if (!existingQuest) {
            return res.status(404).json({
                success: false,
                message: "Quest not found",
            });
        }

        if (existingQuest.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this quest",
            });
        }

        await prisma.quest.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Quest deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
