import "./Yearly.css";
import { useState } from "react";

const yearlyStats = {
    totalExp: 14820,
    level: 24,
    levelProgress: 60,
    longestStreak: 34,
    currentStreak: 7,
    perfectDays: 68,
    totalWorkouts: 198,
    totalStudyHrs: 430,
    totalLeetcode: 186,
    totalMistakes: 94,
};

const monthlyBreakdown = [
    { month: "Jan", score: 72, exp: 880 },
    { month: "Feb", score: 78, exp: 980 },
    { month: "Mar", score: 85, exp: 1100 },
    { month: "Apr", score: 80, exp: 1040 },
    { month: "May", score: 88, exp: 1200 },
    { month: "Jun", score: 91, exp: 1340 },
    { month: "Jul", score: 76, exp: 960 },
    { month: "Aug", score: 83, exp: 1080 },
    { month: "Sep", score: 90, exp: 1280 },
    { month: "Oct", score: 87, exp: 1160 },
    { month: "Nov", score: 93, exp: 1440 },
    { month: "Dec", score: 74, exp: 960 },
];

const yearlyGoals = [
    { id: "y1", title: "200+ Workout Sessions", current: 198, target: 200, exp: 2000 },
    { id: "y2", title: "500 Study Hours", current: 430, target: 500, exp: 3000 },
    { id: "y3", title: "Solve 200 LeetCode", current: 186, target: 200, exp: 2500 },
    { id: "y4", title: "50-day Streak", current: 34, target: 50, exp: 1500 },
];

const statHighlights = [
    { label: "Best Month", value: "Nov", sub: "93% score", color: "#f59e0b", icon: "👑" },
    { label: "Worst Month", value: "Jan", sub: "72% score", color: "#fb7185", icon: "📉" },
    { label: "Max Streak", value: "34d", sub: "days in a row", color: "#34d399", icon: "🔥" },
    { label: "Total Level", value: `Lv ${yearlyStats.level}`, sub: `${yearlyStats.levelProgress}% to next`, color: "#a78bfa", icon: "⚡" },
];

function Yearly() {
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const maxScore = Math.max(...monthlyBreakdown.map(m => m.score));

    return (
        <div className="yearly-page">
            {/* Header */}
            <div className="yearly-header">
                <h1>Yearly Overview</h1>
                <p>🗓️ A full-year snapshot of your growth and discipline</p>
            </div>

            {/* KPI Cards */}
            <div className="yearly-kpis">
                <div className="yr-kpi-card primary-kpi">
                    <div className="yr-kpi-icon">⚡</div>
                    <span className="yr-kpi-value">{yearlyStats.totalExp.toLocaleString()}</span>
                    <span className="yr-kpi-label">Total EXP Earned</span>
                </div>
                {[
                    { label: "Workouts", value: yearlyStats.totalWorkouts, color: "#fb7185" },
                    { label: "Study Hours", value: yearlyStats.totalStudyHrs, color: "#a78bfa" },
                    { label: "LeetCode", value: yearlyStats.totalLeetcode, color: "#38bdf8" },
                    { label: "Perfect Days", value: yearlyStats.perfectDays, color: "#34d399" },
                    { label: "Mistakes", value: yearlyStats.totalMistakes, color: "#9ca3af" },
                ].map(k => (
                    <div className="yr-kpi-card" key={k.label}>
                        <span className="yr-kpi-value" style={{ color: k.color }}>{k.value}</span>
                        <span className="yr-kpi-label">{k.label}</span>
                    </div>
                ))}
            </div>

            {/* Monthly score chart */}
            <div className="yearly-card">
                <h2>Monthly Score Chart</h2>
                <div className="yr-chart">
                    {monthlyBreakdown.map((m, i) => (
                        <div
                            key={i}
                            className={`yr-bar-col ${hoveredMonth === i ? "hovered" : ""}`}
                            onMouseEnter={() => setHoveredMonth(i)}
                            onMouseLeave={() => setHoveredMonth(null)}
                        >
                            {hoveredMonth === i && (
                                <div className="yr-tooltip">
                                    <strong>{m.score}%</strong>
                                    <span>+{m.exp} EXP</span>
                                </div>
                            )}
                            <div className="yr-bar-track">
                                <div
                                    className={`yr-bar-fill ${m.score === maxScore ? "best" : ""}`}
                                    style={{ height: `${m.score}%` }}
                                />
                            </div>
                            <span className="yr-bar-label">{m.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Highlights */}
            <div className="yearly-highlights">
                {statHighlights.map((h, i) => (
                    <div className="yr-highlight-card" key={i}>
                        <div className="yr-highlight-icon">{h.icon}</div>
                        <div className="yr-highlight-info">
                            <span className="yr-highlight-label">{h.label}</span>
                            <span className="yr-highlight-value" style={{ color: h.color }}>{h.value}</span>
                            <span className="yr-highlight-sub">{h.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Yearly Goals */}
            <div className="yearly-card">
                <h2>Yearly Goals</h2>
                <div className="yr-goals">
                    {yearlyGoals.map(g => {
                        const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
                        return (
                            <div key={g.id} className={`yr-goal-row ${pct >= 100 ? "done" : ""}`}>
                                <div className="yr-goal-left">
                                    <span className="yr-goal-title">{g.title}</span>
                                    <span className="yr-goal-progress-text">{g.current} / {g.target}</span>
                                </div>
                                <div className="yr-goal-center">
                                    <div className="yr-goal-track">
                                        <div className="yr-goal-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                                <div className="yr-goal-right">
                                    <span className="yr-goal-pct">{pct >= 100 ? "✓" : `${pct}%`}</span>
                                    <span className="yr-goal-exp">+{g.exp}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Year Reflection */}
            <div className="yearly-card">
                <h2>Year Reflection</h2>
                <div className="yr-reflections">
                    <label>
                        <span>Greatest Achievement</span>
                        <textarea placeholder="What are you most proud of this year?" />
                    </label>
                    <label>
                        <span>Biggest Lesson</span>
                        <textarea placeholder="What did you learn about yourself?" />
                    </label>
                    <label>
                        <span>Vision for Next Year</span>
                        <textarea placeholder="Who do you want to become?" />
                    </label>
                </div>
                <div className="yr-actions">
                    <button className="btn-primary">Save Reflection</button>
                    <button className="btn-secondary">Export Year Report</button>
                </div>
            </div>
        </div>
    );
}

export default Yearly;