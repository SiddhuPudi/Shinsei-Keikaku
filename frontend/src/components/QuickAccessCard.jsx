import "./QuickAccess.css";

function QuickAccessCard({ icon, title, desc}) {
    return (
        <div className = "quick-card">
            <div className = "quick-card-icon">{icon}</div>
            <div className = "quick-card-text">
                <h4>{title}</h4>
                <p>{desc}</p>
            </div>
            <div className = "quick-card-arrow">→</div>
        </div>
    )
}

export default QuickAccessCard;