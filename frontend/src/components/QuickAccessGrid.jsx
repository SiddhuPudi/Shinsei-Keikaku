import QuickAccessCard from "./QuickAccessCard";
import "./QuickAccess.css";

function QuickAccessGrid() {
    return (
        <div className="quick-grid">
            <QuickAccessCard
                icon="🗓️"
                title="Daily Tracking"
                desc="Log your sleep, habits, study & wake time."
                to="/daily"
            />
            <QuickAccessCard
                icon="📜"
                title="Quest Log"
                desc="Track daily, weekly and long-term quests."
                to="/quests"
            />
            <QuickAccessCard
                icon="📊"
                title="Analytics"
                desc="View montly & yearly performance reports."
                to="/monthly"
            />
            <QuickAccessCard
                icon="💰"
                title="Finance Tracker"
                desc="Manage expenses, income and gold balance."
                to="/finance"
            />
        </div>
    );
}

export default QuickAccessGrid;