/** @type {import('tailwindcss').Config} */
export default {
  // This is the crucial line that enables class-based dark mode
  darkMode: 'class',
  
  // This tells Tailwind to scan all of your component and page files
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
}