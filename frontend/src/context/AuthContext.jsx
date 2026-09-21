import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("medicare_token") || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("medicare_token");
      const storedUser = localStorage.getItem("medicare_user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }

        try {
          // Verify with backend
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("medicare_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn("Session verification failed or expired", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login({ email, password });
      if (data.success && data.token) {
        localStorage.setItem("medicare_token", data.token);
        localStorage.setItem("medicare_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || "Login failed");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to sign in";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await authService.register(userData);
      if (data.pendingApproval) {
        return {
          success: true,
          pendingApproval: true,
          message: data.message,
          user: data.user,
        };
      }
      if (data.success && data.token) {
        localStorage.setItem("medicare_token", data.token);
        localStorage.setItem("medicare_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, pendingApproval: false, user: data.user };
      }
      throw new Error(data.message || "Registration failed");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("medicare_token");
    localStorage.removeItem("medicare_user");
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("medicare_user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
