import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getDashboardData, syncDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// Retrieve comprehensive, safe dashboard data for authenticated user
router.get("/", protect, getDashboardData);

// Idempotently recalculate and sync user stats from schema source records
router.post("/sync-stats", protect, syncDashboardStats);
router.post("/stats/sync", protect, syncDashboardStats);

export default router;
