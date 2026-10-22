import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token || !token.trim()) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                stats: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Defense-in-depth: Never attach the password hash to req.user
        const { password, ...safeUser } = user;
        req.user = safeUser;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

export default protect;