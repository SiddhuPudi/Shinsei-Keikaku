import prisma from "../config/prisma.js";

const PROTECTED_FIELDS = [
    "password",
    "passwordHash",
    "id",
    "userId",
    "role",
    "stats",
    "totalExp",
    "level",
    "levelProgress",
    "currentStreak",
    "longestStreak",
    "perfectDays",
    "createdAt",
    "updatedAt",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitizes user object ensuring sensitive fields like password are never exposed.
 */
export const sanitizeUser = (user) => {
    if (!user) return null;
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: user.stats ?? null,
        settings: user.settings ?? null,
    };
};

/**
 * Retrieve authenticated user's profile.
 * Strictly scoped to req.user.id.
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                stats: true,
                settings: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const safeUser = sanitizeUser(user);

        res.status(200).json({
            success: true,
            user: safeUser,
            profile: safeUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update authenticated user's profile.
 * Allows updating safe profile fields only (username, email).
 * Strictly rejects any attempts to supply protected fields (password, id, role, stats).
 */
export const updateUserProfile = async (req, res) => {
    try {
        const body = req.body || {};

        // Reject attempts to update protected fields
        for (const field of PROTECTED_FIELDS) {
            if (body[field] !== undefined) {
                return res.status(400).json({
                    success: false,
                    message: `Field '${field}' is protected and cannot be modified via profile update.`,
                });
            }
        }

        const { username, email } = body;

        if (username === undefined && email === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one allowed field ('username' or 'email') must be provided to update.",
            });
        }

        const updateData = {};

        // Validate username
        if (username !== undefined) {
            if (typeof username !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Username must be a string",
                });
            }
            const trimmedUsername = username.trim();
            if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Username must be between 3 and 50 characters",
                });
            }

            if (trimmedUsername !== req.user.username) {
                // Check if username is already taken by another user
                const existing = await prisma.user.findUnique({
                    where: { username: trimmedUsername },
                });
                if (existing && existing.id !== req.user.id) {
                    return res.status(409).json({
                        success: false,
                        message: "Username is already taken",
                    });
                }
            }
            updateData.username = trimmedUsername;
        }

        // Validate email
        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Email must be a string",
                });
            }
            const trimmedEmail = email.trim().toLowerCase();
            if (!EMAIL_REGEX.test(trimmedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email address format",
                });
            }

            if (trimmedEmail !== req.user.email) {
                // Check if email is already taken by another user
                const existing = await prisma.user.findUnique({
                    where: { email: trimmedEmail },
                });
                if (existing && existing.id !== req.user.id) {
                    return res.status(409).json({
                        success: false,
                        message: "Email is already taken",
                    });
                }
            }
            updateData.email = trimmedEmail;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            include: {
                stats: true,
                settings: true,
            },
        });

        const safeUser = sanitizeUser(updatedUser);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: safeUser,
            profile: safeUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
