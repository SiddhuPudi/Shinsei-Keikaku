import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if(loading) {
        return(
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#020617",
                    color: "#8be8ff",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                }}
            >
                Loading...
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return children;
}

export default ProtectedRoute;