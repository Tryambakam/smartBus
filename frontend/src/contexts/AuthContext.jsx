import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE, apiFetch } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cross-reference session organically against secure httpOnly cookies
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (identity, password) => {
    const data = await apiFetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, password })
    });
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, mobile, state, district, password) => {
    const data = await apiFetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, state, district, password })
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch(`/api/auth/logout`, { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
