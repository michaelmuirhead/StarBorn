import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mars: {
          50: "#fff1e8",
          100: "#ffd9bd",
          200: "#ffb88a",
          300: "#ff9056",
          400: "#f56a2e",
          500: "#d04a16",
          600: "#a3370f",
          700: "#7a2a0d",
          800: "#521d0a",
          900: "#2e1006",
        },
        space: {
          900: "#05060c",
          800: "#0a0d18",
          700: "#0f1424",
          600: "#161d33",
          500: "#1e2742",
          400: "#2a3559",
          300: "#3d4a74",
          200: "#5b6896",
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
