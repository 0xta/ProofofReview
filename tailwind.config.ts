import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        white: {
          "primary": "#ea580c",
          "secondary": "#f97316",
          "accent": "#d97706",
          "neutral": "#f1f5f9",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
        },
        warm: {
          "primary": "#d97706",
          "secondary": "#ea580c",
          "accent": "#b45309",
          "neutral": "#faedd9",
          "base-100": "#fbf5eb",
          "base-200": "#f5ebe0",
          "base-300": "#e6ccb2",
          "base-content": "#3b2314",
        },
        dark: {
          "primary": "#f97316",
          "secondary": "#fb923c",
          "accent": "#f59e0b",
          "neutral": "#1e293b",
          "base-100": "#020617",
          "base-200": "#0f172a",
          "base-300": "#1e293b",
          "base-content": "#f8fafc",
        },
      },
    ],
    defaultTheme: "dark",
  },
};
export default config;
