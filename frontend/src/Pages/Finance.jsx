import "./Finance.css";
import { useState } from "react";

const transactions = [
    { id: "t1", date: "2025-03-04", desc: "Grocery Shopping", category: "food", amount: -850, type: "expense" },
    { id: "t2", date: "2025-03-03", desc: "Freelance Payment", category: "income", amount: 8500, type: "income" },
    { id: "t3", date: "2025-03-03", desc: "Gym Membership", category: "fitness", amount: -1200, type: "expense" },
    { id: "t4", date: "2025-03-02", desc: "Online Course", category: "learning", amount: -1500, type: "expense" },
    { id: "t5", date: "2025-03-01", desc: "Salary", category: "income", amount: 45000, type: "income" },
    { id: "t6", date: "2025-03-01", desc: "Netflix", category: "entertainment", amount: -649, type: "expense" },
    { id: "t7", date: "2025-02-28", desc: "Coffee", category: "food", amount: -180, type: "expense" },
    { id: "t8", date: "2025-02-27", desc: "Book Purchase", category: "learning", amount: -320, type: "expense" },
];

const budgetCategories = [
    { label: "Food", icon: "🍔", spent: 3200, budget: 5000, color: "#fb7185" },
    { label: "Fitness", icon: "⚔️", spent: 1200, budget: 2000, color: "#38bdf8" },
    { label: "Learning", icon: "📚", spent: 1820, budget: 3000, color: "#a78bfa" },
    { label: "Entertainment", icon: "🎮", spent: 1049, budget: 1500, color: "#f59e0b" },
    { label: "Transport", icon: "🚗", spent: 800, budget: 2000, color: "#34d399" },
    { label: "Savings", icon: "💰", spent: 12000, budget: 15000, color: "#00cfff" },
];

const categoryColors = {
    food: "#fb7185",
    income: "#34d399",
    fitness: "#38bdf8",
    learning: "#a78bfa",
    entertainment: "#f59e0b",
    transport: "#34d399",
};

const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
const totalExpense = Math.abs(transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
const netBalance = totalIncome - totalExpense;

const savingsGoals = [
    { id: "s1", title: "Emergency Fund", current: 25000, target: 50000, icon: "🛡️" },
    { id: "s2", title: "New Laptop", current: 32000, target: 80000, icon: "💻" },
    { id: "s3", title: "Travel Fund", current: 8000, target: 30000, icon: "✈️" },
];

function Finance() {
    const [activeTab, setActiveTab] = useState("overview");
    const [txFilter, setTxFilter] = useState("all");

    const filteredTx = transactions.filter(t =>
        txFilter === "all" ? true : t.type === txFilter
    );

    return (
        <div className="finance-page">
            {/* Header */}
            <div className="finance-header">
                <h1>Finance Tracker</h1>
                <p>💰 Master your money, master your life</p>
            </div>

            {/* Tabs */}
            <div className="finance-tabs">
                {["overview", "transactions", "budgets", "goals"].map(t => (
                    <button
                        key={t}
                        className={`finance-tab ${activeTab === t ? "active" : ""}`}
                        onClick={() => setActiveTab(t)}
                    >
                        {{ overview: "📊 Overview", transactions: "📋 Transactions", budgets: "🗂️ Budgets", goals: "🎯 Goals" }[t]}
                    </button>
                ))}
            </div>

            {activeTab === "overview" && (
                <>
                    {/* Balance Cards */}
                    <div className="finance-balance-row">
                        <div className="balance-card balance-net">
                            <span className="bal-label">Net Balance</span>
                            <span className="bal-value" style={{ color: netBalance >= 0 ? "#34d399" : "#fb7185" }}>
                                ₹{netBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="balance-card">
                            <span className="bal-label">Total Income</span>
                            <span className="bal-value income-val">₹{totalIncome.toLocaleString()}</span>
                        </div>
                        <div className="balance-card">
                            <span className="bal-label">Total Expenses</span>
                            <span className="bal-value expense-val">₹{totalExpense.toLocaleString()}</span>
                        </div>
                        <div className="balance-card">
                            <span className="bal-label">Savings Rate</span>
                            <span className="bal-value" style={{ color: "#a78bfa" }}>
                                {Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Budget Overview */}
                    <div className="finance-card">
                        <h2>Budget Overview</h2>
                        <div className="budget-grid">
                            {budgetCategories.map(b => {
                                const pct = Math.min(Math.round((b.spent / b.budget) * 100), 100);
                                const over = b.spent > b.budget;
                                return (
                                    <div key={b.label} className={`budget-item ${over ? "over-budget" : ""}`}>
                                        <div className="budget-top">
                                            <span>{b.icon} {b.label}</span>
                                            <span style={{ color: over ? "#fb7185" : b.color }}>
                                                ₹{b.spent.toLocaleString()} / ₹{b.budget.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="budget-track">
                                            <div
                                                className="budget-fill"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: over ? "#fb7185" : b.color,
                                                }}
                                            />
                                        </div>
                                        <span className="budget-pct" style={{ color: over ? "#fb7185" : "#9ca3af" }}>
                                            {over ? "Over budget!" : `${pct}%`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="finance-card">
                        <h2>Recent Transactions</h2>
                        <div className="tx-list">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t.id} className={`tx-row ${t.type}`}>
                                    <div className="tx-dot" style={{ background: categoryColors[t.category] || "#9ca3af" }} />
                                    <div className="tx-info">
                                        <span className="tx-desc">{t.desc}</span>
                                        <span className="tx-date">{t.date}</span>
                                    </div>
                                    <span className={`tx-cat-badge`} style={{ color: categoryColors[t.category], background: `${categoryColors[t.category]}18` }}>
                                        {t.category}
                                    </span>
                                    <span className={`tx-amount ${t.type}`}>
                                        {t.type === "income" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === "transactions" && (
                <div className="finance-card">
                    <div className="tx-header-row">
                        <h2>All Transactions</h2>
                        <div className="tx-filters">
                            {["all", "income", "expense"].map(f => (
                                <button
                                    key={f}
                                    className={`tx-filter-btn ${txFilter === f ? "active" : ""}`}
                                    onClick={() => setTxFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="tx-list">
                        {filteredTx.map(t => (
                            <div key={t.id} className={`tx-row ${t.type}`}>
                                <div className="tx-dot" style={{ background: categoryColors[t.category] || "#9ca3af" }} />
                                <div className="tx-info">
                                    <span className="tx-desc">{t.desc}</span>
                                    <span className="tx-date">{t.date}</span>
                                </div>
                                <span className="tx-cat-badge" style={{ color: categoryColors[t.category], background: `${categoryColors[t.category]}18` }}>
                                    {t.category}
                                </span>
                                <span className={`tx-amount ${t.type}`}>
                                    {t.type === "income" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="finance-add-btn">+ Add Transaction</button>
                </div>
            )}

            {activeTab === "budgets" && (
                <div className="finance-card">
                    <h2>Monthly Budgets</h2>
                    <div className="budget-detail-list">
                        {budgetCategories.map(b => {
                            const pct = Math.min(Math.round((b.spent / b.budget) * 100), 100);
                            const remaining = b.budget - b.spent;
                            const over = remaining < 0;
                            return (
                                <div key={b.label} className={`budget-detail-row ${over ? "over" : ""}`}>
                                    <div className="bdr-left">
                                        <span className="bdr-icon">{b.icon}</span>
                                        <div className="bdr-info">
                                            <span className="bdr-label">{b.label}</span>
                                            <span className="bdr-sub">Budget: ₹{b.budget.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="bdr-center">
                                        <div className="budget-track">
                                            <div className="budget-fill" style={{ width: `${pct}%`, background: over ? "#fb7185" : b.color }} />
                                        </div>
                                    </div>
                                    <div className="bdr-right">
                                        <span className="bdr-spent">₹{b.spent.toLocaleString()}</span>
                                        <span className={`bdr-remaining ${over ? "negative" : "positive"}`}>
                                            {over ? `-₹${Math.abs(remaining).toLocaleString()}` : `₹${remaining.toLocaleString()} left`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "goals" && (
                <div className="finance-card">
                    <h2>Savings Goals</h2>
                    <div className="savings-goals">
                        {savingsGoals.map(g => {
                            const pct = Math.round((g.current / g.target) * 100);
                            return (
                                <div key={g.id} className="savings-goal-card">
                                    <div className="sg-icon">{g.icon}</div>
                                    <div className="sg-body">
                                        <div className="sg-top">
                                            <span className="sg-title">{g.title}</span>
                                            <span className="sg-pct">{pct}%</span>
                                        </div>
                                        <div className="sg-track">
                                            <div className="sg-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="sg-bottom">
                                            <span>₹{g.current.toLocaleString()} saved</span>
                                            <span>Goal: ₹{g.target.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="finance-add-btn" style={{ marginTop: "20px" }}>+ Add Savings Goal</button>
                </div>
            )}
        </div>
    );
}

export default Finance;