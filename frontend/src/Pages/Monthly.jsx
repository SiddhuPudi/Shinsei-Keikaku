import "./Monthly.css";
import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyData = [
    { month: "Jan", score: 78, exp: 980, workouts: 20, studyHrs: 38, streak: 14 },
    { month: "Feb", score: 83, exp: 1120, workouts: 22, studyHrs: 44, streak: 21 },
    { month: "Mar", score: 91, exp: 1340, workouts: 25, studyHrs: 52, streak: 28 },
];

const currentMonth = {
    score: 74,
    exp: 820,
    workouts: { done: 16, target: 22 },
    studyHrs: { done: 34, target: 50 },
    wakeEarly: { done: 18, target: 26 },
    leetcode: { done: 12, target: 20 },
    mistakes: 8,
    perfectDays: 6,
};

const monthlyGoals = [
    { id: "m1", title: "Complete 22 Workouts", current: currentMonth.workouts.done, target: currentMonth.workouts.target, exp: 300 },
    { id: "m2", title: "Study 50 Hours", current: currentMonth.studyHrs.done, target: currentMonth.studyHrs.target, exp: 350 },
    { id: "m3", title: "Wake Early 25 Days", current: currentMonth.wakeEarly.done, target: currentMonth.wakeEarly.target, exp: 200 },
    { id: "m4", title: "Solve 20 LeetCode", current: currentMonth.leetcode.done, target: currentMonth.leetcode.target, exp: 280 },
];

function Monthly() {
    const [activeTab, setActiveTab] = useState("current");

    return (
        <div className="monthly-page">
            {/* Header */}
            <div className="monthly-header">
                <h1>Monthly Review</h1>
                <p>📊 Deep-dive into your monthly performance</p>
            </div>

            {/* Tabs */}
            <div className="monthly-tabs">
                {["current", "history"].map(t => (
                    <button
                        key={t}
                        className={`monthly-tab ${activeTab === t ? "active" : ""}`}
                        onClick={() => setActiveTab(t)}
                    >
                        {t === "current" ? "📅 This Month" : "🗂️ History"}
                    </button>
                ))}
            </div>

            {activeTab === "current" && (
                <>
                    {/* KPI Cards */}
                    <div className="monthly-stats">
                        {[
                            { label: "Month Score", value: `${currentMonth.score}%`, color: "#a78bfa" },
                            { label: "EXP Earned", value: `+${currentMonth.exp}`, color: "#38bdf8" },
                            { label: "Perfect Days", value: currentMonth.perfectDays, color: "#34d399" },
                            { label: "Mistakes", value: currentMonth.mistakes, color: "#fb7185" },
                        ].map(s => (
                            <div className="mo-stat-card" key={s.label}>
                                <span className="mo-stat-value" style={{ color: s.color }}>{s.value}</span>
                                <span className="mo-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Goals */}
                    <div className="monthly-card">
                        <h2>Monthly Goals</h2>
                        <div className="monthly-goals-grid">
                            {monthlyGoals.map(g => {
                                const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
                                return (
                                    <div key={g.id} className={`mo-goal-card ${pct >= 100 ? "done" : ""}`}>
                                        <div className="mo-goal-top">
                                            <span className="mo-goal-title">{g.title}</span>
                                            <span className="mo-goal-exp">+{g.exp}</span>
                                        </div>
                                        <div className="mo-goal-track">
                                            <div className="mo-goal-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="mo-goal-bottom">
                                            <span>{g.current} / {g.target}</span>
                                            <span className={pct >= 100 ? "done-label" : ""}>{pct >= 100 ? "✓ Done" : `${pct}%`}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="monthly-card">
                        <h2>Activity Summary</h2>
                        <div className="activity-summary">
                            {[
                                { label: "Workouts", done: currentMonth.workouts.done, target: currentMonth.workouts.target, color: "#fb7185", icon: "⚔️" },
                                { label: "Study Hrs", done: currentMonth.studyHrs.done, target: currentMonth.studyHrs.target, color: "#a78bfa", icon: "📚" },
                                { label: "Wake Early", done: currentMonth.wakeEarly.done, target: currentMonth.wakeEarly.target, color: "#f59e0b", icon: "🌅" },
                                { label: "LeetCode", done: currentMonth.leetcode.done, target: currentMonth.leetcode.target, color: "#38bdf8", icon: "💻" },
                            ].map(a => (
                                <div key={a.label} className="activity-row">
                                    <span className="act-icon">{a.icon}</span>
                                    <span className="act-label">{a.label}</span>
                                    <div className="act-track">
                                        <div
                                            className="act-fill"
                                            style={{
                                                width: `${Math.min((a.done / a.target) * 100, 100)}%`,
                                                background: a.color,
                                            }}
                                        />
                                    </div>
                                    <span className="act-count" style={{ color: a.color }}>
                                        {a.done}/{a.target}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reflection */}
                    <div className="monthly-card">
                        <h2>Month Reflection</h2>
                        <div className="monthly-reflections">
                            <label>
                                <span>Key Win this Month</span>
                                <textarea placeholder="What did you achieve?" />
                            </label>
                            <label>
                                <span>Biggest Challenge</span>
                                <textarea placeholder="What held you back?" />
                            </label>
                            <label>
                                <span>Focus for Next Month</span>
                                <textarea placeholder="What will you improve?" />
                            </label>
                        </div>
                        <div className="monthly-actions">
                            <button className="btn-primary">Save Reflection</button>
                            <button className="btn-secondary">Export Report</button>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "history" && (
                <div className="monthly-card">
                    <h2>Past Months</h2>
                    <div className="history-list">
                        {monthlyData.map((m, i) => (
                            <div key={i} className="history-row">
                                <span className="history-month">{m.month}</span>
                                <div className="history-bar-track">
                                    <div className="history-bar-fill" style={{ width: `${m.score}%` }} />
                                </div>
                                <span className="history-score">{m.score}%</span>
                                <span className="history-exp">+{m.exp} EXP</span>
                                <span className="history-detail">💪 {m.workouts} | 📚 {m.studyHrs}h | 🔥 {m.streak}d</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Monthly;