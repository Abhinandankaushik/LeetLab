import * as React from "react";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeState | null>(null);

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("leetlab-theme", t); } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useEffect(() => {
    let initial: Theme = "dark";
    try {
      const saved = localStorage.getItem("leetlab-theme") as Theme | null;
      if (saved === "dark" || saved === "light") initial = saved;
      else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) initial = "light";
    } catch {}
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
