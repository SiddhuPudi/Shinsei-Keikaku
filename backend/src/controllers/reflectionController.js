import prisma from "../config/prisma.js";

/**
 * Validates whether a value is a valid 4-digit calendar year (1900 - 2100).
 * Returns the parsed integer year, or null if invalid.
 */
export const validateYear = (val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    if (!Number.isInteger(num)) return null;
    if (num < 1900 || num > 2100) return null;
    return num;
};

/**
 * Normalizes text input: trims string or keeps null if empty/null.
 */
const sanitizeText = (val) => {
    if (val === undefined || val === null) return null;
    if (typeof val !== "string") return String(val).trim();
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
};

/**
 * Formats a Reflection record for JSON responses.
 */
export const formatReflection = (reflection) => {
    if (!reflection) return null;
    return {
        id: reflection.id,
        userId: reflection.userId,
        year: reflection.year,
        greatestAchievement: reflection.greatestAchievement,
        biggestLesson: reflection.biggestLesson,
        nextYearVision: reflection.nextYearVision,
        createdAt: reflection.createdAt,
        updatedAt: reflection.updatedAt,
    };
};

/**
 * List reflections for the authenticated user with optional filtering:
 * - ?year=YYYY (exact year match)
 * - ?startYear=YYYY & ?endYear=YYYY (year range)
 * - ?limit=N (positive integer)
 * - ?order=asc|desc (defaults to desc by year)
 *
 * Validates that unsupported period types or fields (e.g. month) are rejected.
 */
export const getReflections = async (req, res) => {
    try {
        const {
            year,
            startYear,
            endYear,
            month,
            period,
            limit,
            order,
        } = req.query;

        // Month filter check: schema only models yearly reflections
        if (month !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Month filter is not supported. The schema only supports yearly reflections.",
            });
        }

        // Period filter validation: only yearly is supported by the schema
        if (period !== undefined) {
            const p = String(period).trim().toLowerCase();
            if (p !== "year" && p !== "yearly") {
                return res.status(400).json({
                    success: false,
                    message: "Unsupported period filter. The schema only supports yearly reflections.",
                });
            }
        }

        const whereClause = {
            userId: req.user.id,
        };

        // Filter by exact year
        if (year !== undefined) {
            const parsedYear = validateYear(year);
            if (parsedYear === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year filter. Expected an integer between 1900 and 2100.",
                });
            }
            whereClause.year = parsedYear;
        } else if (startYear !== undefined || endYear !== undefined) {
            whereClause.year = {};
            if (startYear !== undefined) {
                const parsedStart = validateYear(startYear);
                if (parsedStart === null) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startYear filter. Expected an integer between 1900 and 2100.",
                    });
                }
                whereClause.year.gte = parsedStart;
            }
            if (endYear !== undefined) {
                const parsedEnd = validateYear(endYear);
                if (parsedEnd === null) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endYear filter. Expected an integer between 1900 and 2100.",
                    });
                }
                whereClause.year.lte = parsedEnd;
            }
            if (
                startYear !== undefined &&
                endYear !== undefined &&
                whereClause.year.gte > whereClause.year.lte
            ) {
                return res.status(400).json({
                    success: false,
                    message: "startYear cannot be greater than endYear.",
                });
            }
        }

        // Ordering
        let sortDirection = "desc";
        if (order !== undefined) {
            const o = String(order).trim().toLowerCase();
            if (o === "asc" || o === "desc") {
                sortDirection = o;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order parameter. Allowed: asc, desc.",
                });
            }
        }

        const queryOptions = {
            where: whereClause,
            orderBy: {
                year: sortDirection,
            },
        };

        // Limit
        if (limit !== undefined) {
            const parsedLimit = Number(limit);
            if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "limit must be a positive integer.",
                });
            }
            queryOptions.take = parsedLimit;
        }

        const reflections = await prisma.reflection.findMany(queryOptions);

        res.status(200).json({
            success: true,
            reflections: reflections.map(formatReflection),
            count: reflections.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single reflection by its unique ID, strictly scoped to authenticated user.
 */
export const getReflectionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string" || id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Valid reflection ID is required.",
            });
        }

        const reflection = await prisma.reflection.findUnique({
            where: { id: id.trim() },
        });

        if (!reflection) {
            return res.status(404).json({
                success: false,
                message: "Reflection not found.",
            });
        }

        if (reflection.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this reflection.",
            });
        }

        res.status(200).json({
            success: true,
            reflection: formatReflection(reflection),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single reflection by year for the authenticated user.
 */
export const getReflectionByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const parsedYear = validateYear(year);

        if (parsedYear === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid year parameter. Expected an integer between 1900 and 2100.",
            });
        }

        const reflection = await prisma.reflection.findUnique({
            where: {
                userId_year: {
                    userId: req.user.id,
                    year: parsedYear,
                },
            },
        });

        if (!reflection) {
            return res.status(404).json({
                success: false,
                message: `Reflection not found for year ${parsedYear}.`,
            });
        }

        res.status(200).json({
            success: true,
            reflection: formatReflection(reflection),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Create or Update a reflection for the authenticated user:
 * Because schema enforces @@unique([userId, year]), if a reflection for this year already exists,
 * it updates the existing reflection (create-or-update flow matching daily logs behavior).
 */
export const createReflection = async (req, res) => {
    try {
        const {
            year,
            greatestAchievement,
            biggestLesson,
            nextYearVision,
            // Convenience aliases matching potential client payloads
            achievement,
            lesson,
            vision,
        } = req.body || {};

        // If year is provided in params (e.g. PUT /year/:year), use that
        const yearInput = req.params?.year !== undefined ? req.params.year : year;

        let parsedYear;
        if (yearInput === undefined || yearInput === null || yearInput === "") {
            // Default to current year if omitted
            parsedYear = new Date().getFullYear();
        } else {
            parsedYear = validateYear(yearInput);
            if (parsedYear === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year. Expected an integer between 1900 and 2100.",
                });
            }
        }

        // Validate text fields if provided
        const finalAchievement = sanitizeText(greatestAchievement ?? achievement);
        const finalLesson = sanitizeText(biggestLesson ?? lesson);
        const finalVision = sanitizeText(nextYearVision ?? vision);

        // Check for existing reflection for this user and year
        const existingReflection = await prisma.reflection.findUnique({
            where: {
                userId_year: {
                    userId: req.user.id,
                    year: parsedYear,
                },
            },
        });

        if (existingReflection) {
            // Update existing reflection with provided fields
            const updatePayload = {};
            if (greatestAchievement !== undefined || achievement !== undefined) {
                updatePayload.greatestAchievement = finalAchievement;
            }
            if (biggestLesson !== undefined || lesson !== undefined) {
                updatePayload.biggestLesson = finalLesson;
            }
            if (nextYearVision !== undefined || vision !== undefined) {
                updatePayload.nextYearVision = finalVision;
            }

            const updated = await prisma.reflection.update({
                where: { id: existingReflection.id },
                data: updatePayload,
            });

            return res.status(200).json({
                success: true,
                message: "Reflection updated successfully",
                reflection: formatReflection(updated),
            });
        }

        // Create new reflection
        const created = await prisma.reflection.create({
            data: {
                userId: req.user.id,
                year: parsedYear,
                greatestAchievement: finalAchievement,
                biggestLesson: finalLesson,
                nextYearVision: finalVision,
            },
        });

        res.status(201).json({
            success: true,
            message: "Reflection created successfully",
            reflection: formatReflection(created),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update a reflection by its unique ID, strictly scoped to authenticated user.
 */
export const updateReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            year,
            greatestAchievement,
            biggestLesson,
            nextYearVision,
            achievement,
            lesson,
            vision,
        } = req.body || {};

        if (!id || typeof id !== "string" || id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Valid reflection ID is required.",
            });
        }

        // Check if reflection exists
        const existing = await prisma.reflection.findUnique({
            where: { id: id.trim() },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Reflection not found.",
            });
        }

        // Enforce ownership
        if (existing.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this reflection.",
            });
        }

        // Check that at least one field is provided
        const hasField =
            year !== undefined ||
            greatestAchievement !== undefined ||
            achievement !== undefined ||
            biggestLesson !== undefined ||
            lesson !== undefined ||
            nextYearVision !== undefined ||
            vision !== undefined;

        if (!hasField) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided to update.",
            });
        }

        const updatePayload = {};

        // If year is being updated, validate and verify unique constraint
        if (year !== undefined) {
            const parsedYear = validateYear(year);
            if (parsedYear === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid year. Expected an integer between 1900 and 2100.",
                });
            }

            if (parsedYear !== existing.year) {
                const collision = await prisma.reflection.findUnique({
                    where: {
                        userId_year: {
                            userId: req.user.id,
                            year: parsedYear,
                        },
                    },
                });

                if (collision && collision.id !== existing.id) {
                    return res.status(409).json({
                        success: false,
                        message: `A reflection for year ${parsedYear} already exists.`,
                    });
                }

                updatePayload.year = parsedYear;
            }
        }

        if (greatestAchievement !== undefined || achievement !== undefined) {
            updatePayload.greatestAchievement = sanitizeText(greatestAchievement ?? achievement);
        }
        if (biggestLesson !== undefined || lesson !== undefined) {
            updatePayload.biggestLesson = sanitizeText(biggestLesson ?? lesson);
        }
        if (nextYearVision !== undefined || vision !== undefined) {
            updatePayload.nextYearVision = sanitizeText(nextYearVision ?? vision);
        }

        const updated = await prisma.reflection.update({
            where: { id: existing.id },
            data: updatePayload,
        });

        res.status(200).json({
            success: true,
            message: "Reflection updated successfully",
            reflection: formatReflection(updated),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Delete a reflection by its unique ID, strictly scoped to authenticated user.
 */
export const deleteReflection = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string" || id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Valid reflection ID is required.",
            });
        }

        const existing = await prisma.reflection.findUnique({
            where: { id: id.trim() },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Reflection not found.",
            });
        }

        if (existing.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this reflection.",
            });
        }

        await prisma.reflection.delete({
            where: { id: existing.id },
        });

        res.status(200).json({
            success: true,
            message: "Reflection deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Delete a reflection by year for the authenticated user.
 */
export const deleteReflectionByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const parsedYear = validateYear(year);

        if (parsedYear === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid year parameter. Expected an integer between 1900 and 2100.",
            });
        }

        const existing = await prisma.reflection.findUnique({
            where: {
                userId_year: {
                    userId: req.user.id,
                    year: parsedYear,
                },
            },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: `Reflection not found for year ${parsedYear}.`,
            });
        }

        await prisma.reflection.delete({
            where: { id: existing.id },
        });

        res.status(200).json({
            success: true,
            message: "Reflection deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
