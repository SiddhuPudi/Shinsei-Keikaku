import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import dailyRoutes from "./routes/dailyRoutes.js";
import questRoutes from "./routes/questRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import reflectionRoutes from "./routes/reflectionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/daily-logs", dailyRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: `Backend is running successfully`
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: `Shinsei Keikaku backend is healthy`,
    });
});

// Fallback 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error caught by server middleware:", err);
    if (res.headersSent) {
        return next(err);
    }
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload",
        });
    }
    res.status(err.status || 500).json({
        success: false,
        message: "Internal server error",
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});