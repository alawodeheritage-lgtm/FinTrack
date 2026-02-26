/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // 1. IMPORTANT: Set to 'class' to enable manual toggling
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 2. These match your specific hex choices
        primary: "#1152d4",
        "background-light": "#f6f6f8",
        "background-dark": "#050b18", // Updated to match your Home.jsx
        "card-dark": "#0f172a",
      },
      fontFamily: {
        // Ensuring Manrope or standard sans-serif is used
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        // Custom glow for that "Pro" feel in dark mode
        'glow': '0 0 20px rgba(17, 82, 212, 0.15)',
      }
    },
  },
  plugins: [],
};