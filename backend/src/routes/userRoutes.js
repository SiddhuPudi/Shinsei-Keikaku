import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

// Retrieve authenticated user's safe profile
router.get("/", protect, getUserProfile);
router.get("/profile", protect, getUserProfile);

// Update allowed profile fields (username, email)
router.put("/", protect, updateUserProfile);
router.put("/profile", protect, updateUserProfile);
router.patch("/", protect, updateUserProfile);
router.patch("/profile", protect, updateUserProfile);

export default router;
