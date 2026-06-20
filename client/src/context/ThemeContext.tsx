import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { settingsApi } from "../api/endpoints";
import { useAuth } from "./AuthContext";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("dt_theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("dt_theme", theme);
  }, [theme]);

  // Load saved theme preference from backend once logged in
  useEffect(() => {
    if (!user) return;
    settingsApi
      .get()
      .then((res) => {
        if (res.data?.theme) setTheme(res.data.theme);
      })
      .catch(() => {});
  }, [user]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (user) {
      settingsApi.update({ theme: next }).catch(() => {});
    }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
