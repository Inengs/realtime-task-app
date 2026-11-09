import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../axios/api";

// Types
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// 1. Create the context with a default value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 2. Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in (via JWT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login function — save JWT after successful login
  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    const response = await api.post("/auth/login", credentials);
    localStorage.setItem("token", response.data.token);
    const res = await api.get("/auth/me");
    setUser(res.data.user);
  };

  // Logout function — clear token from localStorage
  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore errors — we're logging out anyway
    }
    localStorage.removeItem("token");
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}