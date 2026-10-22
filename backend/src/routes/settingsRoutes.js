import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getUserSettings,
    updateUserSettings,
    resetUserSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

// Retrieve authenticated user's settings (auto-creates if not present)
router.get("/", protect, getUserSettings);

// Update authenticated user's settings
router.put("/", protect, updateUserSettings);
router.patch("/", protect, updateUserSettings);

// Reset user settings to defaults
router.post("/reset", protect, resetUserSettings);

export default router;
