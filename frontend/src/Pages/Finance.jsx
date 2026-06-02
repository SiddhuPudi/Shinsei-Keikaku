import "./Finance.css";
import { useState, useEffect } from "react";
import { getTransactions, createTransaction, deleteTransaction } from "../api/financeApi";

const CATEGORY_OPTIONS = ["food", "fitness", "learning", "entertainment", "transport", "health", "shopping", "housing", "savings", "other"];
const GOAL_ICONS = ["🛡️", "💻", "✈️", "🏠", "🚗", "🎓", "💍", "🎮", "💪", "📈"];

const MONTH_LABELS = {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December",
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function buildMonthlyBreakdown(txns) {
    const map = {};
    txns.forEach(t => {
        const [year, month] = t.date.split("-");
        const key = `${year}-${month}`;
        if (!map[key]) map[key] = { key, year, month, income: 0, expense: 0 };
        if (t.type === "income") map[key].income += t.amount;
        else map[key].expense += Math.abs(t.amount);
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

function buildYearlyBreakdown(txns) {
    const map = {};
    txns.forEach(t => {
        const year = t.date.split("-")[0];
        if (!map[year]) map[year] = { year, income: 0, expense: 0 };
        if (t.type === "income") map[year].income += t.amount;
        else map[year].expense += Math.abs(t.amount);
    });
    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

const budgetCategories = [
    { label: "Food", icon: "🍔", spent: 3200, budget: 5000, color: "#fb7185" },
    { label: "Fitness", icon: "⚔️", spent: 1200, budget: 2000, color: "#38bdf8" },
    { label: "Learning", icon: "📚", spent: 1820, budget: 3000, color: "#a78bfa" },
    { label: "Entertainment", icon: "🎮", spent: 1049, budget: 1500, color: "#f59e0b" },
    { label: "Transport", icon: "🚗", spent: 800, budget: 2000, color: "#34d399" },
    { label: "Savings", icon: "💰", spent: 12000, budget: 15000, color: "#00cfff" },
];

const categoryColors = {
    food: "#fb7185", income: "#34d399", fitness: "#38bdf8",
    learning: "#a78bfa", entertainment: "#f59e0b", transport: "#34d399",
    health: "#f472b6", shopping: "#facc15", housing: "#60a5fa",
    savings: "#00cfff", other: "#9ca3af",
};

const initialSavingsGoals = [
    { id: "s1", title: "Emergency Fund", current: 25000, target: 50000, icon: "🛡️" },
    { id: "s2", title: "New Laptop", current: 32000, target: 80000, icon: "💻" },
    { id: "s3", title: "Travel Fund", current: 8000, target: 30000, icon: "✈️" },
];

// ─── Add Transaction Modal ─────────────────────────────────────────────────────
function AddTransactionModal({ onClose, onAdd }) {
    const [form, setForm] = useState({
        desc: "", type: "expense", category: "food",
        amount: "", date: new Date().toISOString().split("T")[0],
    });
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!form.desc.trim() || !form.amount) return;
        const amt = Number(form.amount);
        try {
            await onAdd({
                id: crypto.randomUUID(),
                desc: form.desc,
                type: form.type,
                category: form.type === "income" ? "income" : form.category,
                amount: form.type === "income" ? amt : -amt,
                date: form.date,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal" onClick={e => e.stopPropagation()}>
                <div className="fin-modal-header">
                    <h2>Add Transaction</h2>
                    <button className="fin-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="fin-type-toggle">
                    {["expense", "income"].map(t => (
                        <button
                            key={t}
                            className={`fin-type-btn ${form.type === t ? "active-" + t : ""}`}
                            onClick={() => set("type", t)}
                        >
                            {t === "income" ? "💰 Income" : "💸 Expense"}
                        </button>
                    ))}
                </div>

                <label className="fin-modal-gap">
                    Description
                    <input
                        placeholder="What was this for?"
                        value={form.desc}
                        onChange={e => set("desc", e.target.value)}
                    />
                </label>

                <div className="fin-modal-row">
                    <label>
                        Amount (₹)
                        <input
                            type="number" min="1" placeholder="0"
                            value={form.amount}
                            onChange={e => set("amount", e.target.value)}
                        />
                    </label>
                    <label>
                        Date
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => set("date", e.target.value)}
                        />
                    </label>
                </div>

                {form.type === "expense" && (
                    <label className="fin-modal-gap">
                        Category
                        <select value={form.category} onChange={e => set("category", e.target.value)}>
                            {CATEGORY_OPTIONS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </label>
                )}

                <p className="fin-auto-classify">
                    {form.type === "income" ? "✅ Will be classified as income" : "🏷️ Will be tagged under selected category"}
                </p>

                <div className="fin-modal-actions">
                    <button className="fin-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="fin-create-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            "+ Add"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add Goal Modal ────────────────────────────────────────────────────────────
function AddGoalModal({ onClose, onAdd }) {
    const [form, setForm] = useState({
        title: "", target: "", current: "0", icon: "🛡️",
    });
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = () => {
        if (!form.title.trim() || !form.target) return;
        onAdd({
            id: crypto.randomUUID(),
            title: form.title,
            target: Number(form.target),
            current: Number(form.current),
            icon: form.icon,
        });
        onClose();
    };

    const pct = form.target ? Math.min(Math.round((Number(form.current) / Number(form.target)) * 100), 100) : 0;

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal" onClick={e => e.stopPropagation()}>
                <div className="fin-modal-header">
                    <h2>Add Savings Goal</h2>
                    <button className="fin-modal-close" onClick={onClose}>×</button>
                </div>

                <label className="fin-modal-gap">
                    Goal Name
                    <input
                        placeholder="e.g. Emergency Fund, New Laptop..."
                        value={form.title}
                        onChange={e => set("title", e.target.value)}
                    />
                </label>

                <div className="fin-modal-row">
                    <label>
                        Target Amount (₹)
                        <input
                            type="number" min="1" placeholder="0"
                            value={form.target}
                            onChange={e => set("target", e.target.value)}
                        />
                    </label>
                    <label>
                        Already Saved (₹)
                        <input
                            type="number" min="0" placeholder="0"
                            value={form.current}
                            onChange={e => set("current", e.target.value)}
                        />
                    </label>
                </div>

                <label>
                    Icon
                    <div className="fin-icon-picker">
                        {GOAL_ICONS.map(ic => (
                            <button
                                key={ic}
                                className={`fin-icon-btn ${form.icon === ic ? "selected" : ""}`}
                                onClick={() => set("icon", ic)}
                                type="button"
                            >
                                {ic}
                            </button>
                        ))}
                    </div>
                </label>

                {form.target > 0 && (
                    <div className="fin-goal-preview">
                        <div className="fin-goal-preview-top">
                            <span>{form.icon} {form.title || "Your Goal"}</span>
                            <span className="fin-goal-preview-pct">{pct}%</span>
                        </div>
                        <div className="fin-goal-preview-track">
                            <div className="fin-goal-preview-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="fin-auto-classify">
                            ₹{Number(form.current).toLocaleString()} saved · ₹{Number(form.target).toLocaleString()} goal
                        </p>
                    </div>
                )}

                <div className="fin-modal-actions">
                    <button className="fin-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="fin-create-btn" onClick={handleSubmit}>Create Goal</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Finance Page ─────────────────────────────────────────────────────────
function Finance() {
    const [activeTab, setActiveTab] = useState("overview");
    const [txFilter, setTxFilter] = useState("all");
    const [analysisPeriod, setAnalysisPeriod] = useState("monthly");
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState(initialSavingsGoals);
    const [showTxModal, setShowTxModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);
    const fetchTransactions = async () => {
        try {
            const data = await getTransactions();
            const formatted = data.map(tx => ({
                ...tx,
                desc: tx.description,
                category: tx.category.toLowerCase(),
                type: tx.type.toLowerCase(),
                amount: tx.type === "EXPENSE" ? -Number(tx.amount) : Number(tx.amount),
                date: tx.date.split("T")[0],
            }));
            setTransactions(formatted);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        }
    };

    const filteredTx = transactions.filter(t => txFilter === "all" ? true : t.type === txFilter);
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = Math.abs(transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
    const netBalance = totalIncome - totalExpense;

    const addTransaction = async(tx) => {
        try {
            const created = await createTransaction({
                description: tx.desc,
                category: tx.type === "income" ? "OTHER" : tx.category.toUpperCase(),
                amount: Math.abs(tx.amount),
                type: tx.type.toUpperCase(),
                date: tx.date,
            });
            setTransactions(prev => [
                {
                    ...created,
                    desc: created.description,
                    category: created.category.toLowerCase(),
                    type: created.type.toLowerCase(),
                    amount: created.type === "EXPENSE" ? -Number(created.amount) : Number(created.amount),
                    date: created.date.split("T")[0],
                },
                ...prev,
            ]);
        } catch(error) {
            console.error("Failed to create transaction:", error);
        }
    };
    const handleDeleteTransaction = async (id) => {
        try{
            await deleteTransaction(id);
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch(error) {
            console.error("Failed to delete transaction:", error);
        }
    };
    const addGoal = g => setGoals(prev => [g, ...prev]);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    const TAB_LABELS = {
        overview: "📊 Overview",
        transactions: "📋 Transactions",
        budgets: "🗂️ Budgets",
        goals: "🎯 Goals",
        analysis: "📈 Analysis",
    };

    return (
        <div className="finance-page">
            {/* Header */}
            <div className="finance-header">
                <h1>Finance Tracker</h1>
                <p>💰 Master your money, master your life</p>
            </div>

            {/* Tabs */}
            <div className="finance-tabs">
                {["overview", "transactions", "budgets", "goals", "analysis"].map(t => (
                    <button
                        key={t}
                        className={`finance-tab ${activeTab === t ? "active" : ""}${t === "analysis" ? " analysis-tab-btn" : ""}`}
                        onClick={() => setActiveTab(t)}
                    >
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            {/* ── Overview ─────────────────────────────────────────────────── */}
            {activeTab === "overview" && (
                <>
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
                                {savingsRate}%
                            </span>
                        </div>
                    </div>

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
                                            <div className="budget-fill" style={{ width: `${pct}%`, background: over ? "#fb7185" : b.color }} />
                                        </div>
                                        <span className="budget-pct" style={{ color: over ? "#fb7185" : "#9ca3af" }}>
                                            {over ? "Over budget!" : `${pct}%`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="finance-card">
                        <h2>Recent Transactions</h2>
                        <div className="tx-list">
                            {transactions.slice(0, 6).map(t => (
                                <div key={t.id} className={`tx-row ${t.type}`}>
                                    <div className="tx-dot" style={{ background: categoryColors[t.category] || "#9ca3af" }} />
                                    <div className="tx-info">
                                        <span className="tx-desc">{t.desc}</span>
                                        <span className="tx-date">{t.date}</span>
                                    </div>
                                    <span className="tx-cat-badge" style={{ color: categoryColors[t.category], background: `${categoryColors[t.category]}18` }}>
                                        {t.category}
                                    </span>
                                    <div className="tx-actions">
                                        <span className={`tx-amount ${t.type}`}>
                                            {t.type === "income" ? "+" : "-"}
                                            ₹{Math.abs(t.amount).toLocaleString()}
                                        </span>
                                        <button
                                            className="tx-delete-btn"
                                            onClick={() => {
                                                const confirmed = window.confirm("Are you sure to delete this transaction?");
                                                if (confirmed) {
                                                    handleDeleteTransaction(t.id);
                                                }
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── Transactions ─────────────────────────────────────────────── */}
            {activeTab === "transactions" && (
                <div className="finance-card">
                    <div className="tx-header-row">
                        <h2>All Transactions</h2>
                        <div className="tx-right-controls">
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
                            <button className="tx-add-inline-btn" onClick={() => setShowTxModal(true)}>
                                + Add Transaction
                            </button>
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
                                <div className="tx-actions">
                                    <span className={`tx-amount ${t.type}`}>
                                        {t.type === "income" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}
                                    </span>
                                    <button
                                        className="tx-delete-btn"
                                        onClick={() => {
                                            const confirmed = window.confirm("Are you sure to delete this transaction?");
                                            if (confirmed) {
                                                handleDeleteTransaction(t.id);
                                            }
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>  
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Budgets ──────────────────────────────────────────────────── */}
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

            {/* ── Goals ────────────────────────────────────────────────────── */}
            {activeTab === "goals" && (
                <div className="finance-card">
                    <div className="fin-goal-bar">
                        <div>
                            <h3>🎯 Savings Goals</h3>
                            <p>Set targets and track your financial milestones</p>
                        </div>
                        <button className="fin-create-goal-btn" onClick={() => setShowGoalModal(true)}>
                            + Add Savings Goal
                        </button>
                    </div>
                    <div className="savings-goals">
                        {goals.map(g => {
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
                                            <div className="sg-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
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
                </div>
            )}

            {/* ── Analysis ─────────────────────────────────────────────────── */}
            {activeTab === "analysis" && (() => {
                const monthlyBreakdown = buildMonthlyBreakdown(transactions);
                const yearlyBreakdown = buildYearlyBreakdown(transactions);
                const isMonthly = analysisPeriod === "monthly";
                const rows = isMonthly ? monthlyBreakdown : yearlyBreakdown;
                const maxVal = Math.max(...rows.flatMap(r => [r.income, r.expense]), 1);
                return (
                    <div className="analysis-wrapper">
                        {/* Sub-toggle */}
                        <div className="analysis-toggle-bar">
                            <div className="analysis-toggle">
                                <button
                                    className={`analysis-toggle-btn ${analysisPeriod === "monthly" ? "active" : ""}`}
                                    onClick={() => setAnalysisPeriod("monthly")}
                                >
                                    📅 Monthly
                                </button>
                                <button
                                    className={`analysis-toggle-btn ${analysisPeriod === "yearly" ? "active" : ""}`}
                                    onClick={() => setAnalysisPeriod("yearly")}
                                >
                                    🗓️ Yearly
                                </button>
                            </div>
                            <div className="breakdown-legend">
                                <span className="legend-dot income-dot" /> Income&nbsp;&nbsp;
                                <span className="legend-dot expense-dot" /> Expense
                            </div>
                        </div>

                        {/* KPI strip */}
                        <div className="analysis-kpi-strip">
                            {rows.map(r => {
                                const net = r.income - r.expense;
                                const label = isMonthly
                                    ? `${MONTH_LABELS[r.month]?.slice(0, 3)} ${r.year}`
                                    : r.year;
                                const rate = r.income > 0 ? Math.round((net / r.income) * 100) : 0;
                                return (
                                    <div key={isMonthly ? r.key : r.year}
                                        className={`analysis-kpi-card ${net >= 0 ? "kpi-positive" : "kpi-negative"}`}>
                                        <span className="akpi-period">{label}</span>
                                        <span className="akpi-income">+₹{r.income.toLocaleString()}</span>
                                        <span className="akpi-expense">-₹{r.expense.toLocaleString()}</span>
                                        <span className={`akpi-net ${net >= 0 ? "pos" : "neg"}`}>
                                            {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
                                        </span>
                                        <span className="akpi-rate">{rate}% saved</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bar chart */}
                        <div className="analysis-chart-card">
                            <div className="analysis-chart-header">
                                <h3>{isMonthly ? "📅 Month-by-Month" : "🗓️ Year-by-Year"} · Income vs Expense</h3>
                            </div>
                            <div className="breakdown-table">
                                {rows.map(r => {
                                    const net = r.income - r.expense;
                                    const inPct = Math.round((r.income / maxVal) * 100);
                                    const exPct = Math.round((r.expense / maxVal) * 100);
                                    const label = isMonthly ? MONTH_LABELS[r.month]?.slice(0, 3) : r.year;
                                    return (
                                        <div key={isMonthly ? r.key : r.year}
                                            className={`breakdown-row ${!isMonthly ? "yearly-row" : ""}`}>
                                            <span className={`breakdown-period ${!isMonthly ? "yr-period" : ""}`}>
                                                {label}
                                                {isMonthly && <span className="breakdown-year">{r.year}</span>}
                                            </span>
                                            <div className="breakdown-bars">
                                                <div className="breakdown-bar-wrap">
                                                    <span className="breakdown-bar-label income-label">₹{r.income.toLocaleString()}</span>
                                                    <div className={`breakdown-bar-track ${!isMonthly ? "thick-track" : ""}`}>
                                                        <div className="breakdown-bar income-bar" style={{ width: `${inPct}%` }} />
                                                    </div>
                                                </div>
                                                <div className="breakdown-bar-wrap">
                                                    <span className="breakdown-bar-label expense-label">₹{r.expense.toLocaleString()}</span>
                                                    <div className={`breakdown-bar-track ${!isMonthly ? "thick-track" : ""}`}>
                                                        <div className="breakdown-bar expense-bar" style={{ width: `${exPct}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="yr-badges">
                                                <span className={`breakdown-net ${net >= 0 ? "positive" : "negative"}`}>
                                                    {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
                                                </span>
                                                {!isMonthly && (
                                                    <span className="saved-rate-badge">
                                                        {r.income > 0 ? Math.round((net / r.income) * 100) : 0}% saved
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Modals ───────────────────────────────────────────────────── */}
            {showTxModal && <AddTransactionModal onClose={() => setShowTxModal(false)} onAdd={addTransaction} />}
            {showGoalModal && <AddGoalModal onClose={() => setShowGoalModal(false)} onAdd={addGoal} />}
        </div>
    );
}

export default Finance;