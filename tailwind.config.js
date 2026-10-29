/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkMuted: '#334155',
        lightBg: '#F8FAFC',
        lightCard: '#FFFFFF',
        accentGold: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        accentEmerald: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.3)',
        'glow-gold': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
