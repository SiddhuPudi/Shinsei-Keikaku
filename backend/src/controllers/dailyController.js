import prisma from "../config/prisma.js";

/**
 * Normalizes a date string or Date object to UTC midnight (start-of-day).
 * If dateInput is omitted, returns today at UTC midnight.
 * Returns null if the date input is invalid.
 */
export const normalizeDate = (dateInput) => {
    if (!dateInput) {
        const now = new Date();
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
        return null;
    }
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * List daily logs for the authenticated user with optional date filtering:
 * - ?date=YYYY-MM-DD
 * - ?startDate=YYYY-MM-DD (or ?from=)
 * - ?endDate=YYYY-MM-DD (or ?to=)
 * - ?limit=N
 */
export const getDailyLogs = async (req, res) => {
    try {
        const { date, startDate, from, endDate, to, limit } = req.query;
        const whereClause = {
            userId: req.user.id,
        };

        if (date !== undefined) {
            const targetDate = normalizeDate(date);
            if (!targetDate || String(date).trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date parameter. Expected YYYY-MM-DD or ISO 8601 string",
                });
            }
            const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
            whereClause.date = {
                gte: targetDate,
                lt: nextDay,
            };
        } else {
            const startInput = startDate || from;
            const endInput = endDate || to;

            let start = null;
            let end = null;

            if (startInput !== undefined) {
                start = normalizeDate(startInput);
                if (!start || String(startInput).trim() === "") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid startDate parameter. Expected YYYY-MM-DD or ISO 8601 string",
                    });
                }
            }

            if (endInput !== undefined) {
                end = normalizeDate(endInput);
                if (!end || String(endInput).trim() === "") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid endDate parameter. Expected YYYY-MM-DD or ISO 8601 string",
                    });
                }
            }

            if (start && end) {
                if (start > end) {
                    return res.status(400).json({
                        success: false,
                        message: "startDate cannot be after endDate",
                    });
                }
                const endNextDay = new Date(end.getTime() + 24 * 60 * 60 * 1000);
                whereClause.date = {
                    gte: start,
                    lt: endNextDay,
                };
            } else if (start) {
                whereClause.date = {
                    gte: start,
                };
            } else if (end) {
                const endNextDay = new Date(end.getTime() + 24 * 60 * 60 * 1000);
                whereClause.date = {
                    lt: endNextDay,
                };
            }
        }

        const queryOptions = {
            where: whereClause,
            orderBy: {
                date: "desc",
            },
        };

        if (limit !== undefined) {
            const parsedLimit = Number(limit);
            if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "limit must be a positive integer",
                });
            }
            queryOptions.take = parsedLimit;
        }

        const logs = await prisma.dailyLog.findMany(queryOptions);

        res.status(200).json({
            success: true,
            logs,
            dailyLogs: logs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single daily log by its unique ID, strictly scoped to authenticated user.
 */
export const getDailyLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const log = await prisma.dailyLog.findUnique({
            where: { id },
        });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Daily log not found",
            });
        }

        if (log.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this daily log",
            });
        }

        res.status(200).json({
            success: true,
            log,
            dailyLog: log,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Retrieve a single daily log for a specific date (YYYY-MM-DD).
 */
export const getDailyLogByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = normalizeDate(date);

        if (!targetDate || String(date).trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 string",
            });
        }

        const log = await prisma.dailyLog.findUnique({
            where: {
                userId_date: {
                    userId: req.user.id,
                    date: targetDate,
                },
            },
        });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Daily log not found for this date",
            });
        }

        res.status(200).json({
            success: true,
            log,
            dailyLog: log,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Create or Upsert a daily log for the authenticated user:
 * Because schema enforces @@unique([userId, date]), if a log for this date already exists,
 * it updates the existing log (upsert flow).
 */
export const createDailyLog = async (req, res) => {
    try {
        const {
            date,
            sleepHours,
            waterLiters,
            studyHours,
            workoutDone,
            leetcodeSolved,
            mistakesCount,
            mood,
            journal,
        } = req.body;

        const targetDate = normalizeDate(date);
        if (!targetDate) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 string",
            });
        }

        // Validate optional numeric/boolean/text fields
        let numSleepHours = null;
        if (sleepHours !== undefined && sleepHours !== null && sleepHours !== "") {
            numSleepHours = Number(sleepHours);
            if (isNaN(numSleepHours) || numSleepHours < 0 || numSleepHours > 24) {
                return res.status(400).json({
                    success: false,
                    message: "sleepHours must be a number between 0 and 24",
                });
            }
        }

        let numWaterLiters = null;
        if (waterLiters !== undefined && waterLiters !== null && waterLiters !== "") {
            numWaterLiters = Number(waterLiters);
            if (isNaN(numWaterLiters) || numWaterLiters < 0) {
                return res.status(400).json({
                    success: false,
                    message: "waterLiters must be a non-negative number",
                });
            }
        }

        let numStudyHours = null;
        if (studyHours !== undefined && studyHours !== null && studyHours !== "") {
            numStudyHours = Number(studyHours);
            if (isNaN(numStudyHours) || numStudyHours < 0 || numStudyHours > 24) {
                return res.status(400).json({
                    success: false,
                    message: "studyHours must be a number between 0 and 24",
                });
            }
        }

        let numLeetcode = 0;
        if (leetcodeSolved !== undefined && leetcodeSolved !== null && leetcodeSolved !== "") {
            numLeetcode = Number(leetcodeSolved);
            if (!Number.isInteger(numLeetcode) || numLeetcode < 0) {
                return res.status(400).json({
                    success: false,
                    message: "leetcodeSolved must be a non-negative integer",
                });
            }
        }

        let numMistakes = 0;
        if (mistakesCount !== undefined && mistakesCount !== null && mistakesCount !== "") {
            numMistakes = Number(mistakesCount);
            if (!Number.isInteger(numMistakes) || numMistakes < 0) {
                return res.status(400).json({
                    success: false,
                    message: "mistakesCount must be a non-negative integer",
                });
            }
        }

        const isWorkoutDone = workoutDone !== undefined ? Boolean(workoutDone) : false;
        const moodVal = mood !== undefined && mood !== null ? String(mood).trim() : null;
        const journalVal = journal !== undefined && journal !== null ? String(journal).trim() : null;

        // Check for existing log on this date (per-day uniqueness)
        const existingLog = await prisma.dailyLog.findUnique({
            where: {
                userId_date: {
                    userId: req.user.id,
                    date: targetDate,
                },
            },
        });

        if (existingLog) {
            // Upsert update
            const updatePayload = {};
            if (sleepHours !== undefined) updatePayload.sleepHours = numSleepHours;
            if (waterLiters !== undefined) updatePayload.waterLiters = numWaterLiters;
            if (studyHours !== undefined) updatePayload.studyHours = numStudyHours;
            if (workoutDone !== undefined) updatePayload.workoutDone = isWorkoutDone;
            if (leetcodeSolved !== undefined) updatePayload.leetcodeSolved = numLeetcode;
            if (mistakesCount !== undefined) updatePayload.mistakesCount = numMistakes;
            if (mood !== undefined) updatePayload.mood = moodVal;
            if (journal !== undefined) updatePayload.journal = journalVal;

            const updated = await prisma.dailyLog.update({
                where: { id: existingLog.id },
                data: updatePayload,
            });

            return res.status(200).json({
                success: true,
                log: updated,
                dailyLog: updated,
                message: "Daily log updated successfully",
            });
        }

        const created = await prisma.dailyLog.create({
            data: {
                userId: req.user.id,
                date: targetDate,
                sleepHours: numSleepHours,
                waterLiters: numWaterLiters,
                studyHours: numStudyHours,
                workoutDone: isWorkoutDone,
                leetcodeSolved: numLeetcode,
                mistakesCount: numMistakes,
                mood: moodVal,
                journal: journalVal,
            },
        });

        res.status(201).json({
            success: true,
            log: created,
            dailyLog: created,
            message: "Daily log created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update an existing daily log by ID.
 */
export const updateDailyLog = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            date,
            sleepHours,
            waterLiters,
            studyHours,
            workoutDone,
            leetcodeSolved,
            mistakesCount,
            mood,
            journal,
        } = req.body;

        const existingLog = await prisma.dailyLog.findUnique({
            where: { id },
        });

        if (!existingLog) {
            return res.status(404).json({
                success: false,
                message: "Daily log not found",
            });
        }

        if (existingLog.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this daily log",
            });
        }

        const updatedData = {};

        if (date !== undefined) {
            const targetDate = normalizeDate(date);
            if (!targetDate) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 string",
                });
            }

            if (targetDate.getTime() !== new Date(existingLog.date).getTime()) {
                const duplicate = await prisma.dailyLog.findUnique({
                    where: {
                        userId_date: {
                            userId: req.user.id,
                            date: targetDate,
                        },
                    },
                });

                if (duplicate && duplicate.id !== id) {
                    return res.status(409).json({
                        success: false,
                        message: "A daily log for this date already exists",
                    });
                }
                updatedData.date = targetDate;
            }
        }

        if (sleepHours !== undefined) {
            if (sleepHours === null || sleepHours === "") {
                updatedData.sleepHours = null;
            } else {
                const num = Number(sleepHours);
                if (isNaN(num) || num < 0 || num > 24) {
                    return res.status(400).json({
                        success: false,
                        message: "sleepHours must be a number between 0 and 24",
                    });
                }
                updatedData.sleepHours = num;
            }
        }

        if (waterLiters !== undefined) {
            if (waterLiters === null || waterLiters === "") {
                updatedData.waterLiters = null;
            } else {
                const num = Number(waterLiters);
                if (isNaN(num) || num < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "waterLiters must be a non-negative number",
                    });
                }
                updatedData.waterLiters = num;
            }
        }

        if (studyHours !== undefined) {
            if (studyHours === null || studyHours === "") {
                updatedData.studyHours = null;
            } else {
                const num = Number(studyHours);
                if (isNaN(num) || num < 0 || num > 24) {
                    return res.status(400).json({
                        success: false,
                        message: "studyHours must be a number between 0 and 24",
                    });
                }
                updatedData.studyHours = num;
            }
        }

        if (workoutDone !== undefined) {
            updatedData.workoutDone = Boolean(workoutDone);
        }

        if (leetcodeSolved !== undefined) {
            const num = Number(leetcodeSolved);
            if (!Number.isInteger(num) || num < 0) {
                return res.status(400).json({
                    success: false,
                    message: "leetcodeSolved must be a non-negative integer",
                });
            }
            updatedData.leetcodeSolved = num;
        }

        if (mistakesCount !== undefined) {
            const num = Number(mistakesCount);
            if (!Number.isInteger(num) || num < 0) {
                return res.status(400).json({
                    success: false,
                    message: "mistakesCount must be a non-negative integer",
                });
            }
            updatedData.mistakesCount = num;
        }

        if (mood !== undefined) {
            updatedData.mood = mood !== null ? String(mood).trim() : null;
        }

        if (journal !== undefined) {
            updatedData.journal = journal !== null ? String(journal).trim() : null;
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update",
            });
        }

        const updated = await prisma.dailyLog.update({
            where: { id },
            data: updatedData,
        });

        res.status(200).json({
            success: true,
            log: updated,
            dailyLog: updated,
            message: "Daily log updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Delete a daily log by ID.
 */
export const deleteDailyLog = async (req, res) => {
    try {
        const { id } = req.params;

        const existingLog = await prisma.dailyLog.findUnique({
            where: { id },
        });

        if (!existingLog) {
            return res.status(404).json({
                success: false,
                message: "Daily log not found",
            });
        }

        if (existingLog.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this daily log",
            });
        }

        await prisma.dailyLog.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Daily log deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Aliases for flexible naming
export const getLogs = getDailyLogs;
export const getLogById = getDailyLogById;
export const getLogByDate = getDailyLogByDate;
export const createLog = createDailyLog;
export const updateLog = updateDailyLog;
export const deleteLog = deleteDailyLog;
