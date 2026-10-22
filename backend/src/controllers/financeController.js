import prisma from "../config/prisma.js";

export const getTransaction = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                date: "desc",
            },
        });
        const formatted = transactions.map((tx) => ({
            ...tx,
            amount: Number(tx.amount),
            
        }));
        res.status(200).json({
            success: true,
            transactions: formatted,
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createTransaction = async (req, res) => {
    try {
        const {
            description,
            category,
            amount,
            type,
            date,
        } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                description,
                category,
                amount,
                type,
                date: new Date(date),
            },
        });
        res.status(201).json({
            success: true,
            transaction: {
                ...transaction,
                amount: Number(transaction.amount),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteTransaction = async(req, res) => {
    try{
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: req.params.id,
            },
        });
        if (!transaction) {
            res.status(404).json({
                success: false,
                message: "Not authorized",
            });
        }
        await prisma.transaction.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({
            success: true,
            message: "Transaction deleted",
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==================== SAVINGS GOALS CONTROLLERS ====================

export const getSavingsGoals = async (req, res) => {
    try {
        const goals = await prisma.savingsGoal.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            goals,
            savingsGoals: goals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSavingsGoalById = async (req, res) => {
    try {
        const goal = await prisma.savingsGoal.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Savings goal not found",
            });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this savings goal",
            });
        }

        res.status(200).json({
            success: true,
            goal,
            savingsGoal: goal,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createSavingsGoal = async (req, res) => {
    try {
        const { title, target, current, progress, icon, completed } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        if (target === undefined || target === null || target === "") {
            return res.status(400).json({
                success: false,
                message: "Target amount is required",
            });
        }

        const numTarget = Number(target);
        if (isNaN(numTarget) || numTarget <= 0) {
            return res.status(400).json({
                success: false,
                message: "Target amount must be a positive number",
            });
        }

        const progressInput = current !== undefined ? current : progress;
        let numCurrent = 0;
        if (progressInput !== undefined && progressInput !== null && progressInput !== "") {
            numCurrent = Number(progressInput);
            if (isNaN(numCurrent) || numCurrent < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Current amount must be a non-negative number",
                });
            }
        }

        const iconVal = (icon && typeof icon === "string" && icon.trim()) ? icon.trim() : "🎯";

        const isCompleted = completed !== undefined 
            ? Boolean(completed) 
            : numCurrent >= numTarget;

        const goal = await prisma.savingsGoal.create({
            data: {
                userId: req.user.id,
                title: title.trim(),
                icon: iconVal,
                target: numTarget,
                current: numCurrent,
                completed: isCompleted,
            },
        });

        res.status(201).json({
            success: true,
            goal,
            savingsGoal: goal,
            message: "Savings goal created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, target, current, progress, icon, completed } = req.body;

        const existingGoal = await prisma.savingsGoal.findUnique({
            where: { id },
        });

        if (!existingGoal) {
            return res.status(404).json({
                success: false,
                message: "Savings goal not found",
            });
        }

        if (existingGoal.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this savings goal",
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

        if (icon !== undefined) {
            if (typeof icon !== "string" || !icon.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Icon must be a non-empty string",
                });
            }
            updatedData.icon = icon.trim();
        }

        if (target !== undefined) {
            const numTarget = Number(target);
            if (isNaN(numTarget) || numTarget <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Target amount must be a positive number",
                });
            }
            updatedData.target = numTarget;
        }

        const progressInput = current !== undefined ? current : progress;
        if (progressInput !== undefined) {
            const numCurrent = Number(progressInput);
            if (isNaN(numCurrent) || numCurrent < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Current amount must be a non-negative number",
                });
            }
            updatedData.current = numCurrent;
        }

        if (completed !== undefined) {
            updatedData.completed = Boolean(completed);
        } else if (updatedData.current !== undefined || updatedData.target !== undefined) {
            const finalCurrent = updatedData.current !== undefined ? updatedData.current : existingGoal.current;
            const finalTarget = updatedData.target !== undefined ? updatedData.target : existingGoal.target;
            if (finalCurrent >= finalTarget) {
                updatedData.completed = true;
            }
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update",
            });
        }

        const updatedGoal = await prisma.savingsGoal.update({
            where: { id },
            data: updatedData,
        });

        res.status(200).json({
            success: true,
            goal: updatedGoal,
            savingsGoal: updatedGoal,
            message: "Savings goal updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const existingGoal = await prisma.savingsGoal.findUnique({
            where: { id },
        });

        if (!existingGoal) {
            return res.status(404).json({
                success: false,
                message: "Savings goal not found",
            });
        }

        if (existingGoal.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this savings goal",
            });
        }

        await prisma.savingsGoal.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Savings goal deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Aliases for flexible naming
export const getGoals = getSavingsGoals;
export const getGoalById = getSavingsGoalById;
export const createGoal = createSavingsGoal;
export const updateGoal = updateSavingsGoal;
export const deleteGoal = deleteSavingsGoal;

// ==================== BUDGETS CONTROLLERS ====================

const VALID_CATEGORIES = [
    "FOOD",
    "FITNESS",
    "LEARNING",
    "ENTERTAINMENT",
    "TRANSPORT",
    "HEALTH",
    "SHOPPING",
    "HOUSING",
    "SAVINGS",
    "OTHER",
];

export const getBudgets = async (req, res) => {
    try {
        const { month, year, category } = req.query;
        const whereClause = {
            userId: req.user.id,
        };

        if (month !== undefined) {
            const parsedMonth = Number(month);
            if (
                !Number.isInteger(parsedMonth) ||
                parsedMonth < 1 ||
                parsedMonth > 12 ||
                String(month).trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid month: must be an integer between 1 and 12",
                });
            }
            whereClause.month = parsedMonth;
        }

        if (year !== undefined) {
            const parsedYear = Number(year);
            if (
                !Number.isInteger(parsedYear) ||
                parsedYear < 1000 ||
                parsedYear > 9999 ||
                String(year).trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year: must be a 4-digit integer year (e.g., 2026)",
                });
            }
            whereClause.year = parsedYear;
        }

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

        const budgets = await prisma.budget.findMany({
            where: whereClause,
            orderBy: [
                { year: "desc" },
                { month: "desc" },
                { createdAt: "desc" },
            ],
        });

        const formatted = budgets.map((b) => ({
            ...b,
            amount: Number(b.amount),
        }));

        res.status(200).json({
            success: true,
            budgets: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBudgetById = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await prisma.budget.findUnique({
            where: { id },
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (budget.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this budget",
            });
        }

        res.status(200).json({
            success: true,
            budget: {
                ...budget,
                amount: Number(budget.amount),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;

        if (!category || typeof category !== "string" || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        const normalizedCategory = category.trim().toUpperCase();
        if (!VALID_CATEGORIES.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(", ")}`,
            });
        }

        if (amount === undefined || amount === null || amount === "") {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number",
            });
        }

        if (month === undefined || month === null || month === "") {
            return res.status(400).json({
                success: false,
                message: "Month is required (1-12)",
            });
        }

        const parsedMonth = Number(month);
        if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({
                success: false,
                message: "Month must be an integer between 1 and 12",
            });
        }

        if (year === undefined || year === null || year === "") {
            return res.status(400).json({
                success: false,
                message: "Year is required",
            });
        }

        const parsedYear = Number(year);
        if (!Number.isInteger(parsedYear) || parsedYear < 1000 || parsedYear > 9999) {
            return res.status(400).json({
                success: false,
                message: "Year must be a 4-digit integer year (e.g., 2026)",
            });
        }

        const existing = await prisma.budget.findUnique({
            where: {
                userId_category_month_year: {
                    userId: req.user.id,
                    category: normalizedCategory,
                    month: parsedMonth,
                    year: parsedYear,
                },
            },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `A budget for category '${normalizedCategory}' in ${parsedMonth}/${parsedYear} already exists`,
            });
        }

        const budget = await prisma.budget.create({
            data: {
                userId: req.user.id,
                category: normalizedCategory,
                amount: numAmount,
                month: parsedMonth,
                year: parsedYear,
            },
        });

        res.status(201).json({
            success: true,
            budget: {
                ...budget,
                amount: Number(budget.amount),
            },
            message: "Budget created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, month, year } = req.body;

        const existingBudget = await prisma.budget.findUnique({
            where: { id },
        });

        if (!existingBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (existingBudget.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this budget",
            });
        }

        const updatedData = {};

        if (amount !== undefined) {
            const numAmount = Number(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Amount must be a positive number",
                });
            }
            updatedData.amount = numAmount;
        }

        if (category !== undefined) {
            if (typeof category !== "string" || !category.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category must be a non-empty string",
                });
            }
            const normalizedCategory = category.trim().toUpperCase();
            if (!VALID_CATEGORIES.includes(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(", ")}`,
                });
            }
            updatedData.category = normalizedCategory;
        }

        if (month !== undefined) {
            const parsedMonth = Number(month);
            if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
                return res.status(400).json({
                    success: false,
                    message: "Month must be an integer between 1 and 12",
                });
            }
            updatedData.month = parsedMonth;
        }

        if (year !== undefined) {
            const parsedYear = Number(year);
            if (!Number.isInteger(parsedYear) || parsedYear < 1000 || parsedYear > 9999) {
                return res.status(400).json({
                    success: false,
                    message: "Year must be a 4-digit integer year (e.g., 2026)",
                });
            }
            updatedData.year = parsedYear;
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update",
            });
        }

        const finalCategory = updatedData.category || existingBudget.category;
        const finalMonth = updatedData.month !== undefined ? updatedData.month : existingBudget.month;
        const finalYear = updatedData.year !== undefined ? updatedData.year : existingBudget.year;

        if (
            finalCategory !== existingBudget.category ||
            finalMonth !== existingBudget.month ||
            finalYear !== existingBudget.year
        ) {
            const duplicate = await prisma.budget.findUnique({
                where: {
                    userId_category_month_year: {
                        userId: req.user.id,
                        category: finalCategory,
                        month: finalMonth,
                        year: finalYear,
                    },
                },
            });

            if (duplicate && duplicate.id !== id) {
                return res.status(409).json({
                    success: false,
                    message: `A budget for category '${finalCategory}' in ${finalMonth}/${finalYear} already exists`,
                });
            }
        }

        const updated = await prisma.budget.update({
            where: { id },
            data: updatedData,
        });

        res.status(200).json({
            success: true,
            budget: {
                ...updated,
                amount: Number(updated.amount),
            },
            message: "Budget updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const existingBudget = await prisma.budget.findUnique({
            where: { id },
        });

        if (!existingBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found",
            });
        }

        if (existingBudget.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this budget",
            });
        }

        await prisma.budget.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Budget deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};