import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getAchievements,
    getUserUnlockedAchievements,
    getAchievementById,
    unlockAchievement,
    relockAchievement,
    createAchievement,
    updateAchievement,
} from "../controllers/achievementController.js";

const router = express.Router();

// List achievements with user's unlock state and optional ?category, ?rarity, ?status, ?unlocked
router.get("/", protect, getAchievements);

// Convenience route for user's unlocked achievements only
router.get("/unlocked", protect, getUserUnlockedAchievements);

// Retrieve single achievement strictly scoped to authenticated user
router.get("/:id", protect, getAchievementById);

// Safe unlock endpoints
router.post("/unlock", protect, unlockAchievement);
router.post("/:id/unlock", protect, unlockAchievement);

// Root POST (accepts { achievementId } for unlock, rejects catalog creation)
router.post("/", protect, createAchievement);

// Unlock state toggling
router.put("/:id", protect, updateAchievement);
router.patch("/:id", protect, updateAchievement);

// Relock / revoke unlock endpoints
router.delete("/:id/unlock", protect, relockAchievement);
router.delete("/:id", protect, relockAchievement);

export default router;
