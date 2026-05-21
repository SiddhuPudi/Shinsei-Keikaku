import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/db-test", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json({
            success: true,
            message: "Database connected successfully",
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;