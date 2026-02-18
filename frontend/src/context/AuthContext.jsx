import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect ( () => {
        const stored = localStorage.getItem("shinsei_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem("shinsei_user");
            }
        }
    }, []);

    const login = ({ username, email }) => {
        const newUser = { username, email };
        setUser(newUser);
        localStorage.setItem("shinsei_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("shinsei_user");
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value = { value }>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}