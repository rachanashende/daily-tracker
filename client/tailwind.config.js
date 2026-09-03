/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Quicksand", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        blush: {
          50: "#fff5f8",
          100: "#ffe4ef",
          200: "#fecdde",
          300: "#fda4c0",
          400: "#fb7aa3",
          500: "#f4548a",
          600: "#e13577",
          700: "#bf2563",
          800: "#9e2154",
          900: "#841f4a",
        },
        lavender: {
          50: "#f8f6ff",
          100: "#f0ebff",
          200: "#e1d6fe",
          300: "#cbb8fc",
          400: "#b08ff8",
          500: "#9966f0",
          600: "#8147df",
          700: "#6c34bc",
          800: "#5a2c98",
          900: "#4a2679",
        },
        cream: {
          50: "#fffdf8",
          100: "#fff8ec",
          200: "#ffefd1",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(244, 84, 138, 0.12)",
        "soft-lg": "0 10px 40px -4px rgba(153, 102, 240, 0.18)",
        glow: "0 0 0 4px rgba(244, 84, 138, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "pop": "pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "wiggle": "wiggle 0.4s ease-in-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { transform: "scale(0.9)" }, "60%": { transform: "scale(1.05)" }, "100%": { transform: "scale(1)" } },
        wiggle: { "0%,100%": { transform: "rotate(-2deg)" }, "50%": { transform: "rotate(2deg)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
    },
  },
  plugins: [],
};
