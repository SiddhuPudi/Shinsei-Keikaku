import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect ( () => {
        const loadUser = async () => {
            const token = localStorage.getItem("shinsei_token");
            if(!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (error) {
                console.error(error);
                localStorage.removeItem("shinsei_token");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem("shinsei_token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("shinsei_token");
        setUser(null);
    };
    
    return <AuthContext.Provider 
        value = {{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user,
        }}
    >
        {children}
    </AuthContext.Provider>;
};

export function useAuth() {
    return useContext(AuthContext);
}