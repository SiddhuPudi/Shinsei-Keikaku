import "./Home.css";
import DashboardHeader from "../components/DashboardHeader.jsx";
import PlayerStatusPanel from "../components/PlayerStatusPanel.jsx";
import QuickAccessGrid from "../components/QuickAccessGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Home() {
    const { user, isAuthenticated } = useAuth();
    const username = user?.username || "Player";

    if (!isAuthenticated) {
        return (
            <div className = "hero-container">
                <div className = "hero-card">
                    <div className = "home-logo-box">
                        <span className = "home-logo-kanji">新</span>
                    </div>
                    <h1 className = "hero-title hero-title-glow">
                        Shinsei Keikaku
                    </h1>
                    <p className = "hero-subtitle">Track. Grow. Evolve. Your Journey Starts Here</p>
                    <div className = "hero-btns">
                        <button className = "hero-btn signin-btn">Sign In</button>
                        <button className = "hero-btn signup-btn">Sign Up</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className = "dashboard-container">
            <DashboardHeader username = { username } />

            <div className = "dashboard-main">
                <div className = "dashb oard-left">
                    <PlayerStatusPanel username = { username } />
                </div>

                <div className = "dashboard-right">
                    <div className = "quick-explore-container">
                        <h3 className = "quick-title">Quick Access</h3>
                        <QuickAccessGrid />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home;