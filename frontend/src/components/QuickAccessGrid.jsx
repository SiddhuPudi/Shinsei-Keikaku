import QuickAccessCard from "./QuickAccessCard";
import "./QuickAccess.css";

function QuickAccessGrid() {
    return (
        <div className = "quick-grid">
            <QuickAccessCard
                icon = "🗓️"
                title = "Daily Tracking"
                desc = "Log your sleep, habits, study & wake time."
            />
            <QuickAccessCard 
                icon = "📜"
                title = "Quest Log"
                desc = "Track daily, weekly and long-term quests."
            />
            <QuickAccessCard
                icon = "📊"
                title = "Analytics"
                desc = "View montly & yearly performance reports."
            />
            <QuickAccessCard
                icon = "💰"
                title = "Finance Tracker"
                desc = "Manage expenses, income and gold balance."
            />
        </div>
    );
}

export default QuickAccessGrid;