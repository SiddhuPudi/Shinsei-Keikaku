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

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
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

app.get("/", (req, res) => {
    res.status(200).json({
        message: `Backend is running successfully`
    })
})

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: `Shinsei Keikaku backend is healthy`,
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});