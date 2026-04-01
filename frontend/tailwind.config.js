/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agriGreen: '#2E7D32',
        agriLight: '#A5D6A7',
        agriDark: '#1B5E20',
        agriEarth: '#795548',
        agriBg: '#F1F8E9'
      }
    },
  },
  plugins: [],
}
