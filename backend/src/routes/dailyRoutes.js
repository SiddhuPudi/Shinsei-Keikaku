import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getDailyLogs,
    getDailyLogById,
    getDailyLogByDate,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
} from "../controllers/dailyController.js";

const router = express.Router();

// List daily logs with optional ?date, ?startDate, ?endDate, ?limit
router.get("/", protect, getDailyLogs);
router.get("/logs", protect, getDailyLogs);

// Get single daily log by specific calendar date (YYYY-MM-DD)
router.get("/date/:date", protect, getDailyLogByDate);

// Get single daily log by ID
router.get("/:id", protect, getDailyLogById);

// Create or upsert a daily log
router.post("/", protect, createDailyLog);
router.post("/logs", protect, createDailyLog);

// Update daily log by ID
router.put("/:id", protect, updateDailyLog);
router.patch("/:id", protect, updateDailyLog);

// Delete daily log by ID
router.delete("/:id", protect, deleteDailyLog);

export default router;
