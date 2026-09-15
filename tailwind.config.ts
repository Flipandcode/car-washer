import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B2027",
        surface: "#F6F8F7",
        card: "#FFFFFF",
        primary: {
          50: "#EAF6F5",
          100: "#CFEAE7",
          300: "#7FC4BE",
          500: "#1B7A72",
          600: "#146760",
          700: "#0F544E",
          900: "#0B2027",
        },
        accent: {
          400: "#F2A65A",
          500: "#EB8F3A",
        },
        status: {
          paid: "#1B7A72",
          pending: "#C1440E",
          partial: "#B08900",
          stopped: "#7A7A7A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(11,32,39,0.06)",
        card: "0 4px 16px rgba(11,32,39,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
