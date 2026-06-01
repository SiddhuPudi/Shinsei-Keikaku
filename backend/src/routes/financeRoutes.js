import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createTransaction, deleteTransaction, getTransaction } from "../controllers/financeController.js";

const router = express.Router();

router.get("/transactions", protect, getTransaction);
router.post("/transactions", protect, createTransaction);
router.delete("/transactions/:id", protect, deleteTransaction);

export default router;