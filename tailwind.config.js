/** @type {import('tailwindcss').Config} */
export default {
  // THIS IS THE MOST IMPORTANT LINE
  darkMode: 'class',

  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}