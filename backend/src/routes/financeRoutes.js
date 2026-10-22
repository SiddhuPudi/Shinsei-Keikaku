import express from "express";
import protect from "../middleware/authMiddleware.js";
import { 
    createTransaction, 
    deleteTransaction, 
    getTransaction,
    getSavingsGoals,
    getSavingsGoalById,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
} from "../controllers/financeController.js";

const router = express.Router();

// Transactions
router.get("/transactions", protect, getTransaction);
router.post("/transactions", protect, createTransaction);
router.delete("/transactions/:id", protect, deleteTransaction);

// Savings Goals (/goals)
router.get("/goals", protect, getSavingsGoals);
router.get("/goals/:id", protect, getSavingsGoalById);
router.post("/goals", protect, createSavingsGoal);
router.put("/goals/:id", protect, updateSavingsGoal);
router.patch("/goals/:id", protect, updateSavingsGoal);
router.delete("/goals/:id", protect, deleteSavingsGoal);

// Savings Goals aliases (/savings-goals)
router.get("/savings-goals", protect, getSavingsGoals);
router.get("/savings-goals/:id", protect, getSavingsGoalById);
router.post("/savings-goals", protect, createSavingsGoal);
router.put("/savings-goals/:id", protect, updateSavingsGoal);
router.patch("/savings-goals/:id", protect, updateSavingsGoal);
router.delete("/savings-goals/:id", protect, deleteSavingsGoal);

// Budgets (/budgets)
router.get("/budgets", protect, getBudgets);
router.get("/budgets/:id", protect, getBudgetById);
router.post("/budgets", protect, createBudget);
router.put("/budgets/:id", protect, updateBudget);
router.patch("/budgets/:id", protect, updateBudget);
router.delete("/budgets/:id", protect, deleteBudget);

export default router;