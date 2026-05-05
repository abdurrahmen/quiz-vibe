import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4d41df",
        "primary-container": "#675df9",
        "primary-fixed": "#e3dfff",
        "primary-fixed-dim": "#c4c0ff",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#100069",
        "on-primary-fixed-variant": "#3622ca",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#c4c0ff",

        secondary: "#b0284b",
        "secondary-container": "#fd6483",
        "secondary-fixed": "#ffd9dd",
        "secondary-fixed-dim": "#ffb2bc",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#670023",
        "on-secondary-fixed": "#400012",
        "on-secondary-fixed-variant": "#8f0935",

        tertiary: "#2949e1",
        "tertiary-container": "#4865fb",
        "tertiary-fixed": "#dee0ff",
        "tertiary-fixed-dim": "#bac3ff",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fffbff",
        "on-tertiary-fixed": "#00105b",
        "on-tertiary-fixed-variant": "#002eca",

        background: "#fcf8ff",
        "on-background": "#1b1b24",

        surface: "#fcf8ff",
        "surface-bright": "#fcf8ff",
        "surface-dim": "#dcd8e5",
        "surface-variant": "#e4e1ee",
        "surface-container": "#f0ecf9",
        "surface-container-low": "#f6f2ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#eae6f3",
        "surface-container-highest": "#e4e1ee",
        "surface-tint": "#4f44e2",
        "on-surface": "#1b1b24",
        "on-surface-variant": "#464555",
        "inverse-surface": "#302f39",
        "inverse-on-surface": "#f3effc",

        outline: "#777587",
        "outline-variant": "#c7c4d8",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      boxShadow: {
        ambient: "0 2px 16px rgba(26, 26, 46, 0.04), 0 1px 4px rgba(26, 26, 46, 0.03)",
        "ambient-lg": "0 8px 32px rgba(26, 26, 46, 0.08), 0 2px 8px rgba(26, 26, 46, 0.04)",
        primary: "0 4px 16px rgba(77, 65, 223, 0.2)",
        "primary-lg": "0 8px 24px rgba(77, 65, 223, 0.3)",
      },
      animation: {
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
      keyframes: {
        moveHorizontal: {
          "0%": { transform: "translateX(-50%) translateY(-10%)" },
          "50%": { transform: "translateX(50%) translateY(10%)" },
          "100%": { transform: "translateX(-50%) translateY(-10%)" },
        },
        moveInCircle: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        moveVertical: {
          "0%": { transform: "translateY(-50%)" },
          "50%": { transform: "translateY(50%)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
