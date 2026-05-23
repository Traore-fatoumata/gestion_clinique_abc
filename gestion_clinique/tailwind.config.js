/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          500: '#0A9E8A',
          600: '#0D9E8A',
          700: '#0B8A78',
        },
        navy: {
          800: '#0B1F3A',
          900: '#071628',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}