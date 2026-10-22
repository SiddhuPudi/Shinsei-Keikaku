import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/db-test", async (req, res) => {
    try {
        // Safe database connectivity check without leaking user rows, emails, or password hashes
        await prisma.user.count();
        res.status(200).json({
            success: true,
            message: "Database connected successfully",
            healthy: true,
        });
    } catch (error) {
        console.error("Database connectivity check failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

export default router;