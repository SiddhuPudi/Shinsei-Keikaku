import { useNavigate } from "react-router-dom";
import "./QuickAccess.css";

function QuickAccessCard({ icon, title, desc, to }) {
    const navigate = useNavigate();

    return (
        <div className="quick-card" onClick={() => to && navigate(to)} style={{ cursor: to ? "pointer" : "default" }}>
            <div className="quick-card-icon">{icon}</div>
            <div className="quick-card-text">
                <h4>{title}</h4>
                <p>{desc}</p>
            </div>
            <div className="quick-card-arrow">→</div>
        </div>
    );
}

export default QuickAccessCard;