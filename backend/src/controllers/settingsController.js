import prisma from "../config/prisma.js";

export const VALID_LANGUAGES = [
    "ENGLISH",
    "JAPANESE",
    "HINDI",
];

export const VALID_DIFFICULTIES = [
    "EASY",
    "NORMAL",
    "HARD",
    "EXTREME",
];

const BOOLEAN_SETTINGS = [
    "darkMode",
    "compactView",
    "animations",
    "dailyReminder",
    "streakAlert",
    "weeklyReport",
    "achievementPop",
    "questDeadline",
    "autoComplete",
    "showExp",
    "penaltySystem",
];

const PROTECTED_SETTINGS_FIELDS = ["id", "userId", "user"];

/**
 * Helper to validate and convert a boolean value.
 */
const parseBoolean = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
        const lower = val.trim().toLowerCase();
        if (lower === "true") return true;
        if (lower === "false") return false;
    }
    return null;
};

/**
 * Retrieve authenticated user's settings.
 * If settings record does not exist yet, creates default settings record for the user.
 */
export const getUserSettings = async (req, res) => {
    try {
        let settings = await prisma.userSettings.findUnique({
            where: { userId: req.user.id },
        });

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: req.user.id,
                },
            });
        }

        res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update authenticated user's settings.
 * Accepts any subset of valid schema settings fields.
 * Scoped strictly to req.user.id.
 */
export const updateUserSettings = async (req, res) => {
    try {
        const body = req.body || {};

        // Reject attempts to modify protected fields
        for (const field of PROTECTED_SETTINGS_FIELDS) {
            if (body[field] !== undefined) {
                return res.status(400).json({
                    success: false,
                    message: `Field '${field}' cannot be modified.`,
                });
            }
        }

        const updateData = {};

        // Validate boolean settings
        for (const key of BOOLEAN_SETTINGS) {
            if (body[key] !== undefined) {
                const parsed = parseBoolean(body[key]);
                if (parsed === null) {
                    return res.status(400).json({
                        success: false,
                        message: `Field '${key}' must be a boolean (true or false).`,
                    });
                }
                updateData[key] = parsed;
            }
        }

        // Validate accentColor
        if (body.accentColor !== undefined) {
            if (typeof body.accentColor !== "string" || body.accentColor.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "accentColor must be a non-empty string.",
                });
            }
            const trimmedColor = body.accentColor.trim();
            if (trimmedColor.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: "accentColor must not exceed 50 characters.",
                });
            }
            updateData.accentColor = trimmedColor;
        }

        // Validate language enum
        if (body.language !== undefined) {
            if (typeof body.language !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Invalid language. Allowed: ${VALID_LANGUAGES.join(", ")}`,
                });
            }
            const normalizedLang = body.language.trim().toUpperCase();
            if (!VALID_LANGUAGES.includes(normalizedLang)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid language '${body.language}'. Allowed: ${VALID_LANGUAGES.join(", ")}`,
                });
            }
            updateData.language = normalizedLang;
        }

        // Validate difficulty enum
        if (body.difficulty !== undefined) {
            if (typeof body.difficulty !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty. Allowed: ${VALID_DIFFICULTIES.join(", ")}`,
                });
            }
            const normalizedDiff = body.difficulty.trim().toUpperCase();
            if (!VALID_DIFFICULTIES.includes(normalizedDiff)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty '${body.difficulty}'. Allowed: ${VALID_DIFFICULTIES.join(", ")}`,
                });
            }
            updateData.difficulty = normalizedDiff;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one valid settings field must be provided to update.",
            });
        }

        const updatedSettings = await prisma.userSettings.upsert({
            where: { userId: req.user.id },
            update: updateData,
            create: {
                userId: req.user.id,
                ...updateData,
            },
        });

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            settings: updatedSettings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Reset authenticated user's settings to schema defaults.
 */
export const resetUserSettings = async (req, res) => {
    try {
        const defaults = {
            darkMode: true,
            accentColor: "cyan",
            compactView: false,
            animations: true,
            language: "ENGLISH",
            dailyReminder: true,
            streakAlert: true,
            weeklyReport: false,
            achievementPop: true,
            questDeadline: true,
            autoComplete: true,
            showExp: true,
            penaltySystem: true,
            difficulty: "NORMAL",
        };

        const reset = await prisma.userSettings.upsert({
            where: { userId: req.user.id },
            update: defaults,
            create: {
                userId: req.user.id,
                ...defaults,
            },
        });

        res.status(200).json({
            success: true,
            message: "Settings reset to defaults successfully",
            settings: reset,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
