"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Load & apply saved preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const shouldDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(shouldDark);
    const root = document.documentElement;
    root.classList.toggle("dark", shouldDark);
    if (shouldDark) {
      root.dataset.theme = "dark";
    } else {
      delete root.dataset.theme;
    }
  }, []);

  // Toggle function
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    if (next) {
      root.dataset.theme = "dark";
    } else {
      delete root.dataset.theme;
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-xl px-3 py-2 text-sm border border-[var(--color-border)] bg-surface shadow-sm hover:opacity-90 transition"
      aria-label="Toggle dark mode"
      title="Toggle dark / light"
    >
      {isDark ? "🌙 Dark" : "🌤️ Light"}
    </button>
  );
}
