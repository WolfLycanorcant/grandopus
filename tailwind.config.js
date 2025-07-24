/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Game theme colors
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fbd7a5',
          300: '#f8bc6d',
          400: '#f59532',
          500: '#f2750a',
          600: '#e35d05',
          700: '#bc4508',
          800: '#95370e',
          900: '#792f0f',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Unit type colors
        warrior: '#dc2626',
        archer: '#16a34a',
        mage: '#2563eb',
        cleric: '#eab308',
        rogue: '#7c3aed',
        // Formation colors
        frontRow: '#ef4444',
        backRow: '#3b82f6',
      },
      fontFamily: {
        'game': ['Cinzel', 'serif'],
        'ui': ['Inter', 'sans-serif'],
      },
      animation: {
        'battle-hit': 'battleHit 0.3s ease-in-out',
        'level-up': 'levelUp 0.5s ease-in-out',
        'formation-glow': 'formationGlow 2s ease-in-out infinite',
      },
      keyframes: {
        battleHit: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)', backgroundColor: '#fca5a5' },
          '100%': { transform: 'scale(1)' },
        },
        levelUp: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        formationGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}