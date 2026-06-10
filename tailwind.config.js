/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211a",
        muted: "#657269",
        canvas: "#f4f6f2",
        brand: {
          50: "#edf8f0",
          100: "#d9efdf",
          500: "#278248",
          600: "#1d6838",
          700: "#18542f"
        },
        orange: "#e67e45"
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 33, 26, 0.04), 0 8px 24px rgba(23, 33, 26, 0.05)"
      }
    }
  },
  plugins: []
};
