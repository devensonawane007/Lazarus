import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-surface-raised)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.15s ease"
      }}
    >
      {isDark ? (
        <Sun size={16} style={{ color: "#f59e0b" }} />
      ) : (
        <Moon size={16} style={{ color: "#8b5cf6" }} />
      )}
      {showLabel && (
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </button>
  );
}
