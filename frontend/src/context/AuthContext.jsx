import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ss_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback((token, userData) => {
    localStorage.setItem("ss_token", token);
    localStorage.setItem("ss_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signup = useCallback(
    async ({ name, email, password, phone }) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/signup", { name, email, password, phone });
        persistSession(data.token, data.user);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Signup failed. Please try again.",
        };
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", { email, password });
        persistSession(data.token, data.user);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Login failed. Please try again.",
        };
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, signup, login, logout }),
    [user, loading, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
