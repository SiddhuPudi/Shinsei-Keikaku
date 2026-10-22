import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Username, email, and password must be strings",
            });
        }

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Username must be between 3 and 50 characters",
            });
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address format",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        if (password.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 128 characters",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [ { email: trimmedEmail }, { username: trimmedUsername } ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: trimmedUsername,
                email: trimmedEmail,
                password: hashedPassword,
                stats: {
                    create: {}
                },
                settings: {
                    create: {},
                }
            },
            include: {
                stats: true,
            }
        });
        const token = generateToken(user.id);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                stats: user.stats,
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register user",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password must be strings",
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email: trimmedEmail },
            include: {
                stats: true,
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = generateToken(user.id);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                stats: user.stats,
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to login user",
        });
    }
};

export const getCurrentUser = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            stats: req.user.stats,
        }
    });
};