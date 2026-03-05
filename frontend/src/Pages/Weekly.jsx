import "./Weekly.css";
import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const initialWeeklyData = {
    Mon: { workout: true, leetcode: true, wakeEarly: true, study: true },
    Tue: { workout: true, leetcode: false, wakeEarly: true, study: true },
    Wed: { workout: false, leetcode: true, wakeEarly: false, study: true },
    Thu: { workout: true, leetcode: true, wakeEarly: true, study: false },
    Fri: { workout: false, leetcode: false, wakeEarly: true, study: true },
    Sat: { workout: true, leetcode: true, wakeEarly: false, study: false },
    Sun: { workout: false, leetcode: false, wakeEarly: false, study: false },
};

const HABITS = [
    { key: "wakeEarly", label: "Wake Early", icon: "🌅", color: "#f59e0b" },
    { key: "workout", label: "Workout", icon: "⚔️", color: "#fb7185" },
    { key: "leetcode", label: "LeetCode", icon: "💻", color: "#38bdf8" },
    { key: "study", label: "Study", icon: "📚", color: "#a78bfa" },
];

const weeklyGoals = [
    { id: "g1", title: "Complete 5 Workouts", target: 5, current: 4, exp: 80 },
    { id: "g2", title: "Solve 7 LeetCode", target: 7, current: 4, exp: 100 },
    { id: "g3", title: "Study 7 Hours", target: 7, current: 5, exp: 90 },
    { id: "g4", title: "Wake Early 5 days", target: 5, current: 4, exp: 60 },
];

function Weekly() {
    const [data] = useState(initialWeeklyData);

    const getScore = (day) =>
        Object.values(data[day]).filter(Boolean).length;

    const totalDone = DAYS.reduce((sum, d) => sum + getScore(d), 0);
    const totalPossible = DAYS.length * HABITS.length;
    const weekPct = Math.round((totalDone / totalPossible) * 100);

    const habitTotals = HABITS.map((h) => ({
        ...h,
        done: DAYS.filter((d) => data[d][h.key]).length,
    }));

    return (
        <div className="weekly-page">
            {/* Header */}
            <div className="weekly-header">
                <h1>Weekly Overview</h1>
                <p>📅 Track your consistency across the week</p>
            </div>

            {/* Stats */}
            <div className="weekly-stats">
                <div className="wk-stat-card">
                    <span className="wk-stat-value">{weekPct}%</span>
                    <span className="wk-stat-label">Consistency</span>
                </div>
                <div className="wk-stat-card">
                    <span className="wk-stat-value" style={{ color: "#38bdf8" }}>{totalDone}</span>
                    <span className="wk-stat-label">Tasks Done</span>
                </div>
                <div className="wk-stat-card">
                    <span className="wk-stat-value" style={{ color: "#fb7185" }}>{totalPossible - totalDone}</span>
                    <span className="wk-stat-label">Missed</span>
                </div>
                <div className="wk-stat-card">
                    <span className="wk-stat-value" style={{ color: "#34d399" }}>
                        {DAYS.filter(d => getScore(d) === HABITS.length).length}
                    </span>
                    <span className="wk-stat-label">Perfect Days</span>
                </div>
            </div>

            {/* Habit Heatmap Grid */}
            <div className="weekly-card">
                <h2>Habit Heatmap</h2>
                <div className="heatmap-grid">
                    <div className="heatmap-row heatmap-header">
                        <span className="heatmap-habit-label" />
                        {DAYS.map(d => (
                            <span key={d} className="heatmap-day-label">{d}</span>
                        ))}
                    </div>
                    {HABITS.map(h => (
                        <div key={h.key} className="heatmap-row">
                            <span className="heatmap-habit-label">
                                <span>{h.icon}</span> {h.label}
                            </span>
                            {DAYS.map(d => (
                                <div
                                    key={d}
                                    className={`heatmap-cell ${data[d][h.key] ? "done" : "miss"}`}
                                    style={{ "--cell-color": h.color }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Day score bar chart */}
            <div className="weekly-card">
                <h2>Daily Performance</h2>
                <div className="daily-bar-chart">
                    {DAYS.map(d => {
                        const score = getScore(d);
                        const pct = (score / HABITS.length) * 100;
                        return (
                            <div key={d} className="bar-col">
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{ height: `${pct}%` }}
                                    />
                                </div>
                                <span className="bar-label">{d}</span>
                                <span className="bar-score">{score}/{HABITS.length}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Habit Breakdown */}
            <div className="weekly-card">
                <h2>Habit Breakdown</h2>
                <div className="habit-breakdown">
                    {habitTotals.map(h => (
                        <div key={h.key} className="habit-row">
                            <div className="habit-row-left">
                                <span className="habit-icon">{h.icon}</span>
                                <span className="habit-name">{h.label}</span>
                            </div>
                            <div className="habit-bar-track">
                                <div
                                    className="habit-bar-fill"
                                    style={{ width: `${(h.done / 7) * 100}%`, background: h.color }}
                                />
                            </div>
                            <span className="habit-count" style={{ color: h.color }}>{h.done}/7</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Goals */}
            <div className="weekly-card">
                <h2>Weekly Goals</h2>
                <div className="weekly-goals">
                    {weeklyGoals.map(g => {
                        const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
                        return (
                            <div key={g.id} className={`goal-item ${pct >= 100 ? "goal-done" : ""}`}>
                                <div className="goal-top">
                                    <span className="goal-title">{g.title}</span>
                                    <span className="goal-exp">+{g.exp} EXP</span>
                                </div>
                                <div className="goal-progress-track">
                                    <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="goal-bottom">
                                    <span>{g.current} / {g.target}</span>
                                    <span>{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Weekly;