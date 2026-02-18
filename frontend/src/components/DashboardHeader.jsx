import "./DashboardHeader.css";

function DashboardHeader({ username }) {
    return (
        <div className = "dashboard-header">
            <div className = "dashboard-logo-box">
                <span className = "dashboard-logo-kanji">新</span>
            </div>
            <div className = "dashboard-header-text">
                <h2>Welcome back, {username}</h2>
                <p>Your stats, quests and progress at a glance.</p>
            </div>
        </div>
    );
}
export default DashboardHeader;