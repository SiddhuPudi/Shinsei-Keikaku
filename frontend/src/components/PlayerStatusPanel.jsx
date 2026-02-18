import "./PlayerStatusPanel.css";

function PlayerStatusPanel( { username }) {
    return (
        <div className = "player-status-container">
            {/* Avatar + Name/Rank */}
            <div className = "player-header">
                <div className = "avatar-section">
                    <div className = "avatar-circle">
                        <span className = "avatar-initial">S</span>
                    </div>
                    <div className = "avatar-badge">Lvl 1</div>
                </div>
                <div className = "player-meta">
                    <h3 className = "player-name">{username}</h3>
                    <p className = "player-rank">E-Rank Trainee</p>
                </div>
            </div>

            {/* EXP */}
            <div className = "exp-section">
                <div className = "exp-row">
                    <span>Level 1</span>
                    <span>EXP 0 / 100</span>
                </div>
                <div className = "exp-bar">
                    <div className = "exp-fill" />
                </div>
            </div>

            {/* Combat Stats */}
            <h4 className = "stats-title">Combat Stats</h4>
            <div className = "stats-grid">
                <div className = "stat-item">
                    <div className = "stat-header">
                        <span>💪 Strength</span>
                        <span>1</span>
                    </div>
                    <div className = "stat-bar">
                        <div className = "stat-bar-fill"></div>
                    </div>
                </div>
                <div className = "stat-item">
                    <div className = "stat-header">
                        <span>🧠 Intellect</span>
                        <span>1</span>
                    </div>
                    <div className = "stat-bar">
                        <div className = "stat-bar-fill"></div>
                    </div>
                </div>
                <div className = "stat-item">
                    <div className = "stat-header">
                        <span>⚡️ Discipline</span>
                        <span>1</span>
                    </div>
                    <div className = "stat-bar">
                        <div className = "stat-bar-fill"></div>
                    </div>
                </div>
                <div className = "stat-item">
                    <div className = "stat-header">
                        <span>❤️ Vitality</span>
                        <span>1</span>
                    </div>
                    <div className = "stat-bar">
                        <div className = "stat-bar-fill"></div>
                    </div>
                </div>
                <div className = "stat-item">
                    <div className = "stat-header">
                        <span>🎯 Focus</span>
                        <span>1</span>
                    </div>
                    <div className = "stat-bar">
                        <div className = "stat-bar-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayerStatusPanel;