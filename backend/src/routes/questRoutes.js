import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getQuests,
    getQuestById,
    createQuest,
    updateQuest,
    deleteQuest,
} from "../controllers/questController.js";

const router = express.Router();

// List quests with optional ?category, ?difficulty, ?status, ?date, ?dueBefore, ?dueAfter, ?limit
router.get("/", protect, getQuests);

// Retrieve single quest by ID
router.get("/:id", protect, getQuestById);

// Create a new quest
router.post("/", protect, createQuest);

// Update quest (including progress / completion)
router.put("/:id", protect, updateQuest);
router.patch("/:id", protect, updateQuest);

// Delete quest
router.delete("/:id", protect, deleteQuest);

export default router;
