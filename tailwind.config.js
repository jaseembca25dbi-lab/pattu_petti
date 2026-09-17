/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        script: ['"Caveat"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#0b080a', // deep espresso noir
          900: '#130c11', // dark wine surface
          850: '#1a1017',
          800: '#22151f',
          700: '#2f1e2b',
          600: '#3f2a3a',
        },
        espresso: {
          950: '#090608',
          900: '#0f0a0d',
          800: '#171015',
          700: '#22171f',
          600: '#31212c',
        },
        rose: {
          50: '#fdf6f4',
          100: '#faece8',
          200: '#f4dad3',
          300: '#eabfb5',
          400: '#e29d8f', // primary editorial peach rose
          500: '#d77c6b',
          600: '#c25c49',
          700: '#a34735',
          800: '#873c2f',
        },
        terracotta: {
          DEFAULT: '#e29d8f',
          light: '#f0b5a8',
          dark: '#c97262',
          subtle: 'rgba(226, 157, 143, 0.15)',
        },
        brand: {
          50: '#fdf6f4',
          400: '#f0b5a8',
          500: '#e29d8f', // redirect brand to terracotta/rose
          600: '#d77c6b',
          700: '#c25c49',
        }
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
