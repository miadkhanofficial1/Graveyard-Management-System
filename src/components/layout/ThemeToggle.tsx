import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  floating?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ floating = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 active:scale-90 ${
        floating
          ? 'fixed bottom-6 right-6 z-50 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-white/15'
          : 'bg-white/40 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-xl'
      }`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform duration-500 group-hover:-rotate-45 group-hover:scale-110" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

