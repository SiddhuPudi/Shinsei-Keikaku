import "./Achievements.css";
import { useState } from "react";

const allAchievements = [
    {
        id: "a1",
        title: "First Step",
        desc: "Complete your very first daily quest",
        icon: "🌟",
        category: "milestone",
        rarity: "common",
        unlocked: true,
        unlockedDate: "2025-01-15",
        exp: 50,
    },
    {
        id: "a2",
        title: "Iron Will",
        desc: "Maintain a 7-day streak",
        icon: "🔥",
        category: "streak",
        rarity: "rare",
        unlocked: true,
        unlockedDate: "2025-01-22",
        exp: 100,
    },
    {
        id: "a3",
        title: "Warrior's Path",
        desc: "Complete 30 workout sessions",
        icon: "⚔️",
        category: "fitness",
        rarity: "epic",
        unlocked: true,
        unlockedDate: "2025-02-08",
        exp: 200,
    },
    {
        id: "a4",
        title: "Scholar",
        desc: "Accumulate 50 hours of study time",
        icon: "📚",
        category: "intellect",
        rarity: "rare",
        unlocked: false,
        progress: 32,
        target: 50,
        exp: 150,
    },
    {
        id: "a5",
        title: "Legendary Streak",
        desc: "Maintain a 30-day streak",
        icon: "👑",
        category: "streak",
        rarity: "legendary",
        unlocked: false,
        progress: 7,
        target: 30,
        exp: 500,
    },
    {
        id: "a6",
        title: "Code Master",
        desc: "Solve 100 LeetCode problems",
        icon: "💻",
        category: "intellect",
        rarity: "epic",
        unlocked: false,
        progress: 47,
        target: 100,
        exp: 300,
    },
    {
        id: "a7",
        title: "Early Bird",
        desc: "Wake up before 6am for 14 days",
        icon: "🌅",
        category: "discipline",
        rarity: "rare",
        unlocked: false,
        progress: 5,
        target: 14,
        exp: 150,
    },
    {
        id: "a8",
        title: "Hydration Hero",
        desc: "Drink 2L of water for 21 days straight",
        icon: "💧",
        category: "fitness",
        rarity: "uncommon",
        unlocked: false,
        progress: 8,
        target: 21,
        exp: 100,
    },
    {
        id: "a9",
        title: "Zero Mistakes",
        desc: "Complete a week with no logged mistakes",
        icon: "✨",
        category: "discipline",
        rarity: "epic",
        unlocked: false,
        progress: 3,
        target: 7,
        exp: 250,
    },
];

const rarityColors = {
    common: { color: "#94a3b8", glow: "rgba(148, 163, 184, 0.4)" },
    uncommon: { color: "#34d399", glow: "rgba(52, 211, 153, 0.4)" },
    rare: { color: "#38bdf8", glow: "rgba(56, 189, 248, 0.5)" },
    epic: { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.5)" },
    legendary: { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)" },
};

function Achievements() {
    const [filter, setFilter] = useState("all");

    const filtered = allAchievements.filter((a) => {
        // Strip leading emoji + space from filter values like "🔥 streak" → "streak"
        const f = filter.includes(" ") ? filter.split(" ").slice(1).join(" ") : filter;
        if (f === "all") return true;
        if (f === "unlocked") return a.unlocked;
        if (f === "locked") return !a.unlocked;
        return a.category === f;
    });

    const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
    const totalCount = allAchievements.length;
    const totalExp = allAchievements
        .filter((a) => a.unlocked)
        .reduce((sum, a) => sum + a.exp, 0);

    return (
        <div className="achievements-page">
            {/* Header */}
            <div className="achievements-header">
                <h1>Achievements</h1>
                <p>🏆 Milestones earned through discipline and grind</p>
            </div>

            {/* Stats Row */}
            <div className="achievements-stats">
                <div className="ach-stat-card">
                    <span className="ach-stat-value">{unlockedCount}/{totalCount}</span>
                    <span className="ach-stat-label">Unlocked</span>
                </div>
                <div className="ach-stat-card">
                    <span className="ach-stat-value" style={{ color: "#f59e0b" }}>{allAchievements.filter(a => a.rarity === "legendary" && a.unlocked).length}</span>
                    <span className="ach-stat-label">Legendary</span>
                </div>
                <div className="ach-stat-card">
                    <span className="ach-stat-value" style={{ color: "#38bdf8" }}>+{totalExp}</span>
                    <span className="ach-stat-label">EXP Earned</span>
                </div>
                <div className="ach-stat-card">
                    <span className="ach-stat-value" style={{ color: "#34d399" }}>
                        {Math.round((unlockedCount / totalCount) * 100)}%
                    </span>
                    <span className="ach-stat-label">Completion</span>
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="ach-overall-progress">
                <div className="ach-progress-label">
                    <span>Overall Progress</span>
                    <span>{unlockedCount} of {totalCount} achievements</span>
                </div>
                <div className="ach-progress-track">
                    <div
                        className="ach-progress-fill"
                        style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="ach-filters">
                {["all", "🔓 unlocked", "🔒 locked", "🔥 streak", "⚔️ fitness", "🧠 intellect", "🎯 discipline", "🏆 milestone"].map((f) => (
                    <button
                        key={f}
                        className={`ach-filter-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Achievement Grid */}
            <div className="achievements-grid">
                {filtered.map((a) => {
                    const rarity = rarityColors[a.rarity];
                    const progressPct = a.target ? Math.round((a.progress / a.target) * 100) : 0;
                    return (
                        <div
                            key={a.id}
                            className={`ach-card ${a.unlocked ? "unlocked" : "locked"}`}
                            style={{ "--rarity-color": rarity.color, "--rarity-glow": rarity.glow }}
                        >
                            <div className="ach-card-top">
                                <div className="ach-icon">{a.icon}</div>
                                <div className="ach-info">
                                    <h3>{a.title}</h3>
                                    <p>{a.desc}</p>
                                    {a.unlocked && (
                                        <span className="ach-date">Unlocked {a.unlockedDate}</span>
                                    )}
                                </div>
                                <div className="ach-right">
                                    <span className={`ach-rarity ${a.rarity}`}>{a.rarity}</span>
                                    <span className="ach-exp">+{a.exp} EXP</span>
                                </div>
                            </div>
                            {!a.unlocked && a.target && (
                                <div className="ach-locked-progress">
                                    <div className="ach-locked-label">
                                        <span>{a.progress} / {a.target}</span>
                                        <span>{progressPct}%</span>
                                    </div>
                                    <div className="ach-locked-track">
                                        <div className="ach-locked-fill" style={{ width: `${progressPct}%` }} />
                                    </div>
                                </div>
                            )}
                            {a.unlocked && (
                                <div className="ach-unlocked-badge">✓ COMPLETED</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Achievements;