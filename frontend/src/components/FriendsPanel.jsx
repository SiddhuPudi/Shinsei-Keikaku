import { useState } from "react";
import "./FriendsPanel.css";

const MOCK_USERS = [
    { id: 1, username: "KairosDawn", rank: "B-Rank Hunter", level: 28, avatar: "K" },
    { id: 2, username: "VoidStriker", rank: "A-Rank Hunter", level: 42, avatar: "V" },
    { id: 3, username: "NeonSage", rank: "C-Rank Trainee", level: 14, avatar: "N" },
    { id: 4, username: "PhoenixRei", rank: "S-Rank Elite", level: 77, avatar: "P" },
    { id: 5, username: "ZephyrKai", rank: "D-Rank Novice", level: 6, avatar: "Z" },
    { id: 6, username: "AstralMind", rank: "B-Rank Hunter", level: 35, avatar: "A" },
    { id: 7, username: "CrimsonAce", rank: "A-Rank Hunter", level: 51, avatar: "C" },
    { id: 8, username: "StarlightYu", rank: "C-Rank Trainee", level: 19, avatar: "S" },
];

const INITIAL_FRIENDS = [
    { id: 10, username: "EchoBlaze", rank: "B-Rank Hunter", level: 31, avatar: "E", online: true },
    { id: 11, username: "LunarFang", rank: "A-Rank Hunter", level: 46, avatar: "L", online: false },
    { id: 12, username: "TideWarden", rank: "C-Rank Trainee", level: 11, avatar: "T", online: true },
];

const INITIAL_REQUESTS = [
    { id: 20, username: "SkyVault", rank: "D-Rank Novice", level: 8, avatar: "S" },
    { id: 21, username: "IronGlyph", rank: "B-Rank Hunter", level: 27, avatar: "I" },
];

export default function FriendsPanel({ onClose }) {
    const [query, setQuery] = useState("");
    const [friends, setFriends] = useState(INITIAL_FRIENDS);
    const [requests, setRequests] = useState(INITIAL_REQUESTS);
    const [sentIds, setSentIds] = useState([]);
    const [activeTab, setActiveTab] = useState("friends"); // friends | search | requests
    const [addedPopup, setAddedPopup] = useState(null);

    const filteredUsers = query.trim().length > 0
        ? MOCK_USERS.filter(u =>
            u.username.toLowerCase().includes(query.toLowerCase()) &&
            !friends.find(f => f.id === u.id)
        )
        : [];

    function sendRequest(user) {
        setSentIds(prev => [...prev, user.id]);
        setAddedPopup(user.username);
        setTimeout(() => setAddedPopup(null), 2200);
    }

    function acceptRequest(req) {
        setFriends(prev => [...prev, { ...req, online: false }]);
        setRequests(prev => prev.filter(r => r.id !== req.id));
    }

    function declineRequest(req) {
        setRequests(prev => prev.filter(r => r.id !== req.id));
    }

    function removeFriend(id) {
        setFriends(prev => prev.filter(f => f.id !== id));
    }

    const onlineCount = friends.filter(f => f.online).length;

    return (
        <div className="friends-panel">
            {/* Toast */}
            {addedPopup && (
                <div className="friends-toast">
                    ✅ Friend request sent to <strong>{addedPopup}</strong>
                </div>
            )}

            {/* Header */}
            <div className="friends-panel-header">
                <div className="friends-panel-title-row">
                    <h3 className="friends-panel-title">⚔️ Rangers</h3>
                    <div className="friends-header-right">
                        <span className="friends-online-badge">{onlineCount} online</span>
                        {onClose && (
                            <button className="friends-close-btn" onClick={onClose} title="Close">✕</button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="friends-tabs">
                    <button
                        className={`friends-tab${activeTab === "friends" ? " active" : ""}`}
                        onClick={() => setActiveTab("friends")}
                    >
                        Friends
                        <span className="tab-count">{friends.length}</span>
                    </button>
                    <button
                        className={`friends-tab${activeTab === "search" ? " active" : ""}`}
                        onClick={() => setActiveTab("search")}
                    >
                        Search
                    </button>
                    <button
                        className={`friends-tab${activeTab === "requests" ? " active" : ""}`}
                        onClick={() => setActiveTab("requests")}
                    >
                        Requests
                        {requests.length > 0 && (
                            <span className="tab-count pending">{requests.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── FRIENDS TAB ── */}
            {activeTab === "friends" && (
                <div className="friends-list">
                    {friends.length === 0 ? (
                        <p className="friends-empty">No friends yet. Search and add some!</p>
                    ) : (
                        friends.map(f => (
                            <div className="friend-row" key={f.id}>
                                <div className={`friend-avatar${f.online ? " online" : ""}`}>
                                    {f.avatar}
                                    <span className={`online-dot${f.online ? " active" : ""}`} />
                                </div>
                                <div className="friend-info">
                                    <span className="friend-name">{f.username}</span>
                                    <span className="friend-rank">{f.rank} · Lvl {f.level}</span>
                                </div>
                                <button
                                    className="friend-action-btn remove-btn"
                                    title="Remove friend"
                                    onClick={() => removeFriend(f.id)}
                                >✕</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── SEARCH TAB ── */}
            {activeTab === "search" && (
                <div className="friends-search-tab">
                    <div className="friends-search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="friends-search-input"
                            placeholder="Search players by username…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button className="search-clear" onClick={() => setQuery("")}>✕</button>
                        )}
                    </div>

                    <div className="search-results">
                        {query.trim() === "" ? (
                            <p className="friends-empty">Type a username to discover players.</p>
                        ) : filteredUsers.length === 0 ? (
                            <p className="friends-empty">No players found for "<em>{query}</em>"</p>
                        ) : (
                            filteredUsers.map(u => {
                                const sent = sentIds.includes(u.id);
                                const alreadyFriend = friends.find(f => f.id === u.id);
                                return (
                                    <div className="friend-row" key={u.id}>
                                        <div className="friend-avatar">{u.avatar}</div>
                                        <div className="friend-info">
                                            <span className="friend-name">{u.username}</span>
                                            <span className="friend-rank">{u.rank} · Lvl {u.level}</span>
                                        </div>
                                        <button
                                            className={`friend-action-btn add-btn${sent || alreadyFriend ? " sent" : ""}`}
                                            disabled={sent || !!alreadyFriend}
                                            onClick={() => sendRequest(u)}
                                        >
                                            {alreadyFriend ? "Friends" : sent ? "Sent ✓" : "+ Add"}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ── REQUESTS TAB ── */}
            {activeTab === "requests" && (
                <div className="friends-list">
                    {requests.length === 0 ? (
                        <p className="friends-empty">No pending friend requests.</p>
                    ) : (
                        requests.map(r => (
                            <div className="friend-row" key={r.id}>
                                <div className="friend-avatar">{r.avatar}</div>
                                <div className="friend-info">
                                    <span className="friend-name">{r.username}</span>
                                    <span className="friend-rank">{r.rank} · Lvl {r.level}</span>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="friend-action-btn add-btn"
                                        onClick={() => acceptRequest(r)}
                                    >✓</button>
                                    <button
                                        className="friend-action-btn remove-btn"
                                        onClick={() => declineRequest(r)}
                                    >✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
