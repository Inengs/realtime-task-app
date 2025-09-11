import { createContext, useContext, useState, useEffect } from "react";
import api from "../api"; // your axios instance

// 1. Create the context
const AuthContext = createContext();

// 2. Create a provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // logged-in user info
    const [loading, setLoading] = useState(true); // for initial check

    // On app load, check if user is already logged in (via cookie/session)
    useEffect(() => {
        api.get("/auth/me") // backend route that returns current user
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    // Login function (call backend)
    const login = async (credentials) => {
        const res = await api.post("/auth/login", credentials);
        setUser(res.data.user);
    };

    // Logout function
    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Helper hook for easy usage
export function useAuth() {
    return useContext(AuthContext);
}
