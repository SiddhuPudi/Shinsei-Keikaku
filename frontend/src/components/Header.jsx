import { Link } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const displayName = user?.username || "Guest";
    return (
        <header className = "nav-container">
            {/* Logo + Title */}
            <Link to ="/" className = "nav-left">
                <div className = "logo-box">
                    <span className = "logo-kanji">新</span>
                </div>
                <h1 className = "nav-title">Shinsei Keikaku</h1>
            </Link>

            {/* Center Navigation Links only when logged in */}
            {isAuthenticated && (
                <nav className = "nav-links">
                    <Link to = "/daily">Daily</Link>
                    <Link to = "/quests">Quests</Link>
                    <Link to = "/achievements">Achievements</Link>
                    <Link to = "/weekly">Weekly</Link>
                    <Link to = "/monthly">Monthly</Link>
                    <Link to = "/yearly">Yearly</Link>
                    <Link to = "/finance">Finance</Link>
                    <Link to = "/settings">Settings</Link>
                </nav>
            )}

            {/* Right side Auth buttons */}
            <div className = "nav-right">
                {isAuthenticated ? (
                    <>
                        <span className = "nav-username">👤 {displayName}</span>
                        <button className = "logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to = "/auth" className = "account-btn">
                            Login
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
export default Header;