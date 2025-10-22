"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const darkMode = saved ? saved === "dark" : prefersDark;
      setIsDark(darkMode);
      document.documentElement.classList.toggle("dark", darkMode);
      console.log(`[ThemeToggle] Initialized -> ${darkMode ? "dark" : "light"}`);
    } catch (error) {
      console.error("[ThemeToggle] Failed to initialize theme:", error);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      console.log(`[ThemeToggle] Switched -> ${next ? "dark" : "light"}`);
    } catch (error) {
      console.error("[ThemeToggle] Failed to toggle theme:", error);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-xl px-3 py-2 text-sm border border-default bg-surface shadow-sm hover:opacity-90 transition"
    >
      {isDark ? "🌙 Dark" : "🌤️ Light"}
    </button>
  );
}
