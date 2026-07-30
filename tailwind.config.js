/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        offwhite: "#F8F6F2",
        cream: "#FCFBF8",
        greige: {
          100: "#F1EDE6",
          200: "#E7E1D7",
          300: "#D8D0C3",
          400: "#C2B8A8",
        },
        taupe: {
          400: "#A99E90",
          500: "#948A7C",
          600: "#847A6D",
          700: "#6E655A",
        },
        ink: {
          DEFAULT: "#2E2B26",
          soft: "#5C564E",
          mute: "#8A8378",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 14px rgba(60, 52, 40, 0.07)",
        lift: "0 8px 28px rgba(60, 52, 40, 0.12)",
      },
      borderRadius: {
        xl2: "1.35rem",
        xl3: "1.75rem",
      },
    },
  },
  plugins: [],
};
