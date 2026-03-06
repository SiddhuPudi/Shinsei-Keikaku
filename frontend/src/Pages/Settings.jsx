import "./Settings.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const SECTIONS = ["Profile", "Preferences", "Notifications", "Quests", "Data", "About"];

const sectionIcons = {
    Profile: "👤",
    Preferences: "⚙️",
    Notifications: "🔔",
    Quests: "⚔️",
    Data: "🗄️",
    About: "ℹ️",
};

function Toggle({ on, onChange }) {
    return (
        <div className={`toggle-track ${on ? "on" : ""}`} onClick={onChange}>
            <div className="toggle-thumb" />
        </div>
    );
}

function Settings() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState("Profile");
    const [confirm, setConfirm] = useState(null); // { action: string, label: string }

    const [prefs, setPrefs] = useState({
        darkMode: true,
        accentColor: "cyan",
        compactView: false,
        animations: true,
        language: "English",
    });

    const [notifs, setNotifs] = useState({
        dailyReminder: true,
        streakAlert: true,
        weeklyReport: false,
        achievementPop: true,
        questDeadline: true,
    });

    const [questPrefs, setQuestPrefs] = useState({
        autoComplete: true,
        showExp: true,
        penaltySystem: true,
        difficulty: "Normal",
    });

    const togglePref = (key) =>
        setPrefs(p => ({ ...p, [key]: !p[key] }));
    const toggleNotif = (key) =>
        setNotifs(n => ({ ...n, [key]: !n[key] }));
    const toggleQuest = (key) =>
        setQuestPrefs(q => ({ ...q, [key]: !q[key] }));

    const ACCENT_COLORS = [
        { key: "cyan", color: "#00cfff" },
        { key: "purple", color: "#a855f7" },
        { key: "pink", color: "#ec4899" },
        { key: "green", color: "#34d399" },
        { key: "orange", color: "#f97316" },
    ];

    return (
        <div className="settings-page">
            {/* Header */}
            <div className="settings-header">
                <h1>Settings</h1>
                <p>⚙️ Customize your Shinsei Keikaku experience</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    {SECTIONS.map(s => (
                        <button
                            key={s}
                            className={`settings-nav-btn ${activeSection === s ? "active" : ""}`}
                            onClick={() => setActiveSection(s)}
                        >
                            <span className="nav-icon">{sectionIcons[s]}</span>
                            <span>{s}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="settings-content">

                    {activeSection === "Profile" && (
                        <div className="settings-card">
                            <h2>Profile</h2>
                            <div className="profile-avatar-row">
                                <div className="avatar-circle">
                                    {(user?.username?.[0] || "P").toUpperCase()}
                                </div>
                                <div>
                                    <p className="avatar-name">{user?.username || "Player"}</p>
                                    <p className="avatar-sub">Level 24 · 14,820 EXP</p>
                                </div>
                            </div>
                            <div className="settings-fields">
                                <label>
                                    <span>Username</span>
                                    <input defaultValue={user?.username || "Player"} />
                                </label>
                                <label>
                                    <span>Email</span>
                                    <input type="email" defaultValue={user?.email || "player@example.com"} />
                                </label>
                                <label>
                                    <span>Bio</span>
                                    <textarea placeholder="Tell your story..." rows={3} />
                                </label>
                                <label>
                                    <span>New Password</span>
                                    <input type="password" placeholder="••••••••" />
                                </label>
                                <label>
                                    <span>Confirm Password</span>
                                    <input type="password" placeholder="••••••••" />
                                </label>
                            </div>
                            <div className="settings-actions">
                                <button className="btn-primary">Save Changes</button>
                                <button className="btn-secondary">Cancel</button>
                            </div>
                        </div>
                    )}

                    {activeSection === "Preferences" && (
                        <div className="settings-card">
                            <h2>Preferences</h2>
                            <div className="pref-list">
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Dark Mode</span>
                                        <span className="pref-sub">Always dark — the grind never stops</span>
                                    </div>
                                    <Toggle on={prefs.darkMode} onChange={() => togglePref("darkMode")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Compact View</span>
                                        <span className="pref-sub">Reduce padding for denser layout</span>
                                    </div>
                                    <Toggle on={prefs.compactView} onChange={() => togglePref("compactView")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Animations</span>
                                        <span className="pref-sub">Card transitions and micro-animations</span>
                                    </div>
                                    <Toggle on={prefs.animations} onChange={() => togglePref("animations")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Language</span>
                                        <span className="pref-sub">Interface language</span>
                                    </div>
                                    <select
                                        className="settings-select"
                                        value={prefs.language}
                                        onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}
                                    >
                                        <option>English</option>
                                        <option>日本語</option>
                                        <option>हिन्दी</option>
                                    </select>
                                </div>
                            </div>
                            <div className="accent-section">
                                <span className="pref-label">Accent Color</span>
                                <div className="accent-colors">
                                    {ACCENT_COLORS.map(a => (
                                        <div
                                            key={a.key}
                                            className={`accent-dot ${prefs.accentColor === a.key ? "selected" : ""}`}
                                            style={{ background: a.color }}
                                            onClick={() => setPrefs(p => ({ ...p, accentColor: a.key }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Notifications" && (
                        <div className="settings-card">
                            <h2>Notifications</h2>
                            <div className="pref-list">
                                {[
                                    { key: "dailyReminder", label: "Daily Reminder", sub: "Get notified to log your day" },
                                    { key: "streakAlert", label: "Streak Alert", sub: "Warning when streak is at risk" },
                                    { key: "weeklyReport", label: "Weekly Report", sub: "Summary every Monday morning" },
                                    { key: "achievementPop", label: "Achievement Unlocked", sub: "Pop-up when you earn a badge" },
                                    { key: "questDeadline", label: "Quest Deadline", sub: "Reminder 1 hour before deadline" },
                                ].map(n => (
                                    <div className="pref-row" key={n.key}>
                                        <div>
                                            <span className="pref-label">{n.label}</span>
                                            <span className="pref-sub">{n.sub}</span>
                                        </div>
                                        <Toggle on={notifs[n.key]} onChange={() => toggleNotif(n.key)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "Quests" && (
                        <div className="settings-card">
                            <h2>Quest Settings</h2>
                            <div className="pref-list">
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Auto-complete Quests</span>
                                        <span className="pref-sub">Mark quests done based on logged data</span>
                                    </div>
                                    <Toggle on={questPrefs.autoComplete} onChange={() => toggleQuest("autoComplete")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Show EXP Values</span>
                                        <span className="pref-sub">Display EXP badges on quest cards</span>
                                    </div>
                                    <Toggle on={questPrefs.showExp} onChange={() => toggleQuest("showExp")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Mistake Penalty System</span>
                                        <span className="pref-sub">Deduct EXP for logged mistakes</span>
                                    </div>
                                    <Toggle on={questPrefs.penaltySystem} onChange={() => toggleQuest("penaltySystem")} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <span className="pref-label">Default Difficulty</span>
                                        <span className="pref-sub">For new custom quests</span>
                                    </div>
                                    <select
                                        className="settings-select"
                                        value={questPrefs.difficulty}
                                        onChange={e => setQuestPrefs(q => ({ ...q, difficulty: e.target.value }))}
                                    >
                                        <option>Easy</option>
                                        <option>Normal</option>
                                        <option>Hard</option>
                                        <option>Extreme</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Data" && (
                        <div className="settings-card">
                            <h2>Data &amp; Privacy</h2>

                            {/* ── Confirmation Modal ── */}
                            {confirm && (
                                <div className="data-confirm-overlay">
                                    <div className="data-confirm-box">
                                        <span className="data-confirm-icon">⚠️</span>
                                        <h4 className="data-confirm-title">Are you sure?</h4>
                                        <p className="data-confirm-msg">
                                            This will <strong>{confirm.label}</strong>. This action
                                            cannot be undone.
                                        </p>
                                        <div className="data-confirm-actions">
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setConfirm(null)}
                                            >
                                                Go Back
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => {
                                                    /* TODO: wire real action here */
                                                    setConfirm(null);
                                                }}
                                            >
                                                Yes, {confirm.action}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="data-section">
                                <div className="data-item">
                                    <div>
                                        <span className="pref-label">Export All Data</span>
                                        <span className="pref-sub">Download your data as JSON</span>
                                    </div>
                                    <button className="btn-secondary">Export</button>
                                </div>
                                <div className="data-item">
                                    <div>
                                        <span className="pref-label">Import Data</span>
                                        <span className="pref-sub">Restore from a previous export</span>
                                    </div>
                                    <button className="btn-secondary">Import</button>
                                </div>
                                <div className="data-item">
                                    <div>
                                        <span className="pref-label">Clear Daily Logs</span>
                                        <span className="pref-sub">Remove all daily tracking history</span>
                                    </div>
                                    <button
                                        className="btn-danger"
                                        onClick={() => setConfirm({ action: "Clear", label: "permanently clear all daily logs" })}
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="data-item">
                                    <div>
                                        <span className="pref-label">Delete Account</span>
                                        <span className="pref-sub">Permanently delete all your data</span>
                                    </div>
                                    <button
                                        className="btn-danger"
                                        onClick={() => setConfirm({ action: "Delete", label: "permanently delete your account and all data" })}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "About" && (
                        <div className="settings-card">
                            <h2>About</h2>
                            <div className="about-box">
                                <div className="about-logo">
                                    <span>新</span>
                                </div>
                                <h3>Shinsei Keikaku</h3>
                                <p className="about-tagline">Track. Grow. Evolve.</p>
                                <div className="about-info">
                                    <div className="about-row">
                                        <span>Version</span><span>v1.0.0</span>
                                    </div>
                                    <div className="about-row">
                                        <span>Build</span><span>2025.03</span>
                                    </div>
                                    <div className="about-row">
                                        <span>Philosophy</span><span>新生計画 · New Life Plan</span>
                                    </div>
                                </div>
                                <p className="about-desc">
                                    Shinsei Keikaku is a personal growth OS built for those who treat their life like a game worth mastering. Level up every single day.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Settings;