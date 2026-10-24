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
        space: {
          950: '#030712',
          900: '#070b16',
          850: '#0b1120',
          800: '#0f172a',
          700: '#1e293b',
        },
        aurora: {
          green: '#10b981',
          emerald: '#34d399',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          magenta: '#ec4899',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-glow': 'auroraShift 12s ease infinite alternate',
      },
      keyframes: {
        auroraShift: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(60deg)' },
        }
      }
    },
  },
  plugins: [],
}
