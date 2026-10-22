import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getReflections,
    getReflectionById,
    getReflectionByYear,
    createReflection,
    updateReflection,
    deleteReflection,
    deleteReflectionByYear,
} from "../controllers/reflectionController.js";

const router = express.Router();

// List reflections with optional ?year=YYYY, ?startYear=YYYY, ?endYear=YYYY, ?limit=N, ?order=asc|desc
router.get("/", protect, getReflections);

// Retrieve single reflection by year
router.get("/year/:year", protect, getReflectionByYear);

// Retrieve single reflection by unique ID
router.get("/:id", protect, getReflectionById);

// Create or update (create-or-update) reflection
router.post("/", protect, createReflection);

// Upsert convenience by year
router.put("/year/:year", protect, createReflection);

// Update reflection by unique ID
router.put("/:id", protect, updateReflection);
router.patch("/:id", protect, updateReflection);

// Delete reflection by year
router.delete("/year/:year", protect, deleteReflectionByYear);

// Delete reflection by unique ID
router.delete("/:id", protect, deleteReflection);

export default router;
