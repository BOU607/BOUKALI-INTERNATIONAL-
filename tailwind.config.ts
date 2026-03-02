import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-geist-sans)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdedd6",
          200: "#f9d7ad",
          300: "#f4ba79",
          400: "#ee9343",
          500: "#ea771f",
          600: "#db5d15",
          700: "#b54513",
          800: "#903717",
          900: "#742f16",
          950: "#3f1509",
        },
        ink: {
          950: "#0f0f0f",
          900: "#1a1a1a",
          800: "#2a2a2a",
          700: "#404040",
          600: "#525252",
          500: "#737373",
        },
      },
    },
  },
  plugins: [],
};
export default config;
