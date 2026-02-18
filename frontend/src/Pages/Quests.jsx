import "./Quests.css";
import { useState } from "react";

function Quests() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [difficulty, setDifficulty] = useState("Normal");
  const difficultyMap = {
    Easy: { exp: 15, stat: 1 },
    Normal: { exp: 25, stat: 1 },
    Hard: { exp: 35, stat: 2 },
    Extreme: { exp: 50, stat: 3 }
  };
  const [quests, setQuests] = useState([
    {
      id: "q1",
      title: "Wake Up Early",
      desc: "Build disipline by waking early",
      type: "daily",
      exp: 20,
      stat: "discipline",
      statPoints: 1,
      progress: 100,
      completed: false
    },
    {
      id: "q2",
      title: "Workout",
      desc: "Complete a workout session",
      type: "daily",
      exp: 25,
      stat: "strength",
      statPoints: 1,
      progress: 100,
      completed: false
    },
    {
      id: "q3",
      title: "Study Consistency",
      desc: "Study at least 1 hour for 5 days",
      type: "weekly",
      progress: 3,
      target: 5,
      exp: 50,
      stat: "intellect",
      statPoints: 3,
      completed: false
    },
    {
      id: "q4",
      title: "Build Coding Discipline",
      desc: "Improve problem solving skills",
      type: "long",
      exp: 80,
      stat: "intellect",
      statPoints: 1,
      progress: 40,
      target: 100,
      milestone: ["Start habit", "Consistency", "Mastery"],
      completed: false
    }
  ]);
  const [filter, setFilter] = useState("all");
  const filterQuests = quests.filter(q => {
    if (filter === "all") return true;
    if (filter === "completed") return q.completed;
    return q.type === filter && !q.completed;
  });
  return (
    <div className = "quests-page">
      <div className = "quests-header">
        <h1>Quest Log</h1>
        <p>Your active objectives and long-term missions</p>
      </div>
      <div className = "custom-quest-bar">
        <div>
          <h3>✨ Custom Quests</h3>
          <p>Create pesonalized challenge</p>
        </div>
        <button className = "create-quest-btn" onClick = {() => setShowCreateModal(true)}>
          + Create Custom Quest
        </button>
      </div>
      <div className = "quest-filters">
        {["all", "daily", "weekly", "long", "completed"].map(f => (
          <button 
            key = {f}
            className = {`filter-btn ${filter === f ? "active" : ""}`}
            onClick = {() => setFilter(f)}>
              {f}
          </button>
        ))}
      </div>
      <div className = "quest-list">
        {filterQuests.length === 0 ? (
          <div className = "empty-quests">
            <p>No quests here yet.</p>
            <span>Complete or create quests to see them appear.</span>
          </div>
        ) : (
          filterQuests.map(q => (
            <div key={q.id} className = {`quest-card ${q.completed ? "completed" : ""}`} data-type = {q.type}>
              <div className = "quest-alignment">
                <div className = "quest-main">
                  <h3>{q.title}</h3>                
                  <p>{q.desc}</p>
                </div>
                <div className = {`quest-status ${q.completed ? "completed" : "active"}`}>
                  {q.completed ? "COMPLETED" : "ACTIVE"}
                </div>
                <div className = "quest-badges">
                  <span className = "exp-badges">+{q.exp} EXP</span>
                  <span className = {`stat-badge ${q.stat}`}>
                    +{q.statPoints} {q.stat}
                  </span>
                </div>
              </div>
              <div className = "quest-progress">
                <div className = "quest-progress-fill" style = {{ width: `${q.progress}%` }} />
              </div>
            </div>
          ))
        )} 
      </div>
      {showCreateModal && (
        <div className = "quest-modal-overlay">
          <div className = "quest-modal">
            <div className = "modal-header">
              <h2>Create Custom Quest</h2>
              <button className = "modal-close" onClick = {() => setShowCreateModal(false)}>×</button>
            </div>
            <label className = "quest-modal-gap">
              Quest Name
              <input placeholder = "Enter Quest Name" />
            </label>
            <label>
              Description
              <input placeholder = "Describe the challenge" />
            </label>
            <div className = "modal-row">
              <label>
                Stat Category
                <select>
                  <option>Select</option>
                  <option>💪 Strength</option>
                  <option>🧠 Intellect</option>
                  <option>⚡️ Discipline</option>
                  <option>❤️ Vitality</option>
                  <option>🎯 Focus</option>
                </select>
              </label>
              <label>
                Difficulty
                <select value = {difficulty} onChange = { e => setDifficulty(e.target.value)}>
                  {Object.keys(difficultyMap).map(d => (
                    <option key = {d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Deadline
              <input type = "date" />
            </label>
            <p className = "auto-classify">
              ⏳ Auto classified as <strong>Long-term</strong>
            </p>
            <div className = "modal-row">
              <label>
                EXP Reward
                <input value = {difficultyMap[difficulty].exp} readOnly />
              </label>
              <label>
                Stat Reward
                <input value = { `+${difficultyMap[difficulty].stat}` } readOnly />
              </label>
            </div>
            <div className = "modal-actions">
              <button className = "cancel-btn" onClick = {() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className = "create-btn"
                onClick={() => {
                  const newQuest = {
                  id: crypto.randomUUID(),
                  title: "New Custom Quest",
                  desc: "User created quest",
                  type: "long",
                  exp: difficultyMap[difficulty].exp,
                  stat: "discipline",
                  statPoints: difficultyMap[difficulty].stat,
                  progress: 0,
                  completed: false
                  };
                  setQuests(prev => [newQuest, ...prev]);
                  setShowCreateModal(false);
                }}>
                  Create Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Quests;