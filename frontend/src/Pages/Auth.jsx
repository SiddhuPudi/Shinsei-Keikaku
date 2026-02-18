import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

function Auth() {
    const [mode, setMode] = useState("login");
    const isLogin = mode === "login";
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleToLogin = () => setMode("login");
    const handleToRegister = () => setMode("register");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess]  = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(mode, data);
        const username = data.username || data.email.split("@")[0];
        setTimeout(() => {
            login({ username, email: data.email });
            setIsSuccess(true);
            setTimeout(() => {
                navigate("/daily");
            }, 900);
        }, 800);
    };
    return (
        <div className = "auth-page">
            <div className = {`auth-card auth-${mode} ${isSubmitting ? "auth-loading" : ""}`}>

                {/* Sliding Panel */}
                <div className = "auth-slider"></div>

                {isSuccess && (
                    <div className = "auth-success-overlay">
                        <div className = "auth-success-box">
                            <div className = "auth-checkmark">✔</div>
                                <h3>System Approved</h3>
                                <p>Welcome to Shinsei Keikaku</p>
                        </div>
                    </div>
                )}

                {/* Content columns */}
                <div className = "auth-columns">
                    {/* LEFT COLUMN */}
                    <div className = "auth-column auth-column-left">
                        {isLogin ? (
                            <form className = "auth-form" onSubmit={handleSubmit}>
                                <h3>Sign In</h3>
                                <p className = "auth-subtext">Use you account credentials</p>
                                <label>
                                    <span>Email</span>
                                    <input name = "email" type = "email" placeholder="you@example.com" required />
                                </label>
                                <label>
                                    <span>Password</span>
                                    <input name = "password" type = "password" placeholder = "********" required />
                                </label>
                                <button type = "submit" className = "auth-primary-btn" disabled = {isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Sign In"}
                                </button>
                                <button type = "button" className = "auth-switch-link" onClick={handleToRegister}>
                                    Need an account? Sign up
                                </button>
                            </form>
                        ) : (
                            <div className = "auth-side-message">
                                <h3>Already have an account?</h3>
                                <p>Sign in to sync your stats and continue your streaks.</p>
                                <button type = "button" className = "auth-outline-btn" onClick = {handleToLogin}>
                                    Switch to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                    {/* RIGHT COLUMN */}
                    <div className = "auth-column auth-column-right">
                        {isLogin ? (
                            <div className = "auth-side-message">
                                <h3>New here?</h3>
                                <p>Create an account to start tracking your evolution.</p>
                                <button type = "button" className = "auth-outline-btn" onClick = {handleToRegister}>
                                    Switch to Sign Up
                                </button>
                            </div>
                        ) : (
                            <form className = "auth-form" onSubmit = {handleSubmit}>
                                <h3>Create Account</h3>
                                <p className = "auth-subtext">Join Shinsei Keikaku with your Email</p>

                                <label>
                                    <span>Username</span>
                                    <input name = "username" type = "text" placeholder = "player name" required />
                                </label>
                                <label>
                                    <span>Email</span>
                                    <input name = "email" type = "email" placeholder = "you@example.com" required />
                                </label>
                                <label>
                                    <span>Password</span>
                                    <input name = "password" type = "password" placeholder = "********" required />
                                </label>
                                <button type = "submit" className = "auth-primary-btn" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Sign Up"}
                                </button>
                                <button type = "button" className = "auth-switch-link" onClick = {handleToLogin}>
                                    Already have an account? Sign In
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;