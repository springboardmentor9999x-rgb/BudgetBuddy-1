import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("access_token");
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  const loadCurrentUser = async () => {
    const storedToken = sessionStorage.getItem("access_token");

    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to load current user:", error);

      sessionStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL AUTH CHECK
  // ==========================================

  useEffect(() => {
    const storedToken = sessionStorage.getItem("access_token");

    if (storedToken) {
      setToken(storedToken);
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (accessToken) => {
    sessionStorage.setItem("access_token", accessToken);
    setToken(accessToken);

    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to load user after login:", error);
      setUser(null);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    sessionStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  // ==========================================
  // ROLE HELPERS
  // ==========================================

  const role = user?.role || null;

  const isAdmin = role === "admin";
  const isPremium = role === "premium";
  const isNormal = role === "normal";

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,

        isAdmin,
        isPremium,
        isNormal,

        login,
        logout,

        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export default AuthContext;


