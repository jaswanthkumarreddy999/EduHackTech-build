/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Learning" Context Colors (Professional Blue)
        learn: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        // "Competition" Context Colors (Energetic Purple/Dark)
        comp: {
          50: '#faf5ff',
          100: '#f3e8ff',
          600: '#9333ea',
          900: '#581c87',
        },
        // Neutral "Big Tech" grays
        slate: {
          850: '#1e293b', // Custom dark background
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Professional font stack
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        shrink: 'shrink 4s linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}