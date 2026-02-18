import "./Daily.css";
import { useState, useEffect, useMemo } from "react";

function Daily() {
    const [quests, setQuests] = useState([
        { id: "wake", title: "WakeUp Early", desc: "Start your day early", exp: 15, done: false },
        { id: "leetcode", title: "LeetCode Problem", desc: "Solve at least one problem", exp: 20, done: false },            
        { id: "workout", title: "Workout Session", desc: "Finish your workout routine", exp: 25, done: false },
        { id: "study", title: "Study 1 Hour", desc: "Dedicated learning time", exp: 30, done: false },
    ]);
    const questMap = useMemo(() => Object.fromEntries(quests.map(q => [q.id, q])), [quests]);

    const [dailyStats, setDailyStats] = useState({
        sleep: { start: "", end: "" },
        workout: { start: "", end: "", steps: 0 },
        study: { start: "", end: "" },
        screen: { phone: 0, laptop: 0 },
        water: 0
    });
    
    const [otherMistake, setOtherMistake] = useState("");
    const [showOtherMistake, setShowOtherMistake] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString("default", {month: "long"});
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const totalExp = quests.reduce(
        (sum, q) => sum + (q.done ? q.exp : 0), 0
    );
    const level = Math.floor(totalExp/50) + 1;
    const levelProgress = (totalExp % 50) * 2;
    const [mistakes, setMistakes] = useState([]);
    const mistakePenalty = mistakes.length * 5;
    const finalExp = Math.max(0, totalExp - mistakePenalty);

    const completedQuests = quests.filter(q => q.done).length;
    const completionPercent = quests.length ? Math.round((completedQuests / quests.length) * 100) : 0;

    const getSleepHours = () => {
        if(!dailyStats.sleep.start || !dailyStats.sleep.end) return 0;
        const diff = new Date(dailyStats.sleep.end) - new Date(dailyStats.sleep.start);
        return Math.max(0, diff / 3600000);
    };

    useEffect (() => {
        const { start, end } = dailyStats.study;
        if (!start || !end) return;
        const hrs = (new Date(end) - new Date(start)) / 3600000;
        const shouldBeDone = hrs >= 1;
        setQuests(prev => prev.map(q => q.id === "study" && q.done !== shouldBeDone? { ...q, done: shouldBeDone } : q))
    }, [dailyStats.study.start, dailyStats.study.end]);

    const calculateDuration = (start, end) => {
        if(!start || !end) return "-- hrs -- mins";
        const diff = new Date(end) - new Date(start);
        if (diff <= 0) return "-- hrs -- mins";
        const mins = Math.floor(diff/60000);
        return `${Math.floor(mins/60)} hrs ${mins % 60} mins`;
    }

    const calculateSleepDuration = () => calculateDuration(dailyStats.sleep.start, dailyStats.sleep.end);
    const calculateWorkoutDuration = () => calculateDuration(dailyStats.workout.start, dailyStats.workout.end);
    const calculateStudyDuration = () => calculateDuration(dailyStats.study.start, dailyStats.study.end);
    const calculateScreenDuration = () => {
        const phone = Number(dailyStats.screen.phone || 0); 
        const laptop = Number(dailyStats.screen.laptop || 0);
        return `${phone + laptop} hrs`
    }

    const [saving, setSaving] = useState(false);
    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 900);
    }

    return (
        <div className = "daily-page">
            {/* Daily-Header */}
            <div className = "daily-header">
                <h1>Daily Tracking</h1>
                <p>🔥 Never Give Up - Keep the streak alive!</p>
            </div>
            <div className = "daily-progress">
                <div className = "daily-header-left">
                    <div className = "daily-completion">
                        <svg className = "progress-ring" width="120" height="120">
                            <defs>
                                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor = "#00cfff" />
                                    <stop offset = "100%" stopColor = "#a855f7" />
                                </linearGradient>
                            </defs>
                            <circle className = "ring-bg" cx="60" cy="60" r="52" />
                            <circle className = "ring-progress" cx="60" cy="60" r="52" strokeDasharray= {326} strokeDashoffset = {326 - (326 * completionPercent) / 100} />
                        </svg>
                        <div className = "ring-text">
                            <strong>{completionPercent}%</strong>
                            <span> Completed</span>
                        </div>
                    </div>
                </div>
                <div className = "daily-header-middle">
                    <div className = "level-box">
                        <span className = "level-text">Level {level}</span>
                        <div className = "level-bar">
                            <div className = "level-fill" style={{ width: `${levelProgress}%` }} />
                        </div>
                        <span className = "exp-text">
                            { totalExp % 50 } / 50 EXP
                        </span>
                    </div>
                </div>
                <div className = "daily-header-right">
                    <p className = "exp-counter">⚡️ +{totalExp} EXP for Quests</p>
                    <p className = "exp-penalty">⚠️ -{mistakePenalty} EXP for {mistakes.length} Mistakes</p>
                    <p className = "exp-gained">❇️ {finalExp} EXP Earned Today</p>
                </div>
            </div>
            {/* Daily Quests */}
            <div className = "daily-card">
                <h2>Daily Quests</h2>
                {quests.map((q,i) => (
                    <div className = "quest-item" key={q.id}>
                        <div className = "quest-main">
                            <label className = "custom-checkbox">
                                <input type = "checkbox" checked={q.done} 
                                    onChange = {() => {
                                        setQuests(prev => 
                                            prev.map(item => item.id === q.id ? { ...item, done: !item.done} : item)
                                        );
                                    }}
                                />
                                <span className = "checkmark"></span>
                                <span className = "checkbox-text">
                                    <strong>{q.title}</strong>
                                </span>
                            </label>
                            <p>{q.desc}</p>
                            <div className = "quest-progress">
                                <div className = {`quest-progress-fill ${q.done ? "filled" : ""}`} />
                            </div>
                        </div>
                        <span className = "quest-exp">+{q.exp} EXP</span>
                    </div>
                ))}
            </div>
            {/* Streak Cards */}
            <div className = "streak-grid">
                {quests.map(q => (
                    <div className = {`streak-card ${q.done ? "streak-active" : ""}`} key={q.id}>
                        <h3>{q.title.split(" ")[0]}</h3>
                        <div className = "streak-count">
                            {q.done ? "🔥 Active" : "0 days"}
                        </div>
                        <p>{q.done ? "Keep it going!" : "Start your streak today!"}</p>
                    </div>
                ))}
            </div>
            {/* Main grid */}
            <div className = "daily-main-grid">
                {/* Left: Calendar */}
                <div className = "daily-card calendar-card">
                    <h3>Select Date</h3>
                    <div className = "glass-calendar">
                        <div className = "calendar-header">
                            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                                ‹
                            </button>
                            <span>{monthName} {year}</span>
                            <button onClick={() => setCurrentDate(new Date(year, month +  1, 1))}>
                                ›
                            </button>
                        </div>
                        <div className = "calendar-weekdays">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className = "calendar-grid">
                            {[...Array(firstDayOfMonth)].map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const dayDate = new Date(year, month, i + 1);
                                const isToday = isSameDay(dayDate, new Date());
                                const isSelected = isSameDay(dayDate, selectedDate);
                                return (
                                    <div key={`${year}-${month}-${i + 1}`} 
                                    className={`calendar-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                                    onClick = {() => setSelectedDate(dayDate)}>
                                        { i + 1 }
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* Right: Forms */}
                <div className = "daily-right">
                    {/* Sleep & Wake */}
                    <div className = "daily-card">
                        <h3>Sleep & Wake</h3>
                        <label className="custom-checkbox">
                            <input type="checkbox"
                                checked = {questMap.wake?.done}
                                onChange = {(e) => {setQuests(
                                    prev => prev.map(q => q.id === "wake" ? { ...q, done: e.target.checked} : q)
                                );
                                }} 
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">Wake up early</span>
                        </label>
                        <label>
                            <span>Sleep Start</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.sleep.start}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, sleep: { ...prev.sleep, start: e.target.value }
                                    }))
                                } 
                            />
                        </label>
                        <label>
                            <span>Sleep End / Wake Time</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.sleep.end}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, sleep: { ...prev.sleep, end: e.target.value }
                                    }))
                                }
                            />
                        </label>
                        <p className="muted-text">Total Sleep: {calculateSleepDuration()}</p>
                        <div className = "mini-bar">
                            <span 
                                style = {{ width: `${Math.min(getSleepHours() * 12, 100)}%` }}
                            />
                        </div>
                    </div>
                    {/* Activities */}
                    <div className = "daily-card">
                        <h3>Activities / Workout</h3>
                        <label className="custom-checkbox">
                            <input type="checkbox" 
                                checked = {questMap.leetcode?.done}
                                onChange = {(e) => {setQuests(
                                    prev => prev.map(q => q.id === "leetcode" ? { ...q, done: e.target.checked} : q)
                                );
                                }}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">LeetCode Solved</span>
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox"
                                checked = {questMap.workout?.done}
                                onChange = {(e) => {setQuests(
                                    prev => prev.map(q => q.id === "workout" ? { ... q, done: e.target.checked } : q)
                                );
                                }}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">Workout Done</span>
                        </label>
                        <label>
                            <span>Workout Type</span>
                            <select className = "glass-select">
                                <option>None</option>
                                <option>Gym</option>
                                <option>Running</option>
                                <option>Home workout</option>
                                <option>Rest</option>
                            </select>
                        </label>
                        <label>
                            <span>Steps Walked</span>
                            <input
                                type="number"
                                value={dailyStats.workout.steps}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, workout: { ...prev.workout, steps: Number(e.target.value) }
                                    }))
                                } 
                            />
                        </label>
                        <label>
                            <span>Workout Start</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.workout.start}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, workout: { ...prev.workout, start: e.target.value }
                                    }))
                                } 
                            />
                        </label>
                        <label>
                            <span>Workout End</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.workout.end}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, workout: { ...prev.workout, end: e.target.value }
                                    }))
                                } 
                            />
                        </label>
                        <p className = "muted-text">Total Workout Time: {calculateWorkoutDuration()}</p>
                    </div>
                    {/* Study & Screen Time */}
                    <div className = "daily-card">
                        <h3>Study & Screen Time</h3>
                        <label>
                            <span>Study Start</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.study.start}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, study: { ...prev.study, start: e.target.value }
                                    }))
                                } 
                            />
                        </label>
                        <label>
                            <span>Study End</span>
                            <input
                                type="datetime-local"
                                value={dailyStats.study.end}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, study: { ...prev.study, end: e.target.value }
                                    }))
                                } 
                            />
                        </label>
                        <p className = "muted-text">Total Study Time: {calculateStudyDuration()}</p>
                        <label>
                            <span>Phone Screen (hrs)</span>
                            <input
                                type="number"
                                value={dailyStats.screen.phone}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, screen: { ...prev.screen, phone: Number(e.target.value) }
                                    }))
                                } 
                            />
                        </label>
                        <label>
                            <span>Laptop Screen (hrs)</span>
                            <input
                                type="number"
                                value={dailyStats.screen.laptop}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, screen: { ...prev.screen, laptop: Number(e.target.value) }
                                    }))
                                } 
                            />
                        </label>
                        <p className = "muted-text">Total Screen Time (hrs): {calculateScreenDuration()}</p>
                        <label>
                            <span>Water (litres)</span>
                            <input
                                type="number"
                                value={dailyStats.water}
                                onChange = { (e) => 
                                    setDailyStats(prev => ({
                                        ...prev, water: Number(e.target.value)
                                    }))
                                }
                            />
                        </label>
                    </div>
                    {/* Mistakes */}
                    <div className = "daily-card">
                        <h3>Mistakes</h3>
                        <div className = "mistakes">
                            {["Junk Food", "Skipped Workout", "Overslept", "Overused Phone", "Other"].map((m, i) => (
                                <label key={i} className = "custom-checkbox" >
                                    <input 
                                        type = "checkbox"
                                        checked = {mistakes.includes(m)}
                                        onChange={(e) => {
                                            if (e.target.checked)
                                                setMistakes(prev => [...prev, m]);
                                            else
                                                setMistakes(prev => prev.filter(item => item !== m));
                                            if (m === "Other") setShowOtherMistake(e.target.checked);
                                        }} 
                                    />
                                    <span className = "checkmark"></span>
                                    <span className ="checkbox-text">{m}</span>
                                </label>
                            ))}
                        </div>
                        {showOtherMistake && (
                            <label className = "hidden-input">
                                <span>Specify Other Mistake</span>
                                <input type = "text" placeholder ="Describe the mistake..." value = {otherMistake} onChange={(e) => setOtherMistake(e.target.value)} />
                            </label>
                        )}
                    </div>
                    {/* Reflections */}
                    <div className = "daily-card">
                        <div className = "daily-reflections">
                            <h3>Reflections</h3>
                            <textarea placeholder = "What I learned" />
                            <textarea placeholder = "One thing I'm proud of" />
                            <textarea placeholder = "To improve tomorrow" />
                            <label className = "daily-mood">
                                <span>Mood (1 -10)</span>
                                <input type = "range" min = "1" max = "10" />
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className = "daily-actions">
                        <button className = {`btn-primary ${saving ? "saving" : ""}`} onClick = {handleSave}>
                            {saving ? "Saving..." : "Save Progress"}
                        </button>
                        <button className = "btn-secondary">Finalize Day</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Daily;