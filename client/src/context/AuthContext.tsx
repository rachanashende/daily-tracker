import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../api/endpoints";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dt_user");
    const token = localStorage.getItem("dt_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password });
    localStorage.setItem("dt_token", res.data.token);
    localStorage.setItem("dt_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem("dt_token", res.data.token);
    localStorage.setItem("dt_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  function logout() {
    authApi.logout().catch(() => {});
    localStorage.removeItem("dt_token");
    localStorage.removeItem("dt_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
