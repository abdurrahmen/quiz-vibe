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
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },

      boxShadow: {
        ambient: "0 4px 20px rgba(26, 26, 46, 0.05)",
        "ambient-lg": "0 8px 30px rgba(26, 26, 46, 0.1)",
        primary: "0 4px 14px rgba(77, 65, 223, 0.25)",
        "primary-lg": "0 6px 20px rgba(77, 65, 223, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
