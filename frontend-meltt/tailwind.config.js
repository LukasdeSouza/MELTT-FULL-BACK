/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2d1c63",
        secondary: "#db1f8d",
        default: "#342394"
      },
      backgroundColor: {
        primary: "#342394",
        secondary: "#FFE70B"
      }
    },
  },
  plugins: [],
}

