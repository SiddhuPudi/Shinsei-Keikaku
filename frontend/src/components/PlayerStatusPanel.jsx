import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FriendsPanel from "./FriendsPanel";
import "./PlayerStatusPanel.css";

function PlayerStatusPanel({ username }) {
    const [showFriends, setShowFriends] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});
    const triggerRef = useRef(null);

    /* Recalculate popup position whenever it opens */
    useEffect(() => {
        if (!showFriends || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const popupW = 360;
        const gap = 12;

        /* Try to place it below the button; shift left if it would overflow viewport */
        let left = rect.left;
        if (left + popupW > window.innerWidth - 16) {
            left = window.innerWidth - popupW - 16;
        }

        setPopupStyle({
            top: rect.bottom + gap + window.scrollY,
            left: left,
            width: popupW,
        });
    }, [showFriends]);

    return (
        <div className="player-status-container">
            {/* Avatar + Name/Rank */}
            <div className="player-header">
                <div className="player-header-left">
                    <div className="avatar-section">
                        <div className="avatar-circle">
                            <span className="avatar-initial">S</span>
                        </div>
                        <div className="avatar-badge">Lvl 1</div>
                    </div>
                    <div className="player-meta">
                        <h3 className="player-name">{username}</h3>
                        <p className="player-rank">E-Rank Trainee</p>
                    </div>
                </div>

                {/* ── Rangers button – right side of header ── */}
                <button
                    ref={triggerRef}
                    className={`friends-trigger-btn${showFriends ? " active" : ""}`}
                    onClick={() => setShowFriends(v => !v)}
                    title="Rangers / Friends"
                >
                    🤝 <span className="friends-trigger-label">Rangers</span>
                </button>
            </div>

            {/* EXP */}
            <div className="exp-section">
                <div className="exp-row">
                    <span>Level 1</span>
                    <span>EXP 0 / 100</span>
                </div>
                <div className="exp-bar">
                    <div className="exp-fill" />
                </div>
            </div>

            {/* Combat Stats */}
            <h4 className="stats-title">Combat Stats</h4>
            <div className="stats-grid">
                <div className="stat-item">
                    <div className="stat-header"><span>💪 Strength</span><span>1</span></div>
                    <div className="stat-bar"><div className="stat-bar-fill"></div></div>
                </div>
                <div className="stat-item">
                    <div className="stat-header"><span>🧠 Intellect</span><span>1</span></div>
                    <div className="stat-bar"><div className="stat-bar-fill"></div></div>
                </div>
                <div className="stat-item">
                    <div className="stat-header"><span>⚡️ Discipline</span><span>1</span></div>
                    <div className="stat-bar"><div className="stat-bar-fill"></div></div>
                </div>
                <div className="stat-item">
                    <div className="stat-header"><span>❤️ Vitality</span><span>1</span></div>
                    <div className="stat-bar"><div className="stat-bar-fill"></div></div>
                </div>
                <div className="stat-item">
                    <div className="stat-header"><span>🎯 Focus</span><span>1</span></div>
                    <div className="stat-bar"><div className="stat-bar-fill"></div></div>
                </div>
            </div>

            {/* Floating Friends Panel – rendered via Portal so it escapes all stacking contexts */}
            {showFriends && createPortal(
                <div className="friends-popup-portal" style={popupStyle}>
                    <FriendsPanel onClose={() => setShowFriends(false)} />
                </div>,
                document.body
            )}
        </div>
    );
}

export default PlayerStatusPanel;