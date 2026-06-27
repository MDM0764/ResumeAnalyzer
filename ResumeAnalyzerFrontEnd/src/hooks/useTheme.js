import { useState, useEffect } from "react";

const useTheme = (darkBg = "#43454a") => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const themeStyles = theme === "dark"
    ? { background: darkBg, color: "#eee", muted: "#888" }
    : { background: "#fff", color: "#111", muted: "#666" };

  return { theme, setTheme, themeStyles };
};

export default useTheme;