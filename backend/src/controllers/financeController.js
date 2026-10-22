import prisma from "../config/prisma.js";

export const VALID_TRANSACTION_CATEGORIES = [
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

export const VALID_TRANSACTION_TYPES = [
    "INCOME",
    "EXPENSE",
];

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
    } catch (error) {
        console.error("Error retrieving transactions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve transactions",
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
        } = req.body || {};

        if (!description || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required",
            });
        }

        if (category === undefined || category === null || category === "") {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        const normalizedCategory = String(category).trim().toUpperCase();
        if (!VALID_TRANSACTION_CATEGORIES.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Allowed: ${VALID_TRANSACTION_CATEGORIES.join(", ")}`,
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

        if (type === undefined || type === null || type === "") {
            return res.status(400).json({
                success: false,
                message: "Transaction type is required (INCOME or EXPENSE)",
            });
        }

        const normalizedType = String(type).trim().toUpperCase();
        if (!VALID_TRANSACTION_TYPES.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction type. Allowed: INCOME, EXPENSE",
            });
        }

        let parsedDate = new Date();
        if (date !== undefined && date !== null && date !== "") {
            parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 string",
                });
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                description: description.trim(),
                category: normalizedCategory,
                amount: numAmount,
                type: normalizedType,
                date: parsedDate,
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
        console.error("Error creating transaction:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create transaction",
        });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid transaction ID is required",
            });
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id.trim(),
            },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        if (transaction.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this transaction",
            });
        }

        await prisma.transaction.delete({
            where: {
                id: id.trim(),
            },
        });

        res.status(200).json({
            success: true,
            message: "Transaction deleted",
        });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete transaction",
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
        const { id } = req.params;
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid savings goal ID is required",
            });
        }

        const goal = await prisma.savingsGoal.findUnique({
            where: {
                id: id.trim(),
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
        console.error("Error retrieving savings goal:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve savings goal",
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
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid savings goal ID is required",
            });
        }

        const { title, target, current, progress, icon, completed } = req.body || {};

        const existingGoal = await prisma.savingsGoal.findUnique({
            where: { id: id.trim() },
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
            where: { id: id.trim() },
            data: updatedData,
        });

        res.status(200).json({
            success: true,
            goal: updatedGoal,
            savingsGoal: updatedGoal,
            message: "Savings goal updated successfully",
        });
    } catch (error) {
        console.error("Error updating savings goal:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update savings goal",
        });
    }
};

export const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid savings goal ID is required",
            });
        }

        const existingGoal = await prisma.savingsGoal.findUnique({
            where: { id: id.trim() },
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
            where: { id: id.trim() },
        });

        res.status(200).json({
            success: true,
            message: "Savings goal deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting savings goal:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete savings goal",
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
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid budget ID is required",
            });
        }

        const budget = await prisma.budget.findUnique({
            where: { id: id.trim() },
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
        console.error("Error retrieving budget:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve budget",
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
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid budget ID is required",
            });
        }

        const { category, amount, month, year } = req.body || {};

        const existingBudget = await prisma.budget.findUnique({
            where: { id: id.trim() },
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

            if (duplicate && duplicate.id !== id.trim()) {
                return res.status(409).json({
                    success: false,
                    message: `A budget for category '${finalCategory}' in ${finalMonth}/${finalYear} already exists`,
                });
            }
        }

        const updated = await prisma.budget.update({
            where: { id: id.trim() },
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
        console.error("Error updating budget:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update budget",
        });
    }
};

export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid budget ID is required",
            });
        }

        const existingBudget = await prisma.budget.findUnique({
            where: { id: id.trim() },
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
            where: { id: id.trim() },
        });

        res.status(200).json({
            success: true,
            message: "Budget deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete budget",
        });
    }
};